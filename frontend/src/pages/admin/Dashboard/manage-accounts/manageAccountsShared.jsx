import { Link, useLocation } from "react-router-dom";

export const manageAccountsMenuItems = [
  ["Fees Collection Create", "fees-collection/fees-collection-create"],
  ["Fees Collection List", "fees-collection/fees-collection-list"],
  ["Fees Collection Due Details", "fees-collection/fees-collection-due-details"],
  ["Student Due Details", "fees-collection/student-due-details"],
  ["Fee Settings", "fees-collection/fee-settings"],
  ["SMS Setup", "fees-collection/sms-setup"],
  ["Fees Collection Approve", "fees-collection/fees-collection-approve"],
  ["Student Fee Method Setup", "fees-collection/student-fee-method-setup"],
  ["Fees Category Create", "fees-category/fees-category-create"],
  ["Fees Category List", "fees-category/fees-category-list"],
  ["Student Waiver", "fees-category/student-waiver"],
  ["Mid Year Fees Reduction", "fees-category/mid-year-fees-reduction"],
  ["Custom Fee Create", "custom-fee/custom-fee-create"],
  ["Custom Fee List", "custom-fee/custom-fee-list"],
  ["Expense Category Create", "expense-category/expense-category-create"],
  ["Expense Category List", "expense-category/expense-category-list"],
  ["Expense Create", "expense/expense-create"],
  ["Expense List", "expense/expense-list"],
  ["Income Category Create", "income-category/income-category-create"],
  ["Income Category List", "income-category/income-category-list"],
  ["Income Create", "income/income-create"],
  ["Income List", "income/income-list"],
  ["General Ledger", "general-ledger"],
  ["Fund Transfer Create", "fund-transfer/fund-transfer-create"],
  ["Fund Transfer List", "fund-transfer/fund-transfer-list"],
  ["Payment Gateway Create", "payment-gateway/payment-gateway-create"],
  ["Payment Gateway List", "payment-gateway/payment-gateway-list"],
  ["Payment History", "payment-history"],
  ["Balance Sheet Data", "balance-sheet-data"],
  ["All Account Reports", "all-account-reports"],
  ["Account Settings", "account-settings"],
];

export function useManageAccountsBase() {
  const location = useLocation();
  const prefix = location.pathname.startsWith("/admin/dashboard")
    ? "/admin/dashboard"
    : "/dashboard";
  const segment = location.pathname.includes("/10-manage-accounts")
    ? "10-manage-accounts"
    : "manage-accounts";

  return `${prefix}/${segment}`;
}

export function ManageAccountsNav() {
  const base = useManageAccountsBase();

  return (
    <nav
      className="sticky top-0 z-20 flex min-h-11 flex-wrap items-center gap-x-5 gap-y-2 border border-slate-200 bg-white px-3 py-2 shadow-sm"
      aria-label="Manage accounts menu"
    >
      <Link
        to={base}
        className="mr-2 whitespace-nowrap text-sm font-black text-blue-700"
      >
        Manage Accounts
      </Link>

      {manageAccountsMenuItems.map(([label, slug]) => (
        <Link
          key={slug}
          to={`${base}/${slug}`}
          className="inline-flex min-h-9 items-center whitespace-nowrap rounded-md px-2 text-sm font-black text-slate-950 transition-colors hover:bg-blue-50 hover:text-blue-700"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function ManageAccountsPageShell({ title, children }) {
  return (
    <div className="space-y-5">
      <ManageAccountsNav />

      <section className="overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-sm">
        <header className="flex min-h-11 items-center bg-[#476db4] px-5 py-2 text-white">
          <h2 className="text-base font-bold sm:text-lg">{title}</h2>
        </header>

        <div className="p-5">
          {children || (
            <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/70 p-8 text-center">
              <h1 className="text-2xl font-black text-slate-950">{title}</h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold text-slate-600">
                Demo accounts page prepared. Replace this with the full
                workflow when you are ready.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
