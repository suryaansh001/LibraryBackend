import { membershipPlans } from '../../db/schema/membership-plans.js';
import { MembershipPlanRepository } from './plans.repository.js';
import { toMembershipPlanResponseDTO, toMembershipPlanListItemDTO, type MembershipPlanResponseDTO, type MembershipPlanListItemDTO } from '../../shared/dto/membership-plan.dto.js';
import { AppError } from '../../shared/errors/app-error.js';
import { ERROR_CODES } from '../../shared/errors/error-codes.js';
import type { RequestContext } from '../../shared/types/common.types.js';
import type { CreatePlanBody, UpdatePlanBody, TogglePlanBody, PlanListQuery, PlanIdParam } from './plans.schema.js';

export class MembershipPlanService {
  private readonly planRepository: MembershipPlanRepository;

  public constructor(db: typeof import('../../config/database.js').db) {
    this.planRepository = new MembershipPlanRepository(db);
  }

  public async createPlan(
    body: CreatePlanBody,
    ctx: RequestContext
  ): Promise<MembershipPlanResponseDTO> {
    const plan = await this.planRepository.create({
      libraryId: ctx.libraryId,
      name: body.name,
      type: body.type,
      price: body.price.toString(),
      durationDays: body.durationDays ?? null,
      hoursIncluded: body.hoursIncluded?.toString() ?? null
    });

    return toMembershipPlanResponseDTO(plan);
  }

  public async getPlanById(planId: string, libraryId: string): Promise<MembershipPlanResponseDTO> {
    const plan = await this.planRepository.findById(planId, libraryId);
    if (!plan) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
    }
    return toMembershipPlanResponseDTO(plan);
  }

  public async updatePlan(
    planId: string,
    body: UpdatePlanBody,
    libraryId: string
  ): Promise<MembershipPlanResponseDTO> {
    const existing = await this.planRepository.findById(planId, libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
    }

    const updated = await this.planRepository.update(planId, libraryId, {
      name: body.name,
      price: body.price?.toString(),
      durationDays: body.durationDays,
      hoursIncluded: body.hoursIncluded?.toString()
    });

    if (!updated) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
    }

    return toMembershipPlanResponseDTO(updated);
  }

  public async togglePlan(
    planId: string,
    body: TogglePlanBody,
    libraryId: string
  ): Promise<MembershipPlanResponseDTO> {
    const existing = await this.planRepository.findById(planId, libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
    }

    const updated = await this.planRepository.toggleActive(planId, libraryId, body.isActive);
    if (!updated) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
    }

    return toMembershipPlanResponseDTO(updated);
  }

  public async deletePlan(planId: string, libraryId: string): Promise<void> {
    const existing = await this.planRepository.findById(planId, libraryId);
    if (!existing) {
      throw new AppError(ERROR_CODES.RESOURCE_NOT_FOUND, 'Membership plan not found', 404);
    }

    await this.planRepository.delete(planId, libraryId);
  }

  public async listPlans(
    query: PlanListQuery,
    libraryId: string
  ): Promise<{ data: MembershipPlanListItemDTO[]; total: number }> {
    const offset = (query.page - 1) * query.limit;
    const result = await this.planRepository.list({
      libraryId,
      type: query.type,
      isActive: query.isActive,
      offset,
      limit: query.limit
    });

    return {
      data: result.plans.map(toMembershipPlanListItemDTO),
      total: result.total
    };
  }
}