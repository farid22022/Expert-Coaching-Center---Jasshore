import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Edit3,
  Plus,
  Printer,
  Save,
  Trash2,
  X,
} from "lucide-react";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "expertExpenseCategories";

/* =========================================================
   HELPERS
========================================================= */

function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function formatCreatedDate(date = new Date()) {
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function loadExpenseCategories() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);

    if (!value) return [];

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveExpenseCategories(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  window.dispatchEvent(
    new CustomEvent("expense-categories-updated")
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

function useExpenseCategoryNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToList = () => {
    if (
      location.pathname.endsWith(
        "/expense-category-create"
      )
    ) {
      navigate(
        location.pathname.replace(
          /\/expense-category-create$/,
          "/expense-category-list"
        )
      );

      return;
    }

    navigate(-1);
  };

  const goToCreate = () => {
    if (
      location.pathname.endsWith(
        "/expense-category-list"
      )
    ) {
      navigate(
        location.pathname.replace(
          /\/expense-category-list$/,
          "/expense-category-create"
        )
      );

      return;
    }

    navigate("expense-category-create");
  };

  return {
    goToList,
    goToCreate,
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
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.25,
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

/* =========================================================
   CREATE PAGE
========================================================= */

export function ExpenseCategoryCreatePage() {
  const { goToList } =
    useExpenseCategoryNavigation();

  const [categoryName, setCategoryName] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanName =
      categoryName.trim();

    if (!cleanName) {
      setError(
        "Expense Category Name is required."
      );

      setSuccess("");

      return;
    }

    const categories =
      loadExpenseCategories();

    const alreadyExists =
      categories.some(
        (category) =>
          category.name
            ?.trim()
            .toLowerCase() ===
          cleanName.toLowerCase()
      );

    if (alreadyExists) {
      setError(
        "This expense category already exists."
      );

      setSuccess("");

      return;
    }

    const newCategory = {
      id: createId(),

      name: cleanName,

      createdBy:
        "Expert Coaching Center",

      createdDate:
        formatCreatedDate(),

      createdAt:
        new Date().toISOString(),
    };

    saveExpenseCategories([
      ...categories,
      newCategory,
    ]);

    setCategoryName("");

    setError("");

    setSuccess(
      "Expense category created successfully."
    );
  };

  return (
    <PageWrapper>
      <div className="min-h-[calc(100vh-80px)] bg-base-200/60 p-2 sm:p-4">
        <DashboardPanel
          title="Create Expense Category"
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
              Back to Expense category List
            </motion.button>
          }
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-5 sm:p-6"
          >
            <RequiredNotice />

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
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
                  key="success"
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

            <div className="grid max-w-[1180px] items-center gap-3 lg:grid-cols-[370px_minmax(0,770px)]">
              <label
                htmlFor="expense-category-name"
                className="text-sm font-bold"
              >
                Expense Category Name:
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="expense-category-name"
                type="text"
                value={categoryName}
                onChange={(event) => {
                  setCategoryName(
                    event.target.value
                  );

                  setError("");
                  setSuccess("");
                }}
                placeholder="Enter Expense Category Name"
                className="input input-bordered input-sm w-full rounded"
              />

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
   EDIT MODAL
========================================================= */

function EditExpenseCategoryModal({
  category,
  onClose,
  onSave,
}) {
  const [name, setName] = useState(
    category?.name || ""
  );

  if (!category) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) {
      return;
    }

    onSave({
      ...category,
      name: cleanName,
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
      className="fixed inset-0 z-[400] grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]"
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
        transition={{
          duration: 0.2,
        }}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="w-full max-w-xl overflow-hidden rounded-md bg-base-100 shadow-2xl"
      >
        <div className="flex items-center justify-between bg-[#456db5] px-5 py-3 text-white">
          <h2 className="font-bold">
            Update Expense Category
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-circle btn-ghost btn-sm text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >
          <label className="form-control">
            <span className="mb-2 text-sm font-bold">
              Expense Category Name
              <span className="text-red-500">
                *
              </span>
            </span>

            <input
              type="text"
              autoFocus
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              className="input input-bordered input-sm"
            />
          </label>

          <div className="flex justify-end gap-2">
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
   LIST PAGE
========================================================= */

export function ExpenseCategoryListPage() {
  const { goToCreate } =
    useExpenseCategoryNavigation();

  const [categories, setCategories] =
    useState(() =>
      loadExpenseCategories()
    );

  const [editingCategory, setEditingCategory] =
    useState(null);

  const rows = useMemo(
    () => categories,
    [categories]
  );

  const handleDelete = (category) => {
    const confirmed =
      window.confirm(
        `Delete expense category "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    const updated =
      categories.filter(
        (item) =>
          item.id !== category.id
      );

    setCategories(updated);

    saveExpenseCategories(updated);
  };

  const handleUpdate = (
    updatedCategory
  ) => {
    const duplicate =
      categories.some(
        (category) =>
          category.id !==
            updatedCategory.id &&
          category.name
            ?.trim()
            .toLowerCase() ===
            updatedCategory.name
              .trim()
              .toLowerCase()
      );

    if (duplicate) {
      alert(
        "An expense category with this name already exists."
      );

      return;
    }

    const updated =
      categories.map((category) =>
        category.id ===
        updatedCategory.id
          ? updatedCategory
          : category
      );

    setCategories(updated);

    saveExpenseCategories(updated);

    setEditingCategory(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageWrapper>
      <div className="min-h-[calc(100vh-80px)] bg-base-200/60 p-2 sm:p-4">
        <DashboardPanel
          title="Expense Category List"
          action={
            <div className="flex items-center gap-1">
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

                Create Expense category
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                type="button"
                onClick={handlePrint}
                className="btn btn-success btn-sm min-h-0 px-3 font-normal text-white"
              >
                <Printer size={14} />

                Print
              </motion.button>
            </div>
          }
        >
          <div className="p-4 sm:p-5">
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm min-w-[800px] border border-base-300">
                <thead>
                  <tr className="bg-base-200">
                    <th className="border-r border-base-300">
                      Expense Category Name
                    </th>

                    <th className="border-r border-base-300">
                      Created By
                    </th>

                    <th className="border-r border-base-300">
                      Created Date
                    </th>

                    <th>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((category) => (
                    <motion.tr
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      key={category.id}
                    >
                      <td className="border-r border-base-300 font-medium">
                        {category.name}
                      </td>

                      <td className="border-r border-base-300">
                        {category.createdBy}
                      </td>

                      <td className="border-r border-base-300">
                        {category.createdDate}
                      </td>

                      <td>
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{
                              scale: 1.08,
                            }}
                            whileTap={{
                              scale: 0.94,
                            }}
                            type="button"
                            onClick={() =>
                              setEditingCategory(
                                category
                              )
                            }
                            title="Edit"
                            className="btn btn-square btn-sm min-h-0 border-0 bg-cyan-500 text-white hover:bg-cyan-600"
                          >
                            <Edit3
                              size={15}
                            />
                          </motion.button>

                          <motion.button
                            whileHover={{
                              scale: 1.08,
                            }}
                            whileTap={{
                              scale: 0.94,
                            }}
                            type="button"
                            onClick={() =>
                              handleDelete(
                                category
                              )
                            }
                            title="Delete"
                            className="btn btn-error btn-square btn-sm min-h-0 text-white"
                          >
                            <Trash2
                              size={15}
                            />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length === 0 && (
              <div className="border-x border-b border-base-300 px-4 py-7 text-center text-sm text-base-content/50">
                No expense categories found.
              </div>
            )}

            <div className="mt-5 text-sm font-bold">
              Showing{" "}
              {rows.length > 0 ? 1 : 0} to{" "}
              {rows.length} of{" "}
              {rows.length} results.
            </div>
          </div>
        </DashboardPanel>
      </div>

      <AnimatePresence>
        {editingCategory && (
          <EditExpenseCategoryModal
            category={
              editingCategory
            }
            onClose={() =>
              setEditingCategory(
                null
              )
            }
            onSave={handleUpdate}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}