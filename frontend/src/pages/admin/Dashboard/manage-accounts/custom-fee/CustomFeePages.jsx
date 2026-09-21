import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const STORAGE_KEY = "expertCustomFeeCategories";

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

function formatDate(date = new Date()) {
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function loadCustomFees() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomFees(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  /*
    Notify other mounted components in the same browser tab.
  */
  window.dispatchEvent(
    new CustomEvent("expert-custom-fees-updated")
  );
}

/* =========================================================
   ROUTE HELPER

   Supports route structures like:

   /manage-accounts/custom-fee/custom-fee-create
   /manage-accounts/custom-fee/custom-fee-list

   and the same routes under /dashboard or /admin/dashboard.
========================================================= */

function useCustomFeeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToList = () => {
    if (
      location.pathname.endsWith(
        "/custom-fee-create"
      )
    ) {
      navigate(
        location.pathname.replace(
          /\/custom-fee-create$/,
          "/custom-fee-list"
        )
      );
      return;
    }

    navigate(-1);
  };

  const goToCreate = () => {
    if (
      location.pathname.endsWith(
        "/custom-fee-list"
      )
    ) {
      navigate(
        location.pathname.replace(
          /\/custom-fee-list$/,
          "/custom-fee-create"
        )
      );
      return;
    }

    navigate("custom-fee-create");
  };

  return {
    goToList,
    goToCreate,
  };
}

/* =========================================================
   COMMON PAGE WRAPPER
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

/* =========================================================
   PANEL
========================================================= */

