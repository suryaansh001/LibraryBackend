import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import type { schema } from '../../db/schema/index.js';
import { membershipPlans } from '../../db/schema/membership-plans.js';
import { students } from '../../db/schema/students.js';
import { MembershipRepository } from './memberships.repository.js';
import { AuditLogRepository } from '../../shared/utils/audit-log.repository.js';
import {
  toMembershipResponseDTO,
  toMembershipListItemDTO,
  type MembershipResponseDTO,
  type MembershipListItemDTO
} from '../../shared/dto/membership.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import type {
  CreateMembershipBody,
  UpdateMembershipBody,
  SuspendMembershipBody,
  ReactivateMembershipBody,
  MembershipListQuery
} from './memberships.schema.js';

type Database = NodePgDatabase<typeof schema>;

export class MembershipService {
  private readonly membershipRepository: MembershipRepository;
  private readonly auditLogRepository: AuditLogRepository;

  public constructor(private readonly db: Database) {
    this.membershipRepository = new MembershipRepository(db);
    this.auditLogRepository = new AuditLogRepository(db);
  }

  public async createMembership(
    body: CreateMembershipBody,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<MembershipResponseDTO> {
    const student = await this.db
      .select()
      .from(students)
      .where(and(eq(students.id, body.studentId), eq(students.libraryId, ctx.libraryId)))
      .limit(1);

    if (student[0] === undefined) {
      throw new AppError(ERROR_CODES.STUDENT_NOT_FOUND, 'Student not found', 404);
    }

    let planName: string | null = null;
    let hoursTotal: string | null = body.hoursTotal !== undefined ? String(body.hoursTotal) : null;
    let hoursRemaining: string | null = body.hoursRemaining !== undefined ? String(body.hoursRemaining) : null;

    if (body.planId) {
      const plan = await this.db
        .select()
        .from(membershipPlans)
        .where(and(eq(membershipPlans.id, body.planId), eq(membershipPlans.libraryId, ctx.libraryId)))
        .limit(1);

      if (plan[0] === undefined) {
        throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
      }

      planName = plan[0].name;
      if (body.hoursTotal === undefined) {
        hoursTotal = plan[0].hoursIncluded !== null ? String(plan[0].hoursIncluded) : null;
      }
      if (body.hoursRemaining === undefined) {
        hoursRemaining = plan[0].hoursIncluded !== null ? String(plan[0].hoursIncluded) : null;
      }
    }

    const existingCurrent = await this.membershipRepository.findCurrentByStudent(body.studentId, ctx.libraryId);
    if (existingCurrent) {
      throw new AppError(ERROR_CODES.DUPLICATE_MEMBERSHIP, 'Student already has an active membership', 409);
    }

    const membership = await this.db.transaction(async (tx) => {
      const repo = new MembershipRepository(tx);
      const auditRepo = new AuditLogRepository(tx);

      const created = await repo.create({
        libraryId: ctx.libraryId,
        studentId: body.studentId,
        planId: body.planId ?? null,
        type: body.type,
        startDate: body.startDate,
        endDate: body.endDate ?? null,
        hoursTotal,
        hoursRemaining,
        createdBy: ctx.user?.id ?? null
      }, tx);

      await auditRepo.create({
        libraryId: ctx.libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'CREATE_MEMBERSHIP',
        entityType: 'memberships',
        entityId: created.id,
        newValue: { ...created, planName },
        ipAddress
      }, tx);

      return created;
    });

    const membershipWithPlan = await this.membershipRepository.findById(membership.id, ctx.libraryId);
    if (!membershipWithPlan) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership not found after creation', 404);
    }

    return toMembershipResponseDTO(membershipWithPlan, planName);
  }

  public async listMemberships(
    query: MembershipListQuery,
    libraryId: string
  ): Promise<{ data: MembershipListItemDTO[]; total: number }> {
    const offset = (query.page - 1) * query.limit;
    const result = await this.membershipRepository.list({
      libraryId,
      studentId: query.studentId,
      status: query.status,
      type: query.type,
      isCurrent: query.isCurrent,
      offset,
      limit: query.limit
    });

    return {
      data: result.memberships.map(m => toMembershipListItemDTO(m)),
      total: result.total
    };
  }

