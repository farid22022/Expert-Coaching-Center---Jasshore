import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Edit3,
  Printer,
  Trash2,
} from "lucide-react";

/* =========================================================
   LOCAL STORAGE
========================================================= */

const STORAGE_KEY = "expert_income_categories";

function getStoredIncomeCategories() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) return [];

    const parsed = JSON.parse(data);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveIncomeCategories(rows) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(rows)
  );
}

/* =========================================================
   ROUTE HELPER
========================================================= */

function useIncomeCategoryNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (slug) => {
    const currentPath = location.pathname.replace(
      /\/+$/,
      ""
    );

    const parentPath = currentPath.substring(
      0,
      currentPath.lastIndexOf("/")
    );

    navigate(`${parentPath}/${slug}`);
  };

  return {
    goCreate: () =>
      goTo("income-category-create"),

    goList: () =>
      goTo("income-category-list"),
  };
}

/* =========================================================
   SHARED UI
========================================================= */

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 5,
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
}) {
  return (
    <section className="overflow-hidden rounded-md border border-base-300 bg-base-100 shadow-sm">
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
  color = "info",
}) {
  const colorClasses =
    color === "success"
      ? "border-green-500 bg-green-500 hover:border-green-600 hover:bg-green-600"
      : "border-cyan-500 bg-cyan-500 hover:border-cyan-600 hover:bg-cyan-600";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className={`btn btn-sm min-h-0 text-white ${colorClasses}`}
    >
      {children}
    </motion.button>
  );
}

function RequiredNotice() {
  return (
    <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-red-500">
      (*) field required
    </div>
  );
}

/* =========================================================
   INCOME CATEGORY CREATE
========================================================= */

export function IncomeCategoryCreatePage() {
  const { goList } =
    useIncomeCategoryNavigation();

  const [categoryName, setCategoryName] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const value = categoryName.trim();

    if (!value) {
      setError(
        "Income Category Name is required."
      );
      setSuccess("");
      return;
    }

    const existing =
      getStoredIncomeCategories();

    const duplicate = existing.some(
      (item) =>
        item.name.toLowerCase() ===
        value.toLowerCase()
    );

    if (duplicate) {
      setError(
        "This income category already exists."
      );
      setSuccess("");
      return;
    }

    const newCategory = {
      id:
        crypto.randomUUID?.() ||
        `${Date.now()}`,
      name: value,
      createdBy: "Expert Coaching Center",
      createdDate:
        new Date().toLocaleString(),
    };

    const updated = [
      ...existing,
      newCategory,
    ];

    saveIncomeCategories(updated);

    setCategoryName("");
    setError("");
    setSuccess(
      "Income category created successfully."
    );
  };

  return (
    <PageWrapper>
      <Panel
        title="Create Income Category"
        action={
          <HeaderButton
            onClick={goList}
          >
            Back to Income category List
          </HeaderButton>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          <RequiredNotice />

          {error && (
            <div className="alert alert-error py-2 text-sm">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success py-2 text-sm text-white">
              <span>{success}</span>
            </div>
          )}

          <div className="grid max-w-6xl items-center gap-3 sm:grid-cols-[300px_minmax(0,1fr)]">
            <label
              htmlFor="income-category-name"
              className="text-sm font-bold"
            >
              Income Category Name:
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              id="income-category-name"
              type="text"
              value={categoryName}
              onChange={(event) => {
                setCategoryName(
                  event.target.value
                );

                if (error) {
                  setError("");
                }

                if (success) {
                  setSuccess("");
                }
              }}
              placeholder="Enter Income Category Name"
              className="input input-bordered input-sm w-full rounded"
            />
          </div>

          <div className="sm:pl-[300px]">
            <motion.button
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              type="submit"
              className="btn btn-success btn-sm min-h-0 text-white"
            >
              Submit
            </motion.button>
          </div>

          <div className="min-h-[15px]" />
        </form>
      </Panel>
    </PageWrapper>
  );
}

/* =========================================================
   INCOME CATEGORY LIST
========================================================= */

export function IncomeCategoryListPage() {
  const { goCreate } =
    useIncomeCategoryNavigation();

  const [rows, setRows] = useState(() =>
    getStoredIncomeCategories()
  );

  const [editingId, setEditingId] =
    useState(null);

  const [editingName, setEditingName] =
    useState("");

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        return String(
          b.createdDate
        ).localeCompare(
          String(a.createdDate)
        );
      }),
    [rows]
  );

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this income category?"
    );

    if (!confirmed) return;

    const updated = rows.filter(
      (row) => row.id !== id
    );

    setRows(updated);
    saveIncomeCategories(updated);

    if (editingId === id) {
      setEditingId(null);
      setEditingName("");
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditingName(row.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = (id) => {
    const value = editingName.trim();

    if (!value) {
      return;
    }

    const updated = rows.map((row) =>
      row.id === id
        ? {
            ...row,
            name: value,
          }
        : row
    );

    setRows(updated);
    saveIncomeCategories(updated);

    setEditingId(null);
    setEditingName("");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageWrapper>
      <Panel
        title="Income Category List"
        action={
          <div className="flex items-center gap-1">
            <HeaderButton
              onClick={goCreate}
            >
              Create Income category
            </HeaderButton>

            <HeaderButton
              color="success"
              onClick={handlePrint}
            >
              <Printer size={14} />
              Print
            </HeaderButton>
          </div>
        }
      >
        <div className="p-4 sm:p-5">
          <div className="overflow-x-auto">
            <table className="table table-xs w-full min-w-[850px] border border-base-300">
              <thead>
                <tr className="bg-base-200">
                  <th className="border border-base-300">
                    Income Category Name
                  </th>

                  <th className="border border-base-300">
                    Created By
                  </th>

                  <th className="border border-base-300">
                    Created Date
                  </th>

                  <th className="w-[180px] border border-base-300">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedRows.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-base-300 py-5 text-center text-base-content/60"
                    >
                      No data available in
                      table
                    </td>
                  </tr>
                ) : (
                  sortedRows.map(
                    (row) => (
                      <tr
                        key={row.id}
                        className="hover"
                      >
                        <td className="border border-base-300">
                          {editingId ===
                          row.id ? (
                            <input
                              type="text"
                              value={
                                editingName
                              }
                              onChange={(
                                event
                              ) =>
                                setEditingName(
                                  event
                                    .target
                                    .value
                                )
                              }
                              className="input input-bordered input-xs w-full"
                              autoFocus
                            />
                          ) : (
                            row.name
                          )}
                        </td>

                        <td className="border border-base-300">
                          {
                            row.createdBy
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.createdDate
                          }
                        </td>

                        <td className="border border-base-300">
                          {editingId ===
                          row.id ? (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  saveEdit(
                                    row.id
                                  )
                                }
                                className="btn btn-success btn-xs text-white"
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                onClick={
                                  cancelEdit
                                }
                                className="btn btn-ghost btn-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  startEdit(
                                    row
                                  )
                                }
                                title="Edit"
                                className="btn btn-info btn-square btn-xs text-white"
                              >
                                <Edit3
                                  size={
                                    13
                                  }
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    row.id
                                  )
                                }
                                title="Delete"
                                className="btn btn-error btn-square btn-xs text-white"
                              >
                                <Trash2
                                  size={
                                    13
                                  }
                                />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 text-sm font-bold">
            Showing{" "}
            {sortedRows.length
              ? 1
              : 0}{" "}
            to {sortedRows.length} of{" "}
            {sortedRows.length} results.
          </div>
        </div>
      </Panel>
    </PageWrapper>
  );
}