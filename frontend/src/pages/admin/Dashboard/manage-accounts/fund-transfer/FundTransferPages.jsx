import { useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  Printer,
  Trash2,
} from "lucide-react";

/* =========================================================
   STORAGE
========================================================= */

const TRANSFER_STORAGE_KEY =
  "expert_fund_transfers";

const ACCOUNT_STORAGE_KEY =
  "expert_fund_accounts";

const DEFAULT_ACCOUNTS = [
  {
    id: "cash",
    name: "Cash",
    balance: 125000,
  },
  {
    id: "bank",
    name: "Bank Account",
    balance: 350000,
  },
  {
    id: "bkash",
    name: "bKash",
    balance: 68000,
  },
  {
    id: "nagad",
    name: "Nagad",
    balance: 42000,
  },
  {
    id: "petty-cash",
    name: "Petty Cash",
    balance: 25000,
  },
];

function getStoredTransfers() {
  try {
    const data =
      localStorage.getItem(
        TRANSFER_STORAGE_KEY
      );

    if (!data) return [];

    const parsed = JSON.parse(data);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveTransfers(rows) {
  localStorage.setItem(
    TRANSFER_STORAGE_KEY,
    JSON.stringify(rows)
  );
}

function getStoredAccounts() {
  try {
    const data =
      localStorage.getItem(
        ACCOUNT_STORAGE_KEY
      );

    if (!data) {
      localStorage.setItem(
        ACCOUNT_STORAGE_KEY,
        JSON.stringify(
          DEFAULT_ACCOUNTS
        )
      );

      return DEFAULT_ACCOUNTS;
    }

    const parsed = JSON.parse(data);

    return Array.isArray(parsed) &&
      parsed.length
      ? parsed
      : DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(
    ACCOUNT_STORAGE_KEY,
    JSON.stringify(accounts)
  );
}

/* =========================================================
   HELPERS
========================================================= */

function today() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(date.getDate()).padStart(
      2,
      "0"
    ),
  ].join("-");
}

function generateTransferId() {
  return `FT-${Date.now()
    .toString()
    .slice(-8)}`;
}

function money(value) {
  return Number(value || 0).toLocaleString(
    "en-US"
  );
}

/* =========================================================
   ROUTE NAVIGATION
========================================================= */

function useFundTransferNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigateSibling = (slug) => {
    const current =
      location.pathname.replace(
        /\/+$/,
        ""
      );

    const parent = current.substring(
      0,
      current.lastIndexOf("/")
    );

    navigate(`${parent}/${slug}`);
  };

  return {
    goCreate: () =>
      navigateSibling(
        "fund-transfer-create"
      ),

    goList: () =>
      navigateSibling(
        "fund-transfer-list"
      ),
  };
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function PageContainer({ children }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 6,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.2,
      }}
      className="min-h-[calc(100vh-60px)] bg-base-200/50 p-2 sm:p-4"
    >
      {children}
    </motion.div>
  );
}

