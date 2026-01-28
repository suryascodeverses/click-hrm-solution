-- CreateEnum
CREATE TYPE "PayslipStatus" AS ENUM ('DRAFT', 'PROCESSED', 'PAID');

-- CreateTable
CREATE TABLE "salary_structures" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "basicSalary" DECIMAL(10,2) NOT NULL,
    "hra" DECIMAL(10,2) NOT NULL,
    "conveyance" DECIMAL(10,2) NOT NULL,
    "medical" DECIMAL(10,2) NOT NULL,
    "specialAllowance" DECIMAL(10,2) NOT NULL,
    "ctc" DECIMAL(10,2) NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "salaryStructureId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "workingDays" INTEGER NOT NULL,
    "presentDays" INTEGER NOT NULL,
    "absentDays" INTEGER NOT NULL,
    "leaveDays" INTEGER NOT NULL,
    "basicPay" DECIMAL(10,2) NOT NULL,
    "hra" DECIMAL(10,2) NOT NULL,
    "conveyance" DECIMAL(10,2) NOT NULL,
    "medical" DECIMAL(10,2) NOT NULL,
    "specialAllowance" DECIMAL(10,2) NOT NULL,
    "bonus" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalEarnings" DECIMAL(10,2) NOT NULL,
    "providentFund" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "professionalTax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "incomeTax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherDeductions" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(10,2) NOT NULL,
    "netPay" DECIMAL(10,2) NOT NULL,
    "status" "PayslipStatus" NOT NULL DEFAULT 'DRAFT',
    "paidOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "salary_structures_employeeId_key" ON "salary_structures"("employeeId");

-- CreateIndex
CREATE INDEX "payslips_employeeId_year_month_idx" ON "payslips"("employeeId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_employeeId_month_year_key" ON "payslips"("employeeId", "month", "year");

-- AddForeignKey
ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_salaryStructureId_fkey" FOREIGN KEY ("salaryStructureId") REFERENCES "salary_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
