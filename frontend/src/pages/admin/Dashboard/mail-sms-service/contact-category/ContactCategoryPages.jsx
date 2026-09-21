import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Pencil,
  Trash2,
} from "lucide-react";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "mail_sms_contact_categories";

function getStoredCategories() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCategories(rows) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(rows)
  );
}

/* =========================================================
   ROUTE HELPER
========================================================= */

function useContactCategoryNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goSibling = (slug) => {
    const path = location.pathname.replace(/\/+$/, "");
    const parent = path.substring(
      0,
      path.lastIndexOf("/")
    );

    navigate(`${parent}/${slug}`);
  };

  return {
    goCreate: () =>
      goSibling("contact-category-create"),

    goList: () =>
      goSibling("contact-category-list"),
  };
}

/* =========================================================
   SHARED UI
========================================================= */

function PageRoot({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="min-h-[calc(100vh-60px)] bg-[#f5f5f5] p-2 sm:p-4"
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
    <section className="overflow-hidden rounded-md border border-base-300 bg-white shadow-sm">
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
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      type="button"
      onClick={onClick}
      className="btn btn-info btn-sm min-h-0 text-white"
    >
      {children}
    </motion.button>
  );
}

function Input({
  className = "",
  ...props
}) {
  return (
    <input
      {...props}
      className={`input input-bordered input-sm h-8 min-h-8 w-full rounded-[3px] bg-white ${className}`}
    />
  );
}

/* =========================================================
   CONTACT CATEGORY CREATE
========================================================= */