function AccountPanel({
  title,
  action,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-md border border-base-300 bg-base-100 shadow-sm">
      {/* Header */}
      <div className="flex min-h-[42px] items-center justify-between gap-3 bg-[#456db5] px-5 py-2 text-white">
        <h1 className="text-[17px] font-bold sm:text-[19px]">
          {title}
        </h1>

        {action}
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   REQUIRED MESSAGE
========================================================= */

function RequiredMessage() {
  return (
    <div className="rounded border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

/* =========================================================
   CUSTOM FEE CREATE
========================================================= */

export function CustomFeeCreatePage() {
  const { goToList } =
    useCustomFeeNavigation();

  const [categoryName, setCategoryName] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      setError(
        "Custom Fee Category Name is required."
      );
      setSuccess("");
      return;
    }

    const existing = loadCustomFees();

    const alreadyExists = existing.some(
      (item) =>
        item.name
          ?.trim()
          .toLowerCase() ===
        name.toLowerCase()
    );

    if (alreadyExists) {
      setError(
        "This custom fee category already exists."
      );
      setSuccess("");
      return;
    }

    setSubmitting(true);

    const newItem = {
      id: createId(),
      name,
      createdDate: formatDate(),
    };

    const updated = [
      ...existing,
      newItem,
    ];

    saveCustomFees(updated);

    setCategoryName("");
    setError("");
    setSuccess(
      "Custom fee category created successfully."
    );
    setSubmitting(false);
  };

  return (
    <PageWrapper>
      <div className="bg-base-200/60 p-2 sm:p-4">
        <AccountPanel
          title="Custom Fee Create"
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
              Back to Custom fee List
            </motion.button>
          }
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5 p-5 sm:p-6"
          >
            <RequiredMessage />

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

            <div className="grid items-center gap-3 lg:grid-cols-[380px_minmax(0,770px)]">
              <label
                htmlFor="custom-fee-category"
                className="text-sm font-bold"
              >
                Custom Fee Category Name:
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="custom-fee-category"
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
                placeholder="Enter Custom Fee Category Name"
                className="input input-bordered input-sm w-full rounded"
              />
            </div>

            <div className="lg:pl-[380px]">
              <motion.button
                whileHover={{
                  scale: 1.025,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                type="submit"
                disabled={submitting}
                className="btn btn-success btn-sm min-h-0 text-white"
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <>
                    <Save size={14} />
                    Submit
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </AccountPanel>
      </div>
    </PageWrapper>
  );
}

/* =========================================================
   EDIT MODAL
========================================================= */

function EditCustomFeeModal({
  item,
  onClose,
  onSave,
}) {
  const [name, setName] = useState(
    item?.name || ""
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) {
      return;
    }

    onSave({
      ...item,
      name: cleanName,
    });
  };

  return (
    <AnimatePresence>
      {item && (
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
              y: 20,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
            }}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-xl overflow-hidden rounded-md bg-base-100 shadow-2xl"
          >
            <div className="flex items-center justify-between bg-[#456db5] px-5 py-3 text-white">
              <h2 className="font-bold">
                Update Custom Fee
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
              className="space-y-5 p-5"
            >
              <label className="form-control">
                <span className="mb-2 text-sm font-bold">
                  Custom Fee Category Name
                  <span className="text-error">
                    *
                  </span>
                </span>

                <input
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
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   CUSTOM FEE LIST
========================================================= */

export function CustomFeeListPage() {
  const { goToCreate } =
    useCustomFeeNavigation();

  const [fees, setFees] = useState(
    () => loadCustomFees()
  );

  const [editing, setEditing] =
    useState(null);

  const reload = () => {
    setFees(loadCustomFees());
  };

  const handleDelete = (item) => {
    const confirmed =
      window.confirm(
        `Delete "${item.name}"?`
      );

    if (!confirmed) {
      return;
    }

    const updated = fees.filter(
      (fee) => fee.id !== item.id
    );

    setFees(updated);
    saveCustomFees(updated);
  };

  const handleUpdate = (updatedItem) => {
    const duplicate = fees.some(
      (fee) =>
        fee.id !== updatedItem.id &&
        fee.name
          ?.trim()
          .toLowerCase() ===
          updatedItem.name
            .trim()
            .toLowerCase()
    );

    if (duplicate) {
      alert(
        "A custom fee category with this name already exists."
      );
      return;
    }

    const updated = fees.map((fee) =>
      fee.id === updatedItem.id
        ? updatedItem
        : fee
    );

    setFees(updated);
    saveCustomFees(updated);
    setEditing(null);
  };

  const rows = useMemo(
    () => fees,
    [fees]
  );

  return (
    <PageWrapper>
      <div className="bg-base-200/60 p-2 sm:p-4">
        <AccountPanel
          title="Custom Fee List"
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
              Create Custom fee
            </motion.button>
          }
        >
          <div className="p-4 sm:p-5">
            <div className="overflow-x-auto">
              <table className="table table-zebra table-sm min-w-[700px] border border-base-300">
                <thead>
                  <tr className="bg-base-200">
                    <th className="border-r border-base-300">
                      #
                    </th>

                    <th className="border-r border-base-300">
                      Custom Fee Category Name
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
                  {rows.map(
                    (item, index) => (
                      <motion.tr
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        key={item.id}
                      >
                        <td className="border-r border-base-300">
                          {index + 1}
                        </td>

                        <td className="border-r border-base-300 font-medium">
                          {item.name}
                        </td>

                        <td className="border-r border-base-300">
                          {item.createdDate}
                        </td>

                        <td>
                          <div className="flex items-center gap-1">
                            <motion.button
                              whileHover={{
                                scale: 1.08,
                              }}
                              whileTap={{
                                scale: 0.93,
                              }}
                              type="button"
                              onClick={() =>
                                setEditing(
                                  item
                                )
                              }
                              className="btn btn-square btn-sm min-h-0 border-0 bg-cyan-500 text-white hover:bg-cyan-600"
                              title="Edit"
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
                                scale: 0.93,
                              }}
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  item
                                )
                              }
                              className="btn btn-error btn-square btn-sm min-h-0 text-white"
                              title="Delete"
                            >
                              <Trash2
                                size={15}
                              />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 text-sm font-bold">
              Showing{" "}
              {rows.length
                ? 1
                : 0}{" "}
              to {rows.length} of{" "}
              {rows.length} results.
            </div>

            {rows.length === 0 && (
              <div className="mt-6 flex min-h-14 items-center justify-center rounded border border-dashed border-base-300 text-sm text-base-content/50">
                No custom fee categories found.
              </div>
            )}
          </div>
        </AccountPanel>
      </div>

      <EditCustomFeeModal
        item={editing}
        onClose={() =>
          setEditing(null)
        }
        onSave={handleUpdate}
      />
    </PageWrapper>
  );
}