function Panel({
  title,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`overflow-hidden rounded-md border border-base-300 bg-base-100 shadow-sm ${className}`}
    >
      <div className="flex min-h-[40px] items-center justify-between gap-3 bg-[#456db5] px-4 py-2 text-white sm:px-5">
        <h2 className="text-base font-bold sm:text-lg">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function HeaderButton({
  children,
  onClick,
  variant = "info",
}) {
  const styles =
    variant === "success"
      ? "border-green-500 bg-green-500 hover:border-green-600 hover:bg-green-600"
      : "border-cyan-500 bg-cyan-500 hover:border-cyan-600 hover:bg-cyan-600";

  return (
    <motion.button
      type="button"
      whileHover={{
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.97,
      }}
      onClick={onClick}
      className={`btn btn-sm min-h-0 text-white ${styles}`}
    >
      {children}
    </motion.button>
  );
}

function RequiredAlert() {
  return (
    <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-red-500">
      (*) field required
    </div>
  );
}

function FormRow({
  label,
  required,
  children,
}) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[175px_minmax(0,1fr)]">
      <label className="text-sm font-bold">
        {label}
        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   FUND TRANSFER CREATE PAGE
========================================================= */

export function FundTransferCreatePage() {
  const { goList } =
    useFundTransferNavigation();

  const [accounts, setAccounts] =
    useState(() =>
      getStoredAccounts()
    );

  const [form, setForm] = useState({
    transferDate: today(),
    transferFrom: "",
    transferTo: "",
    amount: "",
    description: "",
  });

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const selectedFrom =
    accounts.find(
      (item) =>
        item.id ===
        form.transferFrom
    ) || null;

  const currentAmount =
    selectedFrom?.balance || 0;

  const amountNumber =
    Number(form.amount) || 0;

  const amountAfterTransfer =
    Math.max(
      currentAmount -
        amountNumber,
      0
    );

  const setValue = (
    key,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (!form.transferDate) {
      setError(
        "Transfer Date is required."
      );
      return;
    }

    if (!form.transferFrom) {
      setError(
        "Transfer From account is required."
      );
      return;
    }

    if (!form.transferTo) {
      setError(
        "Transfer To account is required."
      );
      return;
    }

    if (
      form.transferFrom ===
      form.transferTo
    ) {
      setError(
        "Transfer From and Transfer To cannot be the same account."
      );
      return;
    }

    if (
      !amountNumber ||
      amountNumber <= 0
    ) {
      setError(
        "Enter a valid transfer amount."
      );
      return;
    }

    if (
      amountNumber >
      currentAmount
    ) {
      setError(
        "Transfer amount cannot exceed the current balance."
      );
      return;
    }

    const fromAccount =
      accounts.find(
        (item) =>
          item.id ===
          form.transferFrom
      );

    const toAccount =
      accounts.find(
        (item) =>
          item.id ===
          form.transferTo
      );

    const updatedAccounts =
      accounts.map((account) => {
        if (
          account.id ===
          form.transferFrom
        ) {
          return {
            ...account,
            balance:
              account.balance -
              amountNumber,
          };
        }

        if (
          account.id ===
          form.transferTo
        ) {
          return {
            ...account,
            balance:
              account.balance +
              amountNumber,
          };
        }

        return account;
      });

    const transfer = {
      id: crypto.randomUUID?.()
        ? crypto.randomUUID()
        : String(Date.now()),
      transferId:
        generateTransferId(),
      transferBy:
        "Expert Coaching Center",
      date: form.transferDate,
      debitFrom:
        fromAccount?.name || "",
      creditTo:
        toAccount?.name || "",
      amount: amountNumber,
      description:
        form.description.trim() ||
        "N/A",
      createdAt:
        new Date().toISOString(),
    };

    const previousTransfers =
      getStoredTransfers();

    saveTransfers([
      transfer,
      ...previousTransfers,
    ]);

    saveAccounts(
      updatedAccounts
    );

    setAccounts(
      updatedAccounts
    );

    setForm({
      transferDate: today(),
      transferFrom: "",
      transferTo: "",
      amount: "",
      description: "",
    });

    setError("");
    setSuccess(
      `Fund transfer completed successfully. Transfer ID: ${transfer.transferId}`
    );
  };

  return (
    <PageContainer>
      <Panel
        title="Fund Transfer"
        action={
          <HeaderButton
            onClick={goList}
          >
            Back to Fund Transfer List
          </HeaderButton>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          <RequiredAlert />

          {error && (
            <div className="alert alert-error py-2 text-sm">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success py-2 text-sm text-white">
              <span>
                {success}
              </span>
            </div>
          )}

          {/* DATE */}
          <div className="mx-auto max-w-[680px]">
            <FormRow
              label="Transfer Date:"
              required
            >
              <input
                type="date"
                value={
                  form.transferDate
                }
                onChange={(e) =>
                  setValue(
                    "transferDate",
                    e.target.value
                  )
                }
                className="input input-bordered input-sm w-full rounded"
              />
            </FormRow>
          </div>

          {/* TWO COLUMN FORM */}
          <div className="mx-auto grid max-w-7xl gap-x-7 gap-y-4 lg:grid-cols-2">
            <div className="space-y-4">
              <FormRow
                label="Transfer From:"
                required
              >
                <select
                  value={
                    form.transferFrom
                  }
                  onChange={(e) =>
                    setValue(
                      "transferFrom",
                      e.target.value
                    )
                  }
                  className="select select-bordered select-sm w-full rounded"
                >
                  <option value="">
                    Select
                  </option>

                  {accounts.map(
                    (account) => (
                      <option
                        key={
                          account.id
                        }
                        value={
                          account.id
                        }
                      >
                        {
                          account.name
                        }{" "}
                        - ৳
                        {money(
                          account.balance
                        )}
                      </option>
                    )
                  )}
                </select>
              </FormRow>

              <FormRow
                label="Transfer Amount:"
                required
              >
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) =>
                    setValue(
                      "amount",
                      e.target.value
                    )
                  }
                  placeholder="Transfer Amount"
                  className="input input-bordered input-sm w-full rounded"
                />
              </FormRow>

              <FormRow label="Description:">
                <textarea
                  value={
                    form.description
                  }
                  onChange={(e) =>
                    setValue(
                      "description",
                      e.target.value
                    )
                  }
                  className="textarea textarea-bordered min-h-[55px] w-full rounded"
                />
              </FormRow>

              <div className="sm:pl-[175px]">
                <motion.button
                  type="submit"
                  whileHover={{
                    scale: 1.02,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="btn btn-info btn-sm min-h-0 text-white"
                >
                  Submit
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              <FormRow
                label="Transfer To:"
                required
              >
                <select
                  value={
                    form.transferTo
                  }
                  onChange={(e) =>
                    setValue(
                      "transferTo",
                      e.target.value
                    )
                  }
                  className="select select-bordered select-sm w-full rounded"
                >
                  <option value="">
                    Select
                  </option>

                  {accounts
                    .filter(
                      (account) =>
                        account.id !==
                        form.transferFrom
                    )
                    .map(
                      (account) => (
                        <option
                          key={
                            account.id
                          }
                          value={
                            account.id
                          }
                        >
                          {
                            account.name
                          }
                        </option>
                      )
                    )}
                </select>
              </FormRow>

              <FormRow label="Current Amount:">
                <input
                  readOnly
                  value={
                    selectedFrom
                      ? money(
                          currentAmount
                        )
                      : ""
                  }
                  className="input input-bordered input-sm w-full rounded bg-base-200"
                />
              </FormRow>

              <FormRow label="Amount After Transfer:">
                <input
                  readOnly
                  value={
                    selectedFrom
                      ? money(
                          amountAfterTransfer
                        )
                      : ""
                  }
                  placeholder="Amount After Transfer"
                  className="input input-bordered input-sm w-full rounded bg-base-200"
                />
              </FormRow>
            </div>
          </div>

          <div className="min-h-[45px]" />
        </form>
      </Panel>
    </PageContainer>
  );
}

/* =========================================================
   FUND TRANSFER LIST PAGE
========================================================= */

export function FundTransferListPage() {
  const { goCreate } =
    useFundTransferNavigation();

  const [rows, setRows] =
    useState(() =>
      getStoredTransfers()
    );

  const [searchId, setSearchId] =
    useState("");

  const [activeSearch, setActiveSearch] =
    useState("");

  const filteredRows = useMemo(() => {
    if (!activeSearch.trim()) {
      return rows;
    }

    return rows.filter((row) =>
      String(row.transferId)
        .toLowerCase()
        .includes(
          activeSearch
            .trim()
            .toLowerCase()
        )
    );
  }, [rows, activeSearch]);

  const handleSearch = () => {
    setActiveSearch(searchId);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = (id) => {
    const confirmed =
      window.confirm(
        "Delete this fund transfer record?"
      );

    if (!confirmed) return;

    const updated =
      rows.filter(
        (row) => row.id !== id
      );

    setRows(updated);
    saveTransfers(updated);
  };

  const viewTransfer = (row) => {
    window.alert(
      [
        `Transfer ID: ${row.transferId}`,
        `Transfer By: ${row.transferBy}`,
        `Date: ${row.date}`,
        `Debit From: ${row.debitFrom}`,
        `Credit To: ${row.creditTo}`,
        `Amount: ${money(row.amount)}`,
        `Description: ${row.description}`,
      ].join("\n")
    );
  };

  return (
    <PageContainer>
      <div className="space-y-7">
        {/* SEARCH */}
        <Panel title="Fund Transfer Search">
          <div className="p-5 sm:p-6">
            <div className="grid max-w-[700px] gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
              <label className="text-sm font-bold">
                Transfer Id:
              </label>

              <input
                type="text"
                value={searchId}
                onChange={(e) =>
                  setSearchId(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    handleSearch();
                  }
                }}
                placeholder="Transfer Id"
                className="input input-bordered input-sm w-full rounded"
              />

              <div />

              <div className="flex gap-1">
                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={
                    handleSearch
                  }
                  className="btn btn-info btn-sm min-h-0 text-white"
                >
                  Search
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={
                    handlePrint
                  }
                  className="btn btn-success btn-sm min-h-0 text-white"
                >
                  <Printer
                    size={14}
                  />
                  Print
                </motion.button>
              </div>
            </div>

            <div className="min-h-[10px]" />
          </div>
        </Panel>

        {/* LIST */}
        <Panel
          title="Fund Transfer List"
          action={
            <HeaderButton
              onClick={goCreate}
            >
              Fund Transfer Create
            </HeaderButton>
          }
        >
          <div className="p-4 sm:p-5">
            <div className="overflow-x-auto">
              <table className="table table-xs w-full min-w-[1050px] border border-base-300">
                <thead>
                  <tr className="bg-base-200">
                    <th className="border border-base-300">
                      SL
                    </th>

                    <th className="border border-base-300">
                      Transfer By
                    </th>

                    <th className="border border-base-300">
                      Date
                    </th>

                    <th className="border border-base-300">
                      Debit From
                    </th>

                    <th className="border border-base-300">
                      Credit To
                    </th>

                    <th className="border border-base-300">
                      Amount
                    </th>

                    <th className="border border-base-300">
                      Description
                    </th>

                    <th className="border border-base-300">
                      Transfer Id
                    </th>

                    <th className="border border-base-300">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="border border-base-300 py-6 text-center text-base-content/60"
                      >
                        No data
                        available in
                        table
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map(
                      (
                        row,
                        index
                      ) => (
                        <tr
                          key={
                            row.id
                          }
                          className="hover"
                        >
                          <td className="border border-base-300">
                            {index +
                              1}
                          </td>

                          <td className="border border-base-300">
                            {
                              row.transferBy
                            }
                          </td>

                          <td className="border border-base-300">
                            {
                              row.date
                            }
                          </td>

                          <td className="border border-base-300">
                            {
                              row.debitFrom
                            }
                          </td>

                          <td className="border border-base-300">
                            {
                              row.creditTo
                            }
                          </td>

                          <td className="border border-base-300">
                            ৳
                            {money(
                              row.amount
                            )}
                          </td>

                          <td className="border border-base-300">
                            {
                              row.description
                            }
                          </td>

                          <td className="border border-base-300 font-medium">
                            {
                              row.transferId
                            }
                          </td>

                          <td className="border border-base-300">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                title="View"
                                onClick={() =>
                                  viewTransfer(
                                    row
                                  )
                                }
                                className="btn btn-info btn-square btn-xs text-white"
                              >
                                <Eye
                                  size={
                                    13
                                  }
                                />
                              </button>

                              <button
                                type="button"
                                title="Delete"
                                onClick={() =>
                                  handleDelete(
                                    row.id
                                  )
                                }
                                className="btn btn-error btn-square btn-xs text-white"
                              >
                                <Trash2
                                  size={
                                    13
                                  }
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-5 text-sm font-bold">
              Showing{" "}
              {filteredRows.length
                ? 1
                : 0}{" "}
              to{" "}
              {
                filteredRows.length
              }{" "}
              of{" "}
              {
                filteredRows.length
              }{" "}
              results.
            </p>
          </div>
        </Panel>
      </div>
    </PageContainer>
  );
}