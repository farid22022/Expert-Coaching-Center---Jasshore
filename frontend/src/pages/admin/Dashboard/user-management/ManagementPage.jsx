import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { UserManagementNav } from "./UserManagementDashboard.jsx";

import "./../styles/studentManagement.css";

const STORAGE_KEY = "expertDemoManagementUsers";

const initialManagement = [
  {
    id: "MGT-001",
    name: "Academic Coordinator",
    designation: "Academic Coordinator",
    mobile: "01712000001",
    email: "academic@example.com",
    address: "Jashore, Bangladesh",
    image:
      "https://placehold.co/80x90/e8f2ee/173d33?text=AC",
  },
  {
    id: "MGT-002",
    name: "Office Administrator",
    designation: "Administrator",
    mobile: "01712000002",
    email: "admin.office@example.com",
    address: "Jashore, Bangladesh",
    image:
      "https://placehold.co/80x90/e8f2ee/173d33?text=OA",
  },
];

function loadManagement() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved
      ? JSON.parse(saved)
      : initialManagement;
  } catch {
    return initialManagement;
  }
}

function Panel({ title, action, children }) {
  return (
    <section className="student-panel">
      <div className="student-panel-title">
        <span>{title}</span>

        {action && (
          <div className="student-panel-action">
            {action}
          </div>
        )}
      </div>

      <div className="student-panel-body">
        {children}
      </div>
    </section>
  );
}

const emptyForm = {
  name: "",
  designation: "",
  mobile: "",
  email: "",
  address: "",
};