function newRow() {
  return {
    id:
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random()}`,
    name: "",
  };
}

export function ContactCategoryCreatePage() {
  const { goList } =
    useContactCategoryNavigation();

  const [rowCount, setRowCount] =
    useState(1);

  const [rows, setRows] =
    useState([newRow()]);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const addRows = () => {
    const count = Math.max(
      1,
      Number(rowCount) || 1
    );

    const extraRows =
      Array.from(
        { length: count },
        () => newRow()
      );

    setRows((prev) => [
      ...prev,
      ...extraRows,
    ]);
  };

  const updateRow = (
    id,
    value
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              name: value,
            }
          : row
      )
    );

    if (error) setError("");
    if (success) setSuccess("");
  };

  const removeRow = (id) => {
    setRows((prev) => {
      if (prev.length === 1) {
        return prev.map((row) =>
          row.id === id
            ? {
                ...row,
                name: "",
              }
            : row
        );
      }

      return prev.filter(
        (row) => row.id !== id
      );
    });
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    const validRows = rows
      .map((row) => ({
        ...row,
        name: row.name.trim(),
      }))
      .filter((row) => row.name);

    if (!validRows.length) {
      setError(
        "Enter at least one category name."
      );
      setSuccess("");
      return;
    }

    const existing =
      getStoredCategories();

    const existingNames =
      new Set(
        existing.map((item) =>
          item.name.toLowerCase()
        )
      );

    const uniqueNewRows =
      validRows.filter(
        (row) =>
          !existingNames.has(
            row.name.toLowerCase()
          )
      );

    if (!uniqueNewRows.length) {
      setError(
        "All entered contact categories already exist."
      );
      setSuccess("");
      return;
    }

    const createdRows =
      uniqueNewRows.map((row) => ({
        id: row.id,
        name: row.name,
        totalContacts: 0,
        createdBy: "Admin",
        createdAt:
          new Date().toLocaleString(),
      }));

    const updated = [
      ...existing,
      ...createdRows,
    ];

    saveCategories(updated);

    setRows([newRow()]);
    setRowCount(1);
    setError("");
    setSuccess(
      `${createdRows.length} contact category${
        createdRows.length > 1
          ? "ies"
          : ""
      } created successfully.`
    );
  };

  return (
    <PageRoot>
      <Panel
        title="Contact category Create"
        action={
          <HeaderButton
            onClick={goList}
          >
            Back to Contact category List
          </HeaderButton>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="p-5"
        >
          {error && (
            <div className="alert alert-error mb-4 py-2 text-sm">
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4 py-2 text-sm text-white">
              <span>{success}</span>
            </div>
          )}

          <div className="mx-auto max-w-[770px]">
            <div className="overflow-hidden rounded-md border border-base-300 bg-white shadow-sm">
              <div className="flex min-h-[40px] items-center justify-between bg-[#456db5] px-5 py-2 text-white">
                <h3 className="text-lg font-bold">
                  Contact category Create
                </h3>

                <div className="join">
                  <input
                    type="number"
                    min="1"
                    value={rowCount}
                    onChange={(e) =>
                      setRowCount(
                        e.target.value
                      )
                    }
                    className="input input-sm join-item h-8 w-10 rounded-none bg-white px-2 text-center text-black"
                  />

                  <button
                    type="button"
                    onClick={addRows}
                    className="btn btn-info btn-sm join-item min-h-0 rounded-none text-white"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="overflow-x-auto">
                  <table className="table table-xs min-w-[600px] border border-base-300">
                    <thead>
                      <tr>
                        <th className="border border-base-300">
                          Category Name
                        </th>

                        <th className="w-[165px] border border-base-300">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row) => (
                        <motion.tr
                          key={row.id}
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                        >
                          <td className="border border-base-300 bg-[#f1f1f1]">
                            <Input
                              value={row.name}
                              onChange={(e) =>
                                updateRow(
                                  row.id,
                                  e.target
                                    .value
                                )
                              }
                              placeholder="Enter Category Name"
                            />
                          </td>

                          <td className="border border-base-300 bg-[#f1f1f1]">
                            <button
                              type="button"
                              onClick={() =>
                                removeRow(
                                  row.id
                                )
                              }
                              className="btn btn-error btn-square btn-sm h-8 min-h-8 w-8 text-white"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <motion.button
                whileTap={{
                  scale: 0.96,
                }}
                type="submit"
                className="btn btn-success btn-sm min-h-0 text-white"
              >
                Submit
              </motion.button>
            </div>
          </div>
        </form>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   CONTACT CATEGORY LIST
========================================================= */

export function ContactCategoryListPage() {
  const { goCreate } =
    useContactCategoryNavigation();

  const [rows, setRows] =
    useState(() =>
      getStoredCategories()
    );

  const [editingId, setEditingId] =
    useState(null);

  const [editingName, setEditingName] =
    useState("");

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) =>
        String(
          b.createdAt
        ).localeCompare(
          String(a.createdAt)
        )
      ),
    [rows]
  );

  const handleDelete = (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this contact category?"
      );

    if (!confirmed) return;

    const updated =
      rows.filter(
        (row) => row.id !== id
      );

    setRows(updated);
    saveCategories(updated);

    if (editingId === id) {
      setEditingId(null);
      setEditingName("");
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditingName(row.name);
  };

  const saveEdit = (id) => {
    const value =
      editingName.trim();

    if (!value) return;

    const updated =
      rows.map((row) =>
        row.id === id
          ? {
              ...row,
              name: value,
            }
          : row
      );

    setRows(updated);
    saveCategories(updated);

    setEditingId(null);
    setEditingName("");
  };

  return (
    <PageRoot>
      <Panel
        title="Contact category List"
        action={
          <HeaderButton
            onClick={goCreate}
          >
            Create Contact category
          </HeaderButton>
        }
      >
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="table table-xs w-full min-w-[900px] border border-base-300">
              <thead>
                <tr>
                  <th className="border border-base-300">
                    Contact Category Name
                  </th>

                  <th className="border border-base-300">
                    Total Contacts
                  </th>

                  <th className="border border-base-300">
                    Created By
                  </th>

                  <th className="border border-base-300">
                    Created At
                  </th>

                  <th className="border border-base-300">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedRows.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-base-300 py-7 text-center text-base-content/50"
                    >
                      No data available
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
                            <Input
                              value={
                                editingName
                              }
                              onChange={(
                                e
                              ) =>
                                setEditingName(
                                  e.target
                                    .value
                                )
                              }
                              autoFocus
                            />
                          ) : (
                            row.name
                          )}
                        </td>

                        <td className="border border-base-300">
                          {row.totalContacts ??
                            0}
                        </td>

                        <td className="border border-base-300">
                          {row.createdBy ||
                            "Admin"}
                        </td>

                        <td className="border border-base-300">
                          {row.createdAt ||
                            "-"}
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
                                onClick={() => {
                                  setEditingId(
                                    null
                                  );
                                  setEditingName(
                                    ""
                                  );
                                }}
                                className="btn btn-ghost btn-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                title="Edit"
                                onClick={() =>
                                  startEdit(
                                    row
                                  )
                                }
                                className="btn btn-info btn-square btn-xs text-white"
                              >
                                <Pencil
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
                          )}
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
            {sortedRows.length
              ? 1
              : 0}{" "}
            to {sortedRows.length} of{" "}
            {sortedRows.length} results.
          </p>
        </div>
      </Panel>
    </PageRoot>
  );
}