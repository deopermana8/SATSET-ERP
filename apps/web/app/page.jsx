import { InvoicePanel } from "../../../packages/reservation/src/application/components/invoice-panel";
import { PaymentPanel } from "../../../packages/reservation/src/application/components/payment-panel";
import { QrPanel } from "../../../packages/reservation/src/application/components/qr-panel";
import { QuotationPanel } from "../../../packages/reservation/src/application/components/quotation-panel";
import { ReservationForm } from "../../../packages/reservation/src/application/components/reservation-form";
import { ScannerPanel } from "../../../packages/reservation/src/application/components/scanner-panel";
import { WorkflowDashboard } from "../../../packages/reservation/src/application/components/workflow-dashboard";
import { QrTicketCard } from "@satset/ticketing";
import { CafePosPanel, KitchenDisplayPanel, ThermalPrintPanel } from "@satset/cafe";
import { SouvenirPosPanel } from "@satset/souvenir";
import { InventoryPanel, SupplierPurchasePanel } from "@satset/inventory";
import { AccountingService, ClosingService, FinanceService, ReportService } from "@satset/accounting";
import { createCRMKernel } from "@satset/crm";
import { WorkflowDashboardStore } from "@satset/shared";
import { AccountingDashboard, BalanceSheetView, CashFlowView, ClosingWizard, FinanceDashboard, IncomeStatementView, JournalViewer, LedgerViewer, TrialBalanceView, CustomerDashboard, MembershipDashboard, VoucherDashboard, PromotionDashboard, CustomerProfile, CustomerHistory, PointHistory, CustomerSearch, CustomerAnalytics, } from "@satset/ui";
export default function Page() {
    const dashboard = new WorkflowDashboardStore();
    const accountingService = new AccountingService(dashboard);
    const financeService = new FinanceService(dashboard, accountingService);
    const reportService = new ReportService(accountingService);
    const closingService = new ClosingService(accountingService);
    const crmKernel = createCRMKernel();
    financeService.createCashAccount({ code: "1010", name: "Main Cash", openingBalance: 5000000 });
    financeService.createBankAccount({
        code: "1020",
        name: "Main Bank",
        bankName: "Bank Nusantara",
        accountNumber: "0123456789",
        openingBalance: 15000000,
    });
    financeService.recordReservationPaid({
        reference: "RSV-2026-001",
        amount: 1200000,
        description: "Reservation payment received",
        occurredAt: new Date("2026-07-20T08:15:00.000Z"),
    });
    financeService.recordCafeSale({
        reference: "CAF-2026-013",
        amount: 550000,
        cogsAmount: 220000,
        inventoryAmount: 220000,
        description: "Cafe sales",
        occurredAt: new Date("2026-07-20T09:30:00.000Z"),
    });
    financeService.recordSouvenirSale({
        reference: "SV-2026-008",
        amount: 430000,
        cogsAmount: 180000,
        inventoryAmount: 180000,
        description: "Souvenir sales",
        occurredAt: new Date("2026-07-20T10:00:00.000Z"),
    });
    financeService.recordInventoryPurchase({
        reference: "PO-2026-005",
        amount: 1000000,
        description: "Inventory purchase",
        occurredAt: new Date("2026-07-20T11:00:00.000Z"),
    });
    financeService.recordExpense({
        reference: "EXP-2026-002",
        category: "Operations",
        amount: 320000,
        description: "Operational expense",
        occurredAt: new Date("2026-07-20T12:10:00.000Z"),
    });
    const period = accountingService.openFiscalPeriod({
        name: "FY2026-JUL",
        startDate: new Date("2026-07-01T00:00:00.000Z"),
        endDate: new Date("2026-07-31T23:59:59.000Z"),
    });
    closingService.closePeriod(period.id);
    const financeSnapshot = financeService.snapshot();
    const accountingSnapshot = accountingService.snapshot();
    const generalJournal = reportService.generalJournal();
    const generalLedger = reportService.generalLedger();
    crmKernel.membershipService.registerTier({ code: "bronze", name: "Bronze", minimumSpend: 0, pointMultiplier: 1, birthdayBonusPoints: 50 });
    crmKernel.membershipService.registerTier({ code: "silver", name: "Silver", minimumSpend: 1500000, pointMultiplier: 1.2, birthdayBonusPoints: 100 });
    crmKernel.membershipService.registerTier({ code: "gold", name: "Gold", minimumSpend: 4000000, pointMultiplier: 1.5, birthdayBonusPoints: 150 });
    crmKernel.membershipService.registerTier({ code: "platinum", name: "Platinum", minimumSpend: 8000000, pointMultiplier: 2, birthdayBonusPoints: 250 });
    crmKernel.crmService.registerSegment({ code: "general", name: "General", minimumSpend: 0, minimumVisits: 0 });
    crmKernel.crmService.registerSegment({ code: "family", name: "Family Traveler", minimumSpend: 2000000, minimumVisits: 3, membershipTierCode: "silver" });
    crmKernel.crmService.registerSegment({ code: "vip", name: "VIP Guest", minimumSpend: 6000000, minimumVisits: 5, membershipTierCode: "gold" });
    const customerA = crmKernel.crmService.registerCustomer({
        fullName: "Salsa Putri",
        email: "salsa@example.com",
        phone: "081200000001",
        birthDate: new Date("1995-04-13"),
    });
    const customerB = crmKernel.crmService.registerCustomer({
        fullName: "Raka Pratama",
        email: "raka@example.com",
        phone: "081200000002",
        birthDate: new Date("1992-11-03"),
    });
    crmKernel.crmService.recordVisit({ customerId: customerA.id, source: "reservation", amount: 1250000, packageName: "Family Adventure" });
    crmKernel.crmService.recordVisit({ customerId: customerA.id, source: "cafe", amount: 240000, cafeMenuName: "Nasi Goreng" });
    crmKernel.crmService.recordVisit({ customerId: customerA.id, source: "souvenir", amount: 180000, souvenirName: "T-Shirt" });
    crmKernel.crmService.recordVisit({ customerId: customerA.id, source: "reservation", amount: 1600000, packageName: "Safari Night" });
    crmKernel.crmService.recordVisit({ customerId: customerB.id, source: "reservation", amount: 750000, packageName: "Mini Explorer" });
    crmKernel.crmService.recordVisit({ customerId: customerB.id, source: "cafe", amount: 130000, cafeMenuName: "Kopi Susu" });
    crmKernel.crmService.addCustomerNote({ customerId: customerA.id, author: "CS Team", note: "Prefers weekend booking" });
    crmKernel.crmService.addCustomerNote({ customerId: customerA.id, author: "Marketing", note: "Responded to summer promo" });
    crmKernel.loyaltyService.rewardPoints({ customerId: customerA.id, amount: 1250000, reference: "RES-POINT-001", note: "Reservation reward" });
    crmKernel.loyaltyService.rewardPoints({ customerId: customerA.id, amount: 420000, reference: "ONSITE-POINT-002", note: "On-site spending reward" });
    crmKernel.loyaltyService.rewardBirthday(customerA.id);
    const promo = crmKernel.promotionService.createPromotion({
        code: "PROMO-JULY",
        title: "July Family Promo",
        description: "Family segment gets discount on package purchases",
        discountType: "percent",
        discountValue: 15,
        target: "package",
        segmentCode: "family",
        startsAt: new Date("2026-07-01"),
        endsAt: new Date("2026-07-31"),
    });
    crmKernel.voucherService.generateVoucher({ customerId: customerA.id, value: 100000, minimumSpend: 500000, validDays: 30 });
    crmKernel.voucherService.issueCoupon({ promotionCode: promo.code, expiresAt: new Date("2026-08-31"), usageLimit: 100 });
    const crmStats = crmKernel.crmService.getGlobalStatistics();
    const customerAStats = crmKernel.crmService.getCustomerStatistics(customerA.id);
    const customerATimeline = crmKernel.crmService.getCustomerTimeline(customerA.id);
    const customerSearchResults = crmKernel.crmService.searchCustomers("sa");
    const customerAMembership = crmKernel.store.memberships.get(customerA.id);
    const customerATier = customerAMembership ? crmKernel.store.membershipTiers.get(customerAMembership.tierCode) : undefined;
    const promotionResult = crmKernel.promotionService.calculateDiscount({
        customerSegmentCode: customerAStats.segmentCode,
        target: "package",
        subtotal: 1500000,
        occurredAt: new Date("2026-07-20"),
    });
    const latestCashBalance = financeSnapshot.cashAccounts.reduce((sum, item) => sum + item.currentBalance, 0);
    return (<main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">SPRINT-01 & SPRINT-02</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Complete Operational ERP System</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            SPRINT-01: Reservation flow dari pendaftaran hingga ticket issuance. SPRINT-02: Operational modules untuk Cafe POS, Souvenir Sales, Inventory Management, Supplier/Purchase, Kitchen Display, dan Thermal Printing. Semua dengan mock data tanpa API/database.
          </p>
        </div>

        <div>
          <WorkflowDashboard />
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">✅ SPRINT-01: Reservation Flow</h2>
          <div className="space-y-6">
            <ReservationForm />
            <QuotationPanel />
            <InvoicePanel />
            <PaymentPanel />
            <QrPanel />
            <ScannerPanel />
            <QrTicketCard />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">🚀 SPRINT-02: Operational Modules</h2>
          <div className="space-y-6">
            <CafePosPanel />
            <SouvenirPosPanel />
            <KitchenDisplayPanel />
            <ThermalPrintPanel />
            <InventoryPanel />
            <SupplierPurchasePanel />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">📊 SPRINT-04: Finance & Accounting</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <FinanceDashboard totalCashAccounts={financeSnapshot.cashAccounts.length} totalBankAccounts={financeSnapshot.bankAccounts.length} cashTransactionCount={financeSnapshot.cashTransactions.length} bankTransactionCount={financeSnapshot.bankTransactions.length} expenseCount={financeSnapshot.expenses.length} incomeCount={financeSnapshot.incomes.length} transferCount={financeSnapshot.transfers.length} pettyCashCount={financeSnapshot.pettyCashAccounts.length} latestCashBalance={latestCashBalance}/>
            <AccountingDashboard totalAccounts={accountingSnapshot.chartOfAccounts.length} postedJournals={accountingSnapshot.journalEntries.length} trialBalanceDebit={accountingSnapshot.trialBalance.totalDebit} trialBalanceCredit={accountingSnapshot.trialBalance.totalCredit} netIncome={accountingSnapshot.incomeStatement.netIncome} totalAssets={accountingSnapshot.balanceSheet.totalAssets} totalLiabilities={accountingSnapshot.balanceSheet.totalLiabilities} totalEquity={accountingSnapshot.balanceSheet.totalEquity}/>
          </div>
          <div className="mt-6 space-y-6">
            <JournalViewer entries={generalJournal.map((entry) => ({
            entryNumber: entry.entryNumber,
            description: entry.description,
            occurredAt: entry.occurredAt,
            totalDebit: entry.totalDebit,
            totalCredit: entry.totalCredit,
        }))}/>
            <LedgerViewer ledgers={generalLedger.map((ledger) => ({
            accountCode: ledger.accountCode,
            accountName: ledger.accountName,
            debitTotal: ledger.debitTotal,
            creditTotal: ledger.creditTotal,
            closingBalance: ledger.closingBalance,
        }))}/>
            <TrialBalanceView totalDebit={accountingSnapshot.trialBalance.totalDebit} totalCredit={accountingSnapshot.trialBalance.totalCredit}/>
            <BalanceSheetView totalAssets={accountingSnapshot.balanceSheet.totalAssets} totalLiabilities={accountingSnapshot.balanceSheet.totalLiabilities} totalEquity={accountingSnapshot.balanceSheet.totalEquity}/>
            <IncomeStatementView totalRevenue={accountingSnapshot.incomeStatement.totalRevenue} totalExpense={accountingSnapshot.incomeStatement.totalExpense} netIncome={accountingSnapshot.incomeStatement.netIncome}/>
            <CashFlowView operating={accountingSnapshot.cashFlow.operating} investing={accountingSnapshot.cashFlow.investing} financing={accountingSnapshot.cashFlow.financing} netChangeInCash={accountingSnapshot.cashFlow.netChangeInCash}/>
            <ClosingWizard periods={accountingSnapshot.fiscalPeriods.map((fiscalPeriod) => {
            const closedRecord = accountingSnapshot.closingPeriods.find((item) => item.fiscalPeriodId === fiscalPeriod.id);
            return {
                periodId: fiscalPeriod.id,
                name: fiscalPeriod.name,
                status: fiscalPeriod.status,
                closedAt: closedRecord?.closedAt,
            };
        })}/>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">🎯 SPRINT-05: CRM & Membership</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <CustomerDashboard totalCustomers={crmStats.totalCustomers} totalVisits={crmStats.totalVisits} totalSpending={crmStats.totalSpending} averageSpending={crmStats.averageSpending} activeMemberships={crmStats.activeMemberships}/>
            <MembershipDashboard members={Array.from(crmKernel.store.memberships.values()).map((membership) => ({
            customerName: crmKernel.store.customers.get(membership.customerId)?.fullName ?? "Unknown",
            tierName: crmKernel.store.membershipTiers.get(membership.tierCode)?.name ?? membership.tierCode,
            points: membership.points,
        }))}/>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <VoucherDashboard vouchers={Array.from(crmKernel.store.vouchers.values()).map((voucher) => ({
            code: voucher.code,
            customerName: crmKernel.store.customers.get(voucher.customerId)?.fullName ?? "Unknown",
            value: voucher.value,
            expiresAt: voucher.expiresAt,
        }))}/>
            <PromotionDashboard promotions={Array.from(crmKernel.store.promotions.values()).map((item) => ({
            code: item.code,
            title: `${item.title} (${promotionResult.discountAmount > 0 ? "Active" : "Inactive"})`,
            target: item.target,
            segment: item.segmentCode,
            activePeriod: `${item.startsAt.toLocaleDateString("id-ID")} - ${item.endsAt.toLocaleDateString("id-ID")}`,
        }))}/>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <CustomerProfile customerCode={customerA.customerCode} fullName={customerA.fullName} email={customerA.email} phone={customerA.phone} membershipTier={customerATier?.name ?? "Bronze"} points={customerAMembership?.points ?? 0} totalSpending={customerAStats.totalSpending}/>
            <CustomerAnalytics totalVisits={customerAStats.totalVisits} totalSpending={customerAStats.totalSpending} visitFrequencyPerMonth={customerAStats.visitFrequencyPerMonth} favoritePackage={customerAStats.favoritePackage} favoriteCafeMenu={customerAStats.favoriteCafeMenu} favoriteSouvenir={customerAStats.favoriteSouvenir}/>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <CustomerSearch query="sa" results={customerSearchResults.map((item) => ({
            customerCode: item.customerCode,
            fullName: item.fullName,
            email: item.email,
            phone: item.phone,
        }))}/>
            <CustomerHistory visits={crmKernel.store.visitHistories
            .filter((visit) => visit.customerId === customerA.id)
            .map((visit) => ({
            source: visit.source,
            amount: visit.amount,
            visitedAt: visit.visitedAt,
        }))}/>
            <PointHistory transactions={crmKernel.store.pointTransactions
            .filter((transaction) => transaction.customerId === customerA.id)
            .map((transaction) => ({
            type: transaction.type,
            points: transaction.points,
            reference: transaction.reference,
            occurredAt: transaction.occurredAt,
        }))}/>
          </div>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Customer Timeline</h3>
            <ul className="mt-3 space-y-2">
              {customerATimeline.map((item) => (<li key={`${item.type}-${item.occurredAt.toISOString()}-${item.description}`} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">{item.type.toUpperCase()}</p>
                  <p>{item.description}</p>
                  <p>{item.occurredAt.toLocaleString("id-ID")}</p>
                </li>))}
            </ul>
          </div>
        </div>
      </div>
    </main>);
}
