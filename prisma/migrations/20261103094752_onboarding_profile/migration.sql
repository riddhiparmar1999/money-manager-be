-- CreateTable
CREATE TABLE "IncomeProfile" (
    "userId" TEXT NOT NULL,
    "monthlySalary" DECIMAL(12,2) NOT NULL,
    "salaryDate" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,

    CONSTRAINT "IncomeProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "FinancialGoal" (
    "userId" TEXT NOT NULL,
    "savingsTarget" DECIMAL(12,2) NOT NULL,
    "initialBalance" DECIMAL(12,2),

    CONSTRAINT "FinancialGoal_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Budget" (
    "userId" TEXT NOT NULL,
    "rent" DECIMAL(12,2) NOT NULL,
    "groceries" DECIMAL(12,2) NOT NULL,
    "shopping" DECIMAL(12,2) NOT NULL,
    "emis" DECIMAL(12,2) NOT NULL,
    "savings" DECIMAL(12,2) NOT NULL,
    "outings" DECIMAL(12,2) NOT NULL,
    "other" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "IncomeProfile" ADD CONSTRAINT "IncomeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialGoal" ADD CONSTRAINT "FinancialGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
