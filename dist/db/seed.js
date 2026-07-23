import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { db, pool } from '../config/database.js';
import { BCRYPT_ROUNDS } from '../config/constants.js';
import { libraries } from './schema/libraries.js';
import { users } from './schema/users.js';
import { membershipPlans } from './schema/membership-plans.js';
import { seats } from './schema/seats.js';
import { students } from './schema/students.js';
import { memberships } from './schema/memberships.js';
import { payments } from './schema/payments.js';
import { attendanceSessions } from './schema/attendance-sessions.js';
import { expenses } from './schema/expenses.js';
import { generateQrToken } from '../shared/utils/qr-token.util.js';
async function main() {
    console.log('Seeding database...');
    const passwordHash = await bcrypt.hash('password123', BCRYPT_ROUNDS);
    // 1. Clean existing data (except if not wanted, but seeding is clean)
    await db.delete(attendanceSessions);
    await db.delete(payments);
    await db.delete(memberships);
    await db.delete(expenses);
    await db.delete(students);
    await db.delete(seats);
    await db.delete(membershipPlans);
    await db.delete(users);
    await db.delete(libraries);
    // 2. Insert Library
    const [lib] = await db.insert(libraries).values({
        name: 'ReadSpace Pro',
        slug: 'readspace-pro',
        ownerEmail: 'owner@test.com',
        capacity: 80,
        subscriptionPlan: 'professional',
        subscriptionStatus: 'active',
    }).returning();
    console.log('Created Library:', lib?.name);
    const libraryId = lib.id;
    // 3. Insert Users
    const [owner] = await db.insert(users).values({
        libraryId,
        name: 'Rahul Sharma',
        email: 'owner@test.com',
        phone: '+919876511001',
        passwordHash,
        role: 'owner',
    }).returning();
    const [receptionist] = await db.insert(users).values({
        libraryId,
        name: 'Sunita Devi',
        email: 'receptionist@test.com',
        phone: '+919876511002',
        passwordHash,
        role: 'receptionist',
    }).returning();
    console.log('Created Owner & Receptionist');
    // 4. Insert Plans
    const [monthlyPlan] = await db.insert(membershipPlans).values({
        libraryId,
        name: 'Monthly Plan',
        type: 'monthly',
        price: '1200.00',
        durationDays: 30,
        isActive: true,
    }).returning();
    const [quarterlyPlan] = await db.insert(membershipPlans).values({
        libraryId,
        name: 'Quarterly Plan',
        type: 'monthly',
        price: '3400.00',
        durationDays: 90,
        isActive: true,
    }).returning();
    const [dailyPlan] = await db.insert(membershipPlans).values({
        libraryId,
        name: 'Daily Plan',
        type: 'monthly',
        price: '150.00',
        durationDays: 1,
        isActive: true,
    }).returning();
    console.log('Created Membership Plans');
    // 5. Insert Extended Seats (20 seats)
    const seatIds = [];
    const seatNumbers = [];
    const sections = ['A', 'B', 'C', 'D'];
    for (const section of sections) {
        for (let i = 1; i <= 5; i++) {
            const num = `${section}-${String(i).padStart(2, '0')}`;
            seatNumbers.push(num);
        }
    }
    for (const seatNumber of seatNumbers) {
        const section = `Section ${seatNumber.charAt(0)}`;
        const [seat] = await db.insert(seats).values({
            libraryId,
            seatNumber,
            section,
            type: seatNumber.endsWith('05') ? 'flexible' : 'fixed',
            status: 'available',
        }).returning();
        seatIds.push(seat.id);
    }
    console.log(`Created ${seatNumbers.length} Seats`);
    // 6. Insert Students & Memberships & Payments
    const studentData = [
        { name: 'Arjun Kumar', phone: '+919876543210', email: 'arjun.kumar@email.com', seatNumber: 'A-01', plan: monthlyPlan, status: 'active', paymentStatus: 'paid' },
        { name: 'Priya Sharma', phone: '+919876543212', email: 'priya.s@email.com', seatNumber: 'A-02', plan: quarterlyPlan, status: 'active', paymentStatus: 'paid' },
        { name: 'Ravi Patel', phone: '+919876543214', email: 'ravi.p@email.com', seatNumber: 'A-03', plan: monthlyPlan, status: 'suspended', paymentStatus: 'pending' },
        { name: 'Sneha Reddy', phone: '+919876543216', email: 'sneha.r@email.com', seatNumber: 'B-01', plan: dailyPlan, status: 'active', paymentStatus: 'pending' },
        { name: 'Divya Menon', phone: '+919876543220', email: 'divya.m@email.com', seatNumber: null, plan: monthlyPlan, status: 'active', paymentStatus: 'paid' },
        { name: 'Amit Joshi', phone: '+919876543222', email: 'amit.j@email.com', seatNumber: 'C-01', plan: monthlyPlan, status: 'active', paymentStatus: 'paid' },
        { name: 'Nisha Gupta', phone: '+919876543224', email: 'nisha.g@email.com', seatNumber: 'C-02', plan: dailyPlan, status: 'active', paymentStatus: 'paid' },
        { name: 'Rohit Verma', phone: '+919876543226', email: 'rohit.v@email.com', seatNumber: 'D-01', plan: monthlyPlan, status: 'active', paymentStatus: 'pending' },
        { name: 'Kavita Nair', phone: '+919876543228', email: 'kavita.n@email.com', seatNumber: 'D-02', plan: quarterlyPlan, status: 'active', paymentStatus: 'paid' },
        { name: 'Ananya Iyer', phone: '+919876543232', email: 'ananya.i@email.com', seatNumber: 'A-04', plan: monthlyPlan, status: 'active', paymentStatus: 'paid' },
        { name: 'Vikram Tiwari', phone: '+919876543234', email: 'vikram.t@email.com', seatNumber: 'B-02', plan: monthlyPlan, status: 'active', paymentStatus: 'paid' },
        { name: 'Karan Singh', phone: '+919876543236', email: 'karan.s@email.com', seatNumber: 'C-03', plan: monthlyPlan, status: 'active', paymentStatus: 'paid' },
        { name: 'Meera Krishnan', phone: '+919876543238', email: 'meera.k@email.com', seatNumber: null, plan: quarterlyPlan, status: 'active', paymentStatus: 'paid' },
        { name: 'Deepak Choudhary', phone: '+919876543240', email: 'deepak.c@email.com', seatNumber: 'B-03', plan: dailyPlan, status: 'active', paymentStatus: 'pending' },
        { name: 'Suresh Pillai', phone: '+919876543242', email: 'suresh.p@email.com', seatNumber: 'D-03', plan: monthlyPlan, status: 'suspended', paymentStatus: 'pending' },
    ];
    for (let i = 0; i < studentData.length; i++) {
        const s = studentData[i];
        const studentId = crypto.randomUUID();
        const qrToken = generateQrToken(studentId, libraryId);
        let seatId = null;
        if (s.seatNumber) {
            const idx = seatNumbers.indexOf(s.seatNumber);
            if (idx !== -1) {
                seatId = seatIds[idx];
            }
        }
        const [student] = await db.insert(students).values({
            id: studentId,
            libraryId,
            name: s.name,
            phone: s.phone,
            email: s.email,
            status: s.status,
            seatId,
            qrToken,
            createdBy: owner.id,
        }).returning();
        await db.insert(users).values({
            libraryId,
            name: s.name,
            email: s.email,
            phone: s.phone,
            passwordHash,
            role: 'student',
        });
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 25);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + (s.plan.durationDays ?? 30));
        const [membership] = await db.insert(memberships).values({
            libraryId,
            studentId: student.id,
            planId: s.plan.id,
            type: 'monthly',
            status: s.status === 'suspended' ? 'suspended' : 'active',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            isCurrent: true,
            createdBy: owner.id,
        }).returning();
        // Create initial payment
        const paymentDate = new Date(startDate);
        paymentDate.setDate(paymentDate.getDate() + 1);
        let dueDate = null;
        if (s.paymentStatus === 'pending') {
            const due = new Date();
            due.setDate(due.getDate() - 5);
            dueDate = due.toISOString().split('T')[0];
        }
        await db.insert(payments).values({
            libraryId,
            studentId: student.id,
            membershipId: membership.id,
            amount: s.plan.price,
            method: s.paymentStatus === 'pending' ? 'cash' : 'upi',
            status: s.paymentStatus,
            paymentDate: paymentDate.toISOString().split('T')[0],
            dueDate,
            recordedBy: owner.id,
        });
        // Create second payment (renewal for monthly plans)
        if (s.plan.type === 'monthly' && s.plan.durationDays === 30 && s.status === 'active') {
            const prevPayDate = new Date(startDate);
            prevPayDate.setDate(prevPayDate.getDate() - 28);
            await db.insert(payments).values({
                libraryId,
                studentId: student.id,
                membershipId: membership.id,
                amount: s.plan.price,
                method: 'upi',
                status: 'paid',
                paymentDate: prevPayDate.toISOString().split('T')[0],
                recordedBy: owner.id,
            });
        }
        if (seatId && s.status === 'active') {
            await db.update(seats).set({ status: 'occupied' }).where(eq(seats.id, seatId));
        }
        // Generate 30 days of attendance history for active students
        if (s.status === 'active') {
            const today = new Date();
            for (let dayOffset = 1; dayOffset <= 25; dayOffset++) {
                const sessionDate = new Date(today);
                sessionDate.setDate(sessionDate.getDate() - dayOffset);
                if (sessionDate.getDay() === 0)
                    continue; // skip Sundays
                const checkInHour = 8 + Math.floor(Math.random() * 3);
                const checkOutHour = checkInHour + 5 + Math.floor(Math.random() * 4);
                const checkIn = new Date(sessionDate);
                checkIn.setHours(checkInHour, Math.random() * 60, 0, 0);
                const checkOut = new Date(sessionDate);
                checkOut.setHours(Math.min(checkOutHour, 22), Math.random() * 60, 0, 0);
                const durationMinutes = Math.round((checkOut.getTime() - checkIn.getTime()) / 60000);
                if (durationMinutes < 30)
                    continue;
                // 30% chance of skipping a day (absent)
                if (Math.random() < 0.3)
                    continue;
                await db.insert(attendanceSessions).values({
                    libraryId,
                    studentId: student.id,
                    membershipId: membership.id,
                    checkInAt: checkIn,
                    checkOutAt: checkOut,
                    durationMinutes,
                    checkInMethod: 'qr',
                    checkOutMethod: 'qr',
                });
            }
            // Current session for Arjun, Divya, Ananya, Vikram
            if (['Arjun Kumar', 'Divya Menon', 'Ananya Iyer', 'Vikram Tiwari'].includes(s.name)) {
                const nowIn = new Date();
                nowIn.setHours(nowIn.getHours() - 2 - Math.floor(Math.random() * 3));
                await db.insert(attendanceSessions).values({
                    libraryId,
                    studentId: student.id,
                    membershipId: membership.id,
                    checkInAt: nowIn,
                    checkInMethod: 'qr',
                });
            }
        }
    }
    // 7. Insert Expenses (12 entries across various categories and months)
    const expData = [
        { category: 'rent', amount: '15000.00', description: 'Library Hall Rent - July', dateOffset: 20 },
        { category: 'electricity', amount: '2200.00', description: 'June Electricity Bill', dateOffset: 15 },
        { category: 'internet', amount: '1200.00', description: 'Broadband Bill - July', dateOffset: 10 },
        { category: 'salary', amount: '8000.00', description: 'Receptionist Salary - July (Sunita Devi)', dateOffset: 5 },
        { category: 'maintenance', amount: '3500.00', description: 'AC Repair & Servicing', dateOffset: 18 },
        { category: 'maintenance', amount: '1500.00', description: 'Stationery & Printer Cartridges', dateOffset: 12 },
        { category: 'rent', amount: '15000.00', description: 'Library Hall Rent - June', dateOffset: 25 },
        { category: 'electricity', amount: '1900.00', description: 'May Electricity Bill', dateOffset: 28 },
        { category: 'internet', amount: '1200.00', description: 'Broadband Bill - June', dateOffset: 23 },
        { category: 'salary', amount: '8000.00', description: 'Receptionist Salary - June', dateOffset: 24 },
        { category: 'maintenance', amount: '800.00', description: 'Cleaning Supplies & Water', dateOffset: 17 },
        { category: 'maintenance', amount: '1200.00', description: 'Miscellaneous Repairs', dateOffset: 21 },
        { category: 'maintenance', amount: '1200.00', description: 'Water Purifier Maintenance', dateOffset: 27 },
    ];
    for (const exp of expData) {
        const expDate = new Date();
        expDate.setDate(expDate.getDate() - exp.dateOffset);
        await db.insert(expenses).values({
            libraryId,
            category: exp.category,
            amount: exp.amount,
            description: exp.description,
            expenseDate: expDate.toISOString().split('T')[0],
            recordedBy: owner.id,
        });
    }
    console.log('Created Expenses');
    console.log('Seed completed successfully!');
}
import { eq } from 'drizzle-orm';
main().catch(console.error).finally(() => pool.end());
//# sourceMappingURL=seed.js.map