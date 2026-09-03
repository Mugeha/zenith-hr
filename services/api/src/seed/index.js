const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = require("../config/prisma");

faker.seed(42); // fixed seed: reproducible dataset across resets

const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "People Operations",
  "Finance",
  "Customer Success",
  "Legal",
  "IT",
];

const EMPLOYEE_COUNT = 220;
const DEMO_PASSWORD = "ZenithDemo!2026";
const EMAIL_DOMAIN = "zenithhr-demo.test";

function slug(first, last) {
  return `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "");
}

async function main() {
  console.log("Seeding Zenith HR demo data...");

  await prisma.auditLog.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.savedReportConfig.deleteMany();
  await prisma.document.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.payslip.deleteMany();
  await prisma.payrollRun.deleteMany();
  await prisma.webhook.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  await prisma.company.create({
    data: { name: "Zenith HR Ltd", logoUrl: null },
  });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: `super.admin@${EMAIL_DOMAIN}`,
      passwordHash,
      firstName: "Amina",
      lastName: "Okoro",
      role: "SUPER_ADMIN",
      department: "IT",
      jobTitle: "Super Administrator",
      bio: "Zenith HR platform owner account.",
      nationalId: faker.string.numeric(8),
      bankAccountNo: faker.finance.accountNumber(10),
      bankName: "Equity Bank",
      salaryMonthly: 850000,
      leaveBalance: { create: { annualDays: 24, usedDays: 2 } },
    },
  });

  const hrAdmins = [];
  for (let i = 0; i < 3; i++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const admin = await prisma.user.create({
      data: {
        email: `${slug(first, last)}@${EMAIL_DOMAIN}`,
        passwordHash,
        firstName: first,
        lastName: last,
        role: "HR_ADMIN",
        department: "People Operations",
        jobTitle: "HR Administrator",
        bio: faker.person.bio(),
        nationalId: faker.string.numeric(8),
        bankAccountNo: faker.finance.accountNumber(10),
        bankName: faker.helpers.arrayElement(["Equity Bank", "KCB", "NCBA", "Absa"]),
        salaryMonthly: faker.number.int({ min: 250000, max: 400000 }),
        leaveBalance: { create: { annualDays: 21, usedDays: faker.number.int({ min: 0, max: 10 }) } },
      },
    });
    hrAdmins.push(admin);
  }

  const managers = [];
  for (const dept of DEPARTMENTS) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const manager = await prisma.user.create({
      data: {
        email: `${slug(first, last)}@${EMAIL_DOMAIN}`,
        passwordHash,
        firstName: first,
        lastName: last,
        role: "MANAGER",
        department: dept,
        jobTitle: `${dept} Manager`,
        bio: faker.person.bio(),
        nationalId: faker.string.numeric(8),
        bankAccountNo: faker.finance.accountNumber(10),
        bankName: faker.helpers.arrayElement(["Equity Bank", "KCB", "NCBA", "Absa"]),
        salaryMonthly: faker.number.int({ min: 180000, max: 300000 }),
        leaveBalance: { create: { annualDays: 21, usedDays: faker.number.int({ min: 0, max: 15 }) } },
      },
    });
    managers.push(manager);
  }

  const employees = [];
  for (let i = 0; i < EMPLOYEE_COUNT; i++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const dept = faker.helpers.arrayElement(DEPARTMENTS);
    const manager = managers.find((m) => m.department === dept) || faker.helpers.arrayElement(managers);
    const employee = await prisma.user.create({
      data: {
        email: `${slug(first, last)}.${i}@${EMAIL_DOMAIN}`,
        passwordHash,
        firstName: first,
        lastName: last,
        role: "EMPLOYEE",
        department: dept,
        jobTitle: faker.person.jobTitle(),
        bio: faker.person.bio(),
        nationalId: faker.string.numeric(8),
        bankAccountNo: faker.finance.accountNumber(10),
        bankName: faker.helpers.arrayElement(["Equity Bank", "KCB", "NCBA", "Absa", "Co-op Bank"]),
        salaryMonthly: faker.number.int({ min: 45000, max: 180000 }),
        managerId: manager.id,
        leaveBalance: { create: { annualDays: 21, usedDays: faker.number.int({ min: 0, max: 18 }) } },
      },
    });
    employees.push(employee);
  }

  const allStaff = [superAdmin, ...hrAdmins, ...managers, ...employees];

  // Payroll history: last 6 months
  for (let m = 0; m < 6; m++) {
    const date = new Date();
    date.setMonth(date.getMonth() - m);
    const run = await prisma.payrollRun.create({
      data: {
        periodMonth: date.getMonth() + 1,
        periodYear: date.getFullYear(),
        runByUserId: hrAdmins[0].id,
        status: "COMPLETED",
      },
    });
    for (const staff of allStaff) {
      const gross = staff.salaryMonthly;
      const deductions = Math.round(gross * 0.18);
      await prisma.payslip.create({
        data: {
          userId: staff.id,
          periodMonth: run.periodMonth,
          periodYear: run.periodYear,
          grossPay: gross,
          deductions,
          netPay: gross - deductions,
          payrollRunId: run.id,
        },
      });
    }
  }

  // Leave requests
  for (const staff of employees.slice(0, 80)) {
    const start = faker.date.soon({ days: 60 });
    const end = new Date(start);
    end.setDate(end.getDate() + faker.number.int({ min: 1, max: 5 }));
    await prisma.leaveRequest.create({
      data: {
        userId: staff.id,
        startDate: start,
        endDate: end,
        reason: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(["PENDING", "APPROVED", "REJECTED"]),
        approverId: faker.helpers.arrayElement(managers).id,
      },
    });
  }

  // Expenses
  for (const staff of employees.slice(0, 60)) {
    await prisma.expense.create({
      data: {
        userId: staff.id,
        amount: faker.number.int({ min: 500, max: 45000 }),
        description: faker.commerce.productName() + " reimbursement",
        status: faker.helpers.arrayElement(["PENDING", "APPROVED", "REIMBURSED"]),
      },
    });
  }

  // Performance reviews
  for (const staff of employees.slice(0, 50)) {
    const manager = managers.find((m) => m.department === staff.department) || managers[0];
    await prisma.performanceReview.create({
      data: {
        revieweeId: staff.id,
        reviewerId: manager.id,
        cycle: "2026-H1",
        content: faker.lorem.paragraph(),
        rating: faker.number.int({ min: 1, max: 5 }),
        acknowledged: faker.datatype.boolean(),
      },
    });
  }

  // Support tickets
  for (const staff of employees.slice(0, 25)) {
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: staff.id,
        subject: faker.hacker.phrase(),
        category: faker.helpers.arrayElement(["IT", "HR", "Payroll"]),
        status: faker.helpers.arrayElement(["OPEN", "IN_PROGRESS", "RESOLVED"]),
      },
    });
    await prisma.ticketComment.create({
      data: { ticketId: ticket.id, authorId: staff.id, body: faker.lorem.sentence() },
    });
  }

  console.log(`Seed complete: ${allStaff.length} staff accounts.`);
  console.log(`Demo login password for all seeded accounts: ${DEMO_PASSWORD}`);
  console.log(`Super Admin: super.admin@${EMAIL_DOMAIN}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
