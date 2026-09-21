import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Eye,
  Plus,
  ReceiptText,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

/* =========================================================
   STORAGE
========================================================= */

const EXPENSE_STORAGE_KEY = "expertCoachingExpenses";

/* =========================================================
   DEMO DATA
========================================================= */

const expenseCategories = [
  "Office Expense",
  "Teacher Salary",
  "Employee Salary",
  "Electricity Bill",
  "Internet Bill",
  "Stationery",
  "Printing",
  "Maintenance",
  "Transport",
  "Entertainment",
  "Exam Expense",
  "Advertisement",
  "Rent",
  "Utility Bill",
  "Miscellaneous",
];

const paymentMethods = [
  "Cash",
  "Bank",
  "bKash",
  "Nagad",
  "Rocket",
  "Cheque",
];

/* =========================================================
   HELPERS
========================================================= */

function generateId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function formatMoney(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function loadExpenses() {
  try {
    const stored = localStorage.getItem(
      EXPENSE_STORAGE_KEY
    );

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveExpenses(expenses) {
  localStorage.setItem(
    EXPENSE_STORAGE_KEY,
    JSON.stringify(expenses)
  );

  window.dispatchEvent(
    new CustomEvent("expert-expense-updated")
  );
}

/* =========================================================
   ROUTE NAVIGATION
========================================================= */

function useExpenseNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToList = () => {
    if (
      location.pathname.endsWith("/expense-create")
    ) {
      navigate(
        location.pathname.replace(
          /\/expense-create$/,
          "/expense-list"
        )
      );
      return;
    }

    navigate(-1);
  };

  const goToCreate = () => {
    if (
      location.pathname.endsWith("/expense-list")
    ) {
      navigate(
        location.pathname.replace(
          /\/expense-list$/,
          "/expense-create"
        )
      );
      return;
    }

    navigate("expense-create");
  };

  return {
    goToList,
    goToCreate,
  };
}

/* =========================================================
   COMMON UI
========================================================= */

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.28,
        ease: "easeOut",
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function DashboardPanel({
  title,
  action,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-md border border-base-300 bg-base-100 shadow-sm">
      <div className="flex min-h-[40px] items-center justify-between gap-3 bg-[#456db5] px-5 py-2 text-white">
        <h1 className="text-[17px] font-bold sm:text-[19px]">
          {title}
        </h1>

        {action}
      </div>

      {children}
    </section>
  );
}

function RequiredNotice() {
  return (
    <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

function FormLabel({
  children,
  required = false,
}) {
  return (
    <label className="text-sm font-bold">
      {children}

      {required && (
        <span className="text-red-500">*</span>
      )}
    </label>
  );
}

/* =========================================================
   EXPENSE CREATE PAGE
========================================================= */

export function ExpenseCreatePage() {
  const { goToList } =
    useExpenseNavigation();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    paidBy: "Cash",
    due: "0",
    discount: "0",
    shortNote: "N/A",
    expenseDate: getToday(),
  });

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.category) {
      setError(
        "Expense Category is required."
      );
      return;
    }

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      setError(
        "Please enter a valid expense amount."
      );
      return;
    }

    if (!formData.paidBy) {
      setError(
        "Payment method is required."
      );
      return;
    }

    if (!formData.expenseDate) {
      setError(
        "Expense Date is required."
      );
      return;
    }

    const existingExpenses =
      loadExpenses();

    const newExpense = {
      id: generateId(),

      title:
        formData.title.trim() ||
        formData.category,

      category: formData.category,

      amount: Number(formData.amount),

      paidBy: formData.paidBy,

      due: Number(formData.due || 0),

      discount: Number(
        formData.discount || 0
      ),

      shortNote:
        formData.shortNote.trim() ||
        "N/A",

      expenseDate:
        formData.expenseDate,

      createdBy:
        "Expert Coaching Center",

      createdAt:
        new Date().toISOString(),
    };

    saveExpenses([
      ...existingExpenses,
      newExpense,
    ]);

    setSuccess(
      "Expense created successfully."
    );

    setFormData({
      title: "",
      category: "",
      amount: "",
      paidBy: "Cash",
      due: "0",
      discount: "0",
      shortNote: "N/A",
      expenseDate: getToday(),
    });
  };

  return (
    <PageWrapper>
      <div className="bg-base-200/60 p-2 sm:p-4">
        <DashboardPanel
          title="Create Expense"
          action={
            <motion.button
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="button"
              onClick={goToList}
              className="btn btn-sm min-h-0 border-0 bg-cyan-500 px-3 font-normal text-white hover:bg-cyan-600"
            >
              Back to Expense List
            </motion.button>
          }
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-5 sm:p-6"
          >
            <RequiredNotice />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="alert alert-error py-2 text-sm text-white"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  className="alert alert-success py-2 text-sm text-white"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid max-w-[1180px] gap-x-8 gap-y-5 lg:grid-cols-[370px_minmax(0,770px)]">
              {/* Expense Title */}

              <FormLabel>
                Expense Title:
              </FormLabel>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Expense Title"
                className="input input-bordered input-sm w-full rounded"
              />

              {/* Category */}

              <FormLabel required>
                Expense Category:
              </FormLabel>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select select-bordered select-sm w-full rounded"
                required
              >
                <option value="">
                  Select Expense Category
                </option>

                {expenseCategories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>

              {/* Amount */}

              <FormLabel required>
                Amount:
              </FormLabel>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Enter Amount"
                className="input input-bordered input-sm w-full rounded"
                required
              />

              {/* Paid By */}

              <FormLabel required>
                Paid By:
              </FormLabel>

              <select
                name="paidBy"
                value={formData.paidBy}
                onChange={handleChange}
                className="select select-bordered select-sm w-full rounded"
                required
              >
                {paymentMethods.map(
                  (method) => (
                    <option
                      key={method}
                      value={method}
                    >
                      {method}
                    </option>
                  )
                )}
              </select>

              {/* Due */}

              <FormLabel>
                Due:
              </FormLabel>

              <input
                type="number"
                name="due"
                value={formData.due}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="input input-bordered input-sm w-full rounded"
              />

              {/* Discount */}

              <FormLabel>
                Discount:
              </FormLabel>

              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="input input-bordered input-sm w-full rounded"
              />

              {/* Note */}

              <FormLabel>
                Short note:
              </FormLabel>

              <textarea
                name="shortNote"
                value={formData.shortNote}
                onChange={handleChange}
                rows={2}
                className="textarea textarea-bordered min-h-[54px] w-full rounded"
              />

              {/* Date */}

              <FormLabel required>
                Expense Date:
              </FormLabel>

              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                className="input input-bordered input-sm w-full rounded bg-base-200"
                required
              />

              {/* Submit */}

              <div />

              <div>
                <motion.button
                  whileHover={{
                    scale: 1.025,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  type="submit"
                  className="btn btn-success btn-sm min-h-0 text-white"
                >
                  <Save size={14} />

                  Submit
                </motion.button>
              </div>
            </div>
          </form>
        </DashboardPanel>
      </div>
    </PageWrapper>
  );
}

/* =========================================================
   EDIT EXPENSE MODAL
========================================================= */

function EditExpenseModal({
  expense,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(
    expense || {}
  );

  if (!expense) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      ...form,

      amount: Number(form.amount || 0),

      due: Number(form.due || 0),

      discount: Number(
        form.discount || 0
      ),
    });
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="fixed inset-0 z-[300] grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]"
      onMouseDown={onClose}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
        }}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-base-100 shadow-2xl"
      >
        <div className="flex items-center justify-between bg-[#456db5] px-5 py-3 text-white">
          <h2 className="font-bold">
            Edit Expense
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-circle btn-ghost btn-sm text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-4 p-5 sm:grid-cols-2"
        >
          <label className="form-control sm:col-span-2">
            <span className="mb-1 text-sm font-bold">
              Expense Title
            </span>

            <input
              name="title"
              value={form.title || ""}
              onChange={handleChange}
              className="input input-bordered input-sm"
            />
          </label>

          <label className="form-control">
            <span className="mb-1 text-sm font-bold">
              Category
            </span>

            <select
              name="category"
              value={form.category || ""}
              onChange={handleChange}
              className="select select-bordered select-sm"
            >
              {expenseCategories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="form-control">
            <span className="mb-1 text-sm font-bold">
              Amount
            </span>

            <input
              type="number"
              name="amount"
              value={form.amount || ""}
              onChange={handleChange}
              className="input input-bordered input-sm"
            />
          </label>

          <label className="form-control">
            <span className="mb-1 text-sm font-bold">
              Paid By
            </span>

            <select
              name="paidBy"
              value={form.paidBy || ""}
              onChange={handleChange}
              className="select select-bordered select-sm"
            >
              {paymentMethods.map(
                (method) => (
                  <option
                    key={method}
                    value={method}
                  >
                    {method}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="form-control">
            <span className="mb-1 text-sm font-bold">
              Date
            </span>

            <input
              type="date"
              name="expenseDate"
              value={
                form.expenseDate || ""
              }
              onChange={handleChange}
              className="input input-bordered input-sm"
            />
          </label>

          <div className="flex justify-end gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-success btn-sm text-white"
            >
              <Save size={14} />
              Update
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   EXPENSE LIST PAGE
========================================================= */

export function ExpenseListPage() {
  const { goToCreate } =
    useExpenseNavigation();

  const [expenses, setExpenses] =
    useState(() => loadExpenses());

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [editingExpense, setEditingExpense] =
    useState(null);

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const searchMatch =
          !search ||
          expense.title
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          expense.category
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const categoryMatch =
          !category ||
          expense.category === category;

        const paymentMatch =
          !paymentMethod ||
          expense.paidBy ===
            paymentMethod;

        return (
          searchMatch &&
          categoryMatch &&
          paymentMatch
        );
      }),
    [
      expenses,
      search,
      category,
      paymentMethod,
    ]
  );

  const totals = useMemo(() => {
    return filteredExpenses.reduce(
      (result, expense) => {
        result.amount += Number(
          expense.amount || 0
        );

        result.due += Number(
          expense.due || 0
        );

        result.discount += Number(
          expense.discount || 0
        );

        return result;
      },
      {
        amount: 0,
        due: 0,
        discount: 0,
      }
    );
  }, [filteredExpenses]);

  const handleDelete = (expense) => {
    const confirmed =
      window.confirm(
        `Delete expense "${expense.title}"?`
      );

    if (!confirmed) return;

    const updated =
      expenses.filter(
        (item) =>
          item.id !== expense.id
      );

    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleEdit = (updatedExpense) => {
    const updated =
      expenses.map((expense) =>
        expense.id ===
        updatedExpense.id
          ? updatedExpense
          : expense
      );

    setExpenses(updated);

    saveExpenses(updated);

    setEditingExpense(null);
  };

  return (
    <PageWrapper>
      <div className="space-y-4 bg-base-200/60 p-2 sm:p-4">
        {/* Search */}

        <DashboardPanel title="Expense Search">
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            <label className="form-control">
              <span className="mb-1 text-sm font-bold">
                Search
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Expense title..."
                className="input input-bordered input-sm"
              />
            </label>

            <label className="form-control">
              <span className="mb-1 text-sm font-bold">
                Expense Category
              </span>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                className="select select-bordered select-sm"
              >
                <option value="">
                  All Categories
                </option>

                {expenseCategories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="form-control">
              <span className="mb-1 text-sm font-bold">
                Paid By
              </span>

              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
                className="select select-bordered select-sm"
              >
                <option value="">
                  All Payment Methods
                </option>

                {paymentMethods.map(
                  (method) => (
                    <option
                      key={method}
                      value={method}
                    >
                      {method}
                    </option>
                  )
                )}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                className="btn btn-info btn-sm text-white"
              >
                <Search size={15} />
                Search
              </button>
            </div>
          </div>
        </DashboardPanel>

        {/* List */}

        <DashboardPanel
          title="Expense List"
          action={
            <motion.button
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="button"
              onClick={goToCreate}
              className="btn btn-sm min-h-0 border-0 bg-cyan-500 px-3 font-normal text-white hover:bg-cyan-600"
            >
              <Plus size={14} />
              Create Expense
            </motion.button>
          }
        >
          {/* Summary */}

          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <div className="rounded border border-base-300 bg-base-200/60 p-3">
              <p className="text-xs text-base-content/60">
                Total Expense
              </p>

              <p className="text-lg font-bold">
                ৳ {formatMoney(totals.amount)}
              </p>
            </div>

            <div className="rounded border border-base-300 bg-base-200/60 p-3">
              <p className="text-xs text-base-content/60">
                Total Due
              </p>

              <p className="text-lg font-bold">
                ৳ {formatMoney(totals.due)}
              </p>
            </div>

            <div className="rounded border border-base-300 bg-base-200/60 p-3">
              <p className="text-xs text-base-content/60">
                Total Discount
              </p>

              <p className="text-lg font-bold">
                ৳{" "}
                {formatMoney(
                  totals.discount
                )}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto px-4 pb-4">
            <table className="table table-zebra table-sm min-w-[1100px] border border-base-300">
              <thead>
                <tr className="bg-base-200">
                  <th>#</th>
                  <th>Expense Title</th>
                  <th>
                    Expense Category
                  </th>
                  <th>Amount</th>
                  <th>Paid By</th>
                  <th>Due</th>
                  <th>Discount</th>
                  <th>Short Note</th>
                  <th>Expense Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map(
                  (expense, index) => (
                    <tr key={expense.id}>
                      <td>{index + 1}</td>

                      <td className="font-medium">
                        {expense.title}
                      </td>

                      <td>
                        {expense.category}
                      </td>

                      <td>
                        ৳{" "}
                        {formatMoney(
                          expense.amount
                        )}
                      </td>

                      <td>
                        {expense.paidBy}
                      </td>

                      <td>
                        ৳{" "}
                        {formatMoney(
                          expense.due
                        )}
                      </td>

                      <td>
                        ৳{" "}
                        {formatMoney(
                          expense.discount
                        )}
                      </td>

                      <td className="max-w-[220px] truncate">
                        {expense.shortNote}
                      </td>

                      <td>
                        {expense.expenseDate}
                      </td>

                      <td>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                [
                                  `Title: ${expense.title}`,
                                  `Category: ${expense.category}`,
                                  `Amount: ৳${expense.amount}`,
                                  `Paid By: ${expense.paidBy}`,
                                  `Date: ${expense.expenseDate}`,
                                  `Note: ${expense.shortNote}`,
                                ].join("\n")
                              )
                            }
                            className="btn btn-square btn-sm border-0 bg-[#456db5] text-white"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setEditingExpense(
                                expense
                              )
                            }
                            className="btn btn-square btn-sm border-0 bg-cyan-500 text-white"
                            title="Edit"
                          >
                            <Edit3
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                expense
                              )
                            }
                            className="btn btn-error btn-square btn-sm text-white"
                            title="Delete"
                          >
                            <Trash2
                              size={15}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {filteredExpenses.length ===
              0 && (
              <div className="flex min-h-20 items-center justify-center border border-t-0 border-base-300 text-sm text-base-content/50">
                No expense data available.
              </div>
            )}

            <div className="mt-4 text-sm font-bold">
              Showing{" "}
              {filteredExpenses.length
                ? 1
                : 0}{" "}
              to{" "}
              {
                filteredExpenses.length
              }{" "}
              of{" "}
              {
                filteredExpenses.length
              }{" "}
              results.
            </div>
          </div>
        </DashboardPanel>
      </div>

      <AnimatePresence>
        {editingExpense && (
          <EditExpenseModal
            expense={editingExpense}
            onClose={() =>
              setEditingExpense(null)
            }
            onSave={handleEdit}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}