  public async getMembershipById(membershipId: string, libraryId: string): Promise<MembershipResponseDTO> {
    const membership = await this.membershipRepository.findById(membershipId, libraryId);
    if (!membership) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership not found', 404);
    }
    return toMembershipResponseDTO(membership, membership.planName ?? null);
  }

  public async updateMembership(
    membershipId: string,
    body: UpdateMembershipBody,
    libraryId: string
  ): Promise<MembershipResponseDTO> {
    const existing = await this.membershipRepository.findById(membershipId, libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership not found', 404);
    }

const existingHoursTotal = existing.hoursTotal !== null && existing.hoursTotal !== undefined ? String(existing.hoursTotal) : null;
    const existingHoursRemaining = existing.hoursRemaining !== null && existing.hoursRemaining !== undefined ? String(existing.hoursRemaining) : null;

    const updated = await this.membershipRepository.update(membershipId, libraryId, {
      endDate: body.endDate ?? (existing.endDate ?? null),
      hoursTotal: body.hoursTotal ?? existingHoursTotal,
      hoursRemaining: body.hoursRemaining ?? existingHoursRemaining
    });

    if (!updated) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership not found after update', 404);
    }

    return toMembershipResponseDTO(updated, existing.planName ?? null);
  }

  public async suspendMembership(
    membershipId: string,
    body: SuspendMembershipBody,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<MembershipResponseDTO> {
    const existing = await this.membershipRepository.findById(membershipId, ctx.libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership not found', 404);
    }

    if (existing.status === 'suspended') {
      throw new AppError(ERROR_CODES.MEMBERSHIP_ALREADY_SUSPENDED, 'Membership is already suspended', 400);
    }

    const updated = await this.db.transaction(async (tx) => {
      const repo = new MembershipRepository(tx);
      const auditRepo = new AuditLogRepository(tx);

      const suspended = await repo.suspend(membershipId, ctx.libraryId, tx);
      if (!suspended) {
        throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership not found', 404);
      }

      await auditRepo.create({
        libraryId: ctx.libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'SUSPEND_MEMBERSHIP',
        entityType: 'memberships',
        entityId: membershipId,
        oldValue: { status: existing.status },
        newValue: { status: 'suspended', reason: body.reason },
        ipAddress
      }, tx);

      return suspended;
    });

    return toMembershipResponseDTO(updated, existing.planName ?? null);
  }

  public async reactivateMembership(
    membershipId: string,
    body: ReactivateMembershipBody,
    ctx: RequestContext,
    ipAddress?: string
  ): Promise<MembershipResponseDTO> {
    const existing = await this.membershipRepository.findById(membershipId, ctx.libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership not found', 404);
    }

    if (existing.status !== 'suspended') {
      throw new AppError(ERROR_CODES.MEMBERSHIP_NOT_SUSPENDED, 'Membership is not suspended', 400);
    }

    const updated = await this.db.transaction(async (tx) => {
      const repo = new MembershipRepository(tx);
      const auditRepo = new AuditLogRepository(tx);

      const reactivated = await repo.reactivate(membershipId, ctx.libraryId, body.newEndDate ?? null, tx);
      if (!reactivated) {
        throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership not found', 404);
      }

      await auditRepo.create({
        libraryId: ctx.libraryId,
        userId: ctx.user?.id,
        requestId: ctx.requestId,
        action: 'REACTIVATE_MEMBERSHIP',
        entityType: 'memberships',
        entityId: membershipId,
        oldValue: { status: existing.status },
        newValue: { status: 'active', newEndDate: body.newEndDate },
        ipAddress
      }, tx);

      return reactivated;
    });

    return toMembershipResponseDTO(updated, existing.planName ?? null);
  }
}

import { and } from 'drizzle-orm';