export default function ManagementPage() {
  const [management, setManagement] =
    useState(loadManagement);

  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(50);

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(management)
    );
  }, [management]);

  const filteredManagement = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return management;
    }

    return management.filter((person) =>
      [
        person.name,
        person.designation,
        person.mobile,
        person.email,
        person.address,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [management, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (person) => {
    setEditingId(person.id);

    setForm({
      name: person.name,
      designation: person.designation,
      mobile: person.mobile,
      email: person.email,
      address: person.address,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.designation.trim()
    ) {
      alert(
        "Name and designation are required."
      );
      return;
    }

    if (editingId) {
      setManagement((previous) =>
        previous.map((person) =>
          person.id === editingId
            ? {
                ...person,
                ...form,
              }
            : person
        )
      );
    } else {
      const initials = form.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      setManagement((previous) => [
        ...previous,
        {
          ...form,

          id: `MGT-${Date.now()}`,

          image:
            `https://placehold.co/80x90/e8f2ee/173d33?text=${encodeURIComponent(
              initials || "MG"
            )}`,
        },
      ]);
    }

    closeModal();
  };

  const removeManagement = (id) => {
    const confirmed = window.confirm(
      "Delete this management user?"
    );

    if (!confirmed) return;

    setManagement((previous) =>
      previous.filter(
        (person) => person.id !== id
      )
    );
  };

  const downloadExcelDemo = () => {
    const headings = [
      "Name",
      "Designation",
      "Mobile",
      "Email",
      "Address",
    ];

    const rows = management.map(
      (person) => [
        person.name,
        person.designation,
        person.mobile,
        person.email,
        person.address,
      ]
    );

    const csv = [
      headings,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "management-list.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="student-admin-page">
      <UserManagementNav />

      <Panel
        title="Management List"
        action={
          <div className="student-action-row management-header-actions">
            <button
              type="button"
              className="student-btn student-btn-secondary"
              onClick={openCreate}
            >
              <Plus size={14} />
              Create Management
            </button>

            <button
              type="button"
              className="student-btn student-btn-secondary"
              onClick={() =>
                window.print()
              }
            >
              <Download size={14} />
              Pdf Download
            </button>

            <button
              type="button"
              className="student-btn student-btn-secondary"
              onClick={downloadExcelDemo}
            >
              <FileSpreadsheet
                size={14}
              />
              Excel
            </button>
          </div>
        }
      >
        {/* Controls */}

        <div className="management-table-controls">
          <label>
            <select
              value={pageSize}
              onChange={(event) =>
                setPageSize(
                  Number(
                    event.target.value
                  )
                )
              }
              className="student-input management-page-size"
            >
              <option value={10}>
                10
              </option>

              <option value={25}>
                25
              </option>

              <option value={50}>
                50
              </option>

              <option value={100}>
                100
              </option>
            </select>

            <span>
              entries per page
            </span>
          </label>

          <label>
            <span>Search:</span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              className="student-input management-search"
            />
          </label>
        </div>


        {/* Table */}

        <div className="management-table-wrap">
          <table className="management-table">
            <thead>
              <tr>
                <th>SL No.</th>
                <th>Name</th>
                <th>Image</th>
                <th>
                  Designation
                </th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredManagement.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="management-empty"
                  >
                    No data available
                    in table
                  </td>
                </tr>
              ) : (
                filteredManagement
                  .slice(0, pageSize)
                  .map(
                    (
                      person,
                      index
                    ) => (
                      <tr
                        key={
                          person.id
                        }
                      >
                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {
                            person.name
                          }
                        </td>

                        <td>
                          <img
                            src={
                              person.image
                            }
                            alt={
                              person.name
                            }
                            className="management-avatar"
                          />
                        </td>

                        <td>
                          {
                            person.designation
                          }
                        </td>

                        <td>
                          {
                            person.mobile
                          }
                        </td>

                        <td>
                          {
                            person.email
                          }
                        </td>

                        <td>
                          {
                            person.address
                          }
                        </td>

                        <td>
                          <div className="management-actions">
                            <button
                              type="button"
                              className="employee-action cyan"
                              title="Edit"
                              onClick={() =>
                                openEdit(
                                  person
                                )
                              }
                            >
                              <Edit3
                                size={
                                  14
                                }
                              />
                            </button>

                            <button
                              type="button"
                              className="employee-action blue"
                              title="View"
                              onClick={() =>
                                alert(
                                  `${person.name}\n${person.designation}\n${person.mobile}`
                                )
                              }
                            >
                              <Eye
                                size={
                                  14
                                }
                              />
                            </button>

                            <button
                              type="button"
                              className="employee-action red"
                              title="Delete"
                              onClick={() =>
                                removeManagement(
                                  person.id
                                )
                              }
                            >
                              <Trash2
                                size={
                                  14
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


        {/* Footer */}

        <div className="management-table-footer">
          <span>
            Showing{" "}
            {filteredManagement.length
              ? 1
              : 0}{" "}
            to{" "}
            {Math.min(
              pageSize,
              filteredManagement.length
            )}{" "}
            of{" "}
            {
              filteredManagement.length
            }{" "}
            entries
          </span>

          <div className="management-pagination">
            <button>«</button>
            <button>‹</button>
            <button>1</button>
            <button>›</button>
            <button>»</button>
          </div>
        </div>
      </Panel>


      {/* CREATE / EDIT MODAL */}

      {modalOpen && (
        <div className="management-modal-backdrop">
          <div className="management-modal">
            <div className="management-modal-header">
              <h3>
                {editingId
                  ? "Update Management"
                  : "Create Management"}
              </h3>

              <button
                type="button"
                onClick={closeModal}
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="management-form"
            >
              <label>
                <span>
                  Full Name *
                </span>

                <input
                  name="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  className="student-input"
                  placeholder="Enter full name"
                />
              </label>

              <label>
                <span>
                  Designation *
                </span>

                <input
                  name="designation"
                  value={
                    form.designation
                  }
                  onChange={
                    handleChange
                  }
                  className="student-input"
                  placeholder="Enter designation"
                />
              </label>

              <label>
                <span>Mobile</span>

                <input
                  name="mobile"
                  value={
                    form.mobile
                  }
                  onChange={
                    handleChange
                  }
                  className="student-input"
                  placeholder="01XXXXXXXXX"
                />
              </label>

              <label>
                <span>Email</span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={
                    handleChange
                  }
                  className="student-input"
                  placeholder="example@email.com"
                />
              </label>

              <label className="management-form-full">
                <span>Address</span>

                <textarea
                  name="address"
                  value={
                    form.address
                  }
                  onChange={
                    handleChange
                  }
                  className="student-input"
                  rows={3}
                  placeholder="Enter address"
                />
              </label>

              <div className="management-form-actions">
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="student-btn student-btn-muted"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="student-btn student-btn-success"
                >
                  {editingId
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
