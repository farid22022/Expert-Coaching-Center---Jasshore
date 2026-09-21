import { useState } from "react";
import { motion } from "framer-motion";
import {
  Edit3,
  ImageIcon,
  School,
  Trash2,
} from "lucide-react";

/* =========================================================
   SHARED DATA
========================================================= */

const classOptions = [
  "SSC",
  "HSC",
  "Inter 2nd year",
  "Inter 1st year",
  "Class 10",
  "Class 09",
  "demo",
];

const shiftOptions = [
  "EXAM BATCH HSC 2026",
  "EXAM BATCH SSC 2026",
  "All Shift",
  "All shift for HSC",
  "9.30AM- 11.30AM Morning",
  "demo shift",
];

const sessions = ["2026", "2025", "2024"];

const subjectOptions = [
  "Bangla 1st Paper",
  "Bangla 2nd Paper",
  "English 1st Paper",
  "English 2nd Paper",
  "Mathematics",
  "ICT",
  "Physics",
  "Chemistry",
];

/* =========================================================
   INITIAL DATA
========================================================= */

const initialBuildings = [
  {
    id: 1,
    buildingName: "Office Building",
    fullName: "পাঠশালা স্কুল এন্ড কলেজ",
    createdDate: "2024-03-21 10:30:15",
  },
];

const initialFloors = [
  {
    id: 1,
    building: "Office Building",
    name: "3rd Floor",
    fullName: "",
    createdDate: "2025-02-17 11:17:03",
  },
  {
    id: 2,
    building: "Office Building",
    name: "2nd Floor",
    fullName: "",
    createdDate: "2025-02-17 11:16:39",
  },
  {
    id: 3,
    building: "Office Building",
    name: "1st Floor",
    fullName: "",
    createdDate: "2025-02-17 11:16:06",
  },
  {
    id: 4,
    building: "Office Building",
    name: "Ground Floor",
    fullName: "",
    createdDate: "2025-02-11 12:17:52",
  },
];

const initialRooms = [
  {
    id: 1,
    building: "Office Building",
    floor: "Ground Floor",
    roomNo: "SMALL",
    fullName: "Expert Coaching Center",
    createdDate: "2025-06-29 19:19:07",
  },
  {
    id: 2,
    building: "Office Building",
    floor: "Ground Floor",
    roomNo: "103",
    fullName: "Expert Coaching Center",
    createdDate: "2025-06-29 19:18:57",
  },
  {
    id: 3,
    building: "Office Building",
    floor: "Ground Floor",
    roomNo: "102",
    fullName: "Expert Coaching Center",
    createdDate: "2025-06-29 19:18:33",
  },
  {
    id: 4,
    building: "Office Building",
    floor: "Ground Floor",
    roomNo: "101",
    fullName: "Expert Coaching Center",
    createdDate: "2025-06-29 19:18:19",
  },
];

const initialClasses = [
  {
    id: 1,
    sorting: "0",
    className: "SSC",
    groupExists: "Yes",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-01-15 16:57:54",
  },
  {
    id: 2,
    sorting: "0",
    className: "HSC",
    groupExists: "Yes",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-01-15 16:58:06",
  },
  {
    id: 3,
    sorting: "1",
    className: "Inter 2nd year",
    groupExists: "Yes",
    createdBy: "Expert Coaching Center",
    createdDate: "2025-03-03 20:27:08",
  },
  {
    id: 4,
    sorting: "6",
    className: "Inter 1st year",
    groupExists: "Yes",
    createdBy: "Expert Coaching Center",
    createdDate: "2025-03-03 20:26:36",
  },
  {
    id: 5,
    sorting: "7",
    className: "Class 10",
    groupExists: "Yes",
    createdBy: "Expert Coaching Center",
    createdDate: "2025-02-28 10:25:34",
  },
  {
    id: 6,
    sorting: "9",
    className: "Class 09",
    groupExists: "Yes",
    createdBy: "Expert Coaching Center",
    createdDate: "2025-03-01 09:46:28",
  },
  {
    id: 7,
    sorting: "18",
    className: "demo",
    groupExists: "-",
    createdBy: "Admin",
    createdDate: "2025-03-09 14:53:25",
  },
];

const initialSections = [
  {
    id: 1,
    className: "HSC",
    sectionName: "EXAM BATCH",
    shift: "EXAM BATCH HSC 2026",
    createdDate: "2026-01-15 17:01:57",
    fullName: "Expert Coaching Center",
  },
  {
    id: 2,
    className: "SSC",
    sectionName: "EXAM BATCH",
    shift: "EXAM BATCH SSC 2026",
    createdDate: "2026-01-15 17:04:01",
    fullName: "Expert Coaching Center",
  },
  {
    id: 3,
    className: "Inter 2nd year",
    sectionName: "Day",
    shift: "EXAM BATCH HSC 2026",
    createdDate: "2025-11-16 16:59:40",
    fullName: "Expert Coaching Center",
  },
  {
    id: 4,
    className: "Inter 2nd year",
    sectionName: "All",
    shift: "All shift for HSC",
    createdDate: "2025-02-28 10:40:39",
    fullName: "Expert Coaching Center",
  },
  {
    id: 5,
    className: "Inter 1st year",
    sectionName: "Morning 07.00 - 09.00",
    shift: "All shift for HSC",
    createdDate: "2025-03-12 16:17:29",
    fullName: "Expert Coaching Center",
  },
  {
    id: 6,
    className: "Class 10",
    sectionName: "SSC 2026",
    shift: "EXAM BATCH SSC 2026",
    createdDate: "2025-12-24 17:51:56",
    fullName: "Expert Coaching Center",
  },
  {
    id: 7,
    className: "Class 10",
    sectionName: "Morning",
    shift: "9.30AM- 11.30AM Morning",
    createdDate: "2025-02-28 10:41:07",
    fullName: "Expert Coaching Center",
  },
  {
    id: 8,
    className: "Class 10",
    sectionName: "Day",
    shift: "All Shift",
    createdDate: "2025-04-16 17:08:39",
    fullName: "Admin",
  },
  {
    id: 9,
    className: "Class 09",
    sectionName: "Morning",
    shift: "9.30AM- 11.30AM Morning",
    createdDate: "2025-03-01 09:47:34",
    fullName: "Expert Coaching Center",
  },
  {
    id: 10,
    className: "Class 09",
    sectionName: "Day",
    shift: "All Shift",
    createdDate: "2025-03-01 09:47:53",
    fullName: "Expert Coaching Center",
  },
  {
    id: 11,
    className: "demo",
    sectionName: "demo",
    shift: "demo shift",
    createdDate: "2025-03-09 14:53:44",
    fullName: "Admin",
  },
];

const initialShifts = [
  {
    id: 1,
    sorting: "1",
    name: "EXAM BATCH HSC 2026",
    startTime: "07:00 AM",
    lateTime: "04:50 PM",
    endTime: "05:00 PM",
    fullName: "Expert Coaching Center",
    createdDate: "2025-11-16 16:57:12",
  },
  {
    id: 2,
    sorting: "2",
    name: "EXAM BATCH SSC 2026",
    startTime: "10:00 AM",
    lateTime: "10:20 AM",
    endTime: "06:00 PM",
    fullName: "Expert Coaching Center",
    createdDate: "2025-12-24 17:48:49",
  },
  {
    id: 3,
    sorting: "3",
    name: "All Shift",
    startTime: "02:00 PM",
    lateTime: "02:10 PM",
    endTime: "04:00 PM",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-28 10:39:39",
  },
  {
    id: 4,
    sorting: "4",
    name: "All shift for HSC",
    startTime: "07:00 AM",
    lateTime: "07:30 AM",
    endTime: "09:00 AM",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-28 10:28:43",
  },
  {
    id: 5,
    sorting: "5",
    name: "9.30AM- 11.30AM Morning",
    startTime: "02:00 PM",
    lateTime: "02:10 PM",
    endTime: "04:00 PM",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-28 10:37:43",
  },
  {
    id: 6,
    sorting: "16",
    name: "demo shift",
    startTime: "02:50 PM",
    lateTime: "02:55 PM",
    endTime: "03:45 PM",
    fullName: "Admin",
    createdDate: "2025-03-09 14:52:22",
  },
];

const initialGroups = [
  {
    id: 1,
    groupName: "Business",
    createdBy: "Expert Coaching Center",
    createdDate: "2025-02-28 10:27:10",
  },
  {
    id: 2,
    groupName: "Humanities",
    createdBy: "Expert Coaching Center",
    createdDate: "2025-02-28 10:26:38",
  },
  {
    id: 3,
    groupName: "Science",
    createdBy: "Expert Coaching Center",
    createdDate: "2025-02-28 10:26:19",
  },
];

const initialStudentCategories = [
  {
    id: 1,
    categoryName: "Day Care",
    createdBy: "Expert Coaching Center",
    createdDate: "2025-02-22 08:59:50",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function newId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `academic-${Date.now()}-${Math.random()}`
  );
}

function nowStamp() {
  return new Date()
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);
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
      className="min-h-[calc(100vh-60px)] bg-[#f5f5f5] p-2 sm:p-3"
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
      className={`overflow-hidden rounded-md border border-base-300 bg-white shadow-sm ${className}`}
    >
      <header className="flex min-h-[40px] flex-wrap items-center justify-between gap-2 bg-[#456db5] px-4 py-2 text-white">
        <h2 className="text-base font-bold sm:text-lg">
          {title}
        </h2>

        {action}
      </header>

      {children}
    </section>
  );
}

function Input({
  className = "",
  ...props
}) {
  return (
    <input
      {...props}
      className={`input input-bordered input-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white ${className}`}
    />
  );
}

function Select({
  className = "",
  children,
  ...props
}) {
  return (
    <select
      {...props}
      className={`select select-bordered select-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white ${className}`}
    >
      {children}
    </select>
  );
}

function RequiredNotice() {
  return (
    <div className="rounded border border-[#f1daa0] bg-[#fff3cd] px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

function ActionButtons({
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="btn btn-info btn-xs h-7 min-h-7 w-7 p-0 text-white"
        title="Edit"
      >
        <Edit3 size={14} />
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="btn btn-error btn-xs h-7 min-h-7 w-7 p-0 text-white"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/* =========================================================
   GENERIC CREATE / EDIT MODAL
========================================================= */

function CrudModal({
  title,
  open,
  fields,
  initialValue,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(
    initialValue || {}
  );

  if (!open) return null;

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        className="w-full max-w-2xl overflow-hidden rounded-md bg-white shadow-xl"
      >
        <div className="bg-[#456db5] px-5 py-3 text-lg font-bold text-white">
          {title}
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.key}
              className={
                field.fullWidth
                  ? "sm:col-span-2"
                  : ""
              }
            >
              <label className="mb-1 block text-sm font-bold text-black">
                {field.label}

                {field.required && (
                  <span className="text-red-500">
                    *
                  </span>
                )}
              </label>

              {field.type === "select" ? (
                <Select
                  value={
                    form[field.key] ??
                    ""
                  }
                  onChange={(e) =>
                    update(
                      field.key,
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    {field.placeholder ??
                      "Select"}
                  </option>

                  {(field.options || []).map(
                    (option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {option}
                      </option>
                    )
                  )}
                </Select>
              ) : (
                <Input
                  type={
                    field.type ||
                    "text"
                  }
                  value={
                    form[field.key] ??
                    ""
                  }
                  placeholder={
                    field.placeholder
                  }
                  onChange={(e) =>
                    update(
                      field.key,
                      e.target.value
                    )
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              onSave(form)
            }
            className="btn btn-success btn-sm text-white"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================
   GENERIC LIST PAGE
========================================================= */

function CrudListPage({
  title,
  createLabel,
  columns,
  initialRows,
  fields,
  defaults = {},
}) {
  const [rows, setRows] =
    useState(initialRows);

  const [modal, setModal] =
    useState({
      open: false,
      row: null,
    });

  const deleteRow = (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this item?"
      )
    ) {
      return;
    }

    setRows((prev) =>
      prev.filter(
        (row) => row.id !== id
      )
    );
  };

  const saveRow = (form) => {
    if (modal.row) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === modal.row.id
            ? {
                ...row,
                ...form,
              }
            : row
        )
      );
    } else {
      setRows((prev) => [
        ...prev,
        {
          id: newId(),
          ...defaults,
          ...form,
          createdDate:
            form.createdDate ||
            nowStamp(),
        },
      ]);
    }

    setModal({
      open: false,
      row: null,
    });
  };

  return (
    <PageRoot>
      <Panel
        title={title}
        action={
          <button
            type="button"
            onClick={() =>
              setModal({
                open: true,
                row: null,
              })
            }
            className="btn btn-info btn-sm min-h-0 text-white"
          >
            {createLabel}
          </button>
        }
      >
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="table table-xs min-w-[900px] border border-base-300">
              <thead className="bg-white text-black">
                <tr>
                  {columns.map(
                    (column) => (
                      <th
                        key={
                          column.key
                        }
                        className="border border-base-300"
                      >
                        {
                          column.label
                        }
                      </th>
                    )
                  )}

                  <th className="border border-base-300">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map(
                  (row, index) => (
                    <tr
                      key={row.id}
                      className={
                        index % 2 ===
                        0
                          ? "bg-[#f1f1f1]"
                          : "bg-white"
                      }
                    >
                      {columns.map(
                        (column) => (
                          <td
                            key={
                              column.key
                            }
                            className="border border-base-300"
                          >
                            {column.render
                              ? column.render(
                                  row,
                                  index
                                )
                              : row[
                                  column
                                    .key
                                ]}
                          </td>
                        )
                      )}

                      <td className="border border-base-300">
                        <ActionButtons
                          onEdit={() =>
                            setModal(
                              {
                                open: true,
                                row,
                              }
                            )
                          }
                          onDelete={() =>
                            deleteRow(
                              row.id
                            )
                          }
                        />
                      </td>
                    </tr>
                  )
                )}

                {rows.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={
                        columns.length +
                        1
                      }
                      className="border border-base-300 py-7 text-center text-slate-400"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-sm font-bold text-black">
            Showing{" "}
            {rows.length
              ? 1
              : 0}{" "}
            to {rows.length} of{" "}
            {rows.length} results.
          </p>
        </div>
      </Panel>

      <CrudModal
        key={
          modal.row?.id ??
          "new-record"
        }
        title={
          modal.row
            ? `Update ${createLabel.replace(
                /^Create\s+/,
                ""
              )}`
            : createLabel
        }
        open={modal.open}
        fields={fields}
        initialValue={
          modal.row || defaults
        }
        onClose={() =>
          setModal({
            open: false,
            row: null,
          })
        }
        onSave={saveRow}
      />
    </PageRoot>
  );
}

/* =========================================================
   1. BUILDING LIST
========================================================= */

export function BuildingListPage() {
  return (
    <CrudListPage
      title="Building List"
      createLabel="Create Building"
      initialRows={
        initialBuildings
      }
      columns={[
        {
          key: "buildingName",
          label: "Building Name",
        },
        {
          key: "fullName",
          label: "Full Name",
        },
        {
          key: "createdDate",
          label: "Created Date",
        },
      ]}
      fields={[
        {
          key: "buildingName",
          label: "Building Name",
          required: true,
          placeholder:
            "Enter Building Name",
        },
        {
          key: "fullName",
          label: "Full Name",
          placeholder:
            "Enter Full Name",
        },
      ]}
    />
  );
}

/* =========================================================
   2. FLOOR LIST
========================================================= */

export function FloorListPage() {
  return (
    <CrudListPage
      title="Floor List"
      createLabel="Create Floor"
      initialRows={initialFloors}
      columns={[
        {
          key: "building",
          label: "Building",
        },
        {
          key: "name",
          label: "Name",
        },
        {
          key: "fullName",
          label: "Full Name",
        },
        {
          key: "createdDate",
          label: "Created Date",
        },
      ]}
      fields={[
        {
          key: "building",
          label: "Building",
          required: true,
          type: "select",
          options: [
            "Office Building",
          ],
        },
        {
          key: "name",
          label: "Floor Name",
          required: true,
          placeholder:
            "Enter Floor Name",
        },
        {
          key: "fullName",
          label: "Full Name",
          placeholder:
            "Enter Full Name",
        },
      ]}
    />
  );
}

/* =========================================================
   3. CLASS ROOM LIST
========================================================= */

export function ClassRoomListPage() {
  return (
    <CrudListPage
      title="Class Room List"
      createLabel="Create Class room"
      initialRows={initialRooms}
      columns={[
        {
          key: "building",
          label: "Building",
        },
        {
          key: "floor",
          label: "Floor",
        },
        {
          key: "roomNo",
          label: "Room No",
        },
        {
          key: "fullName",
          label: "Full Name",
        },
        {
          key: "createdDate",
          label: "Created Date",
        },
      ]}
      fields={[
        {
          key: "building",
          label: "Building",
          type: "select",
          required: true,
          options: [
            "Office Building",
          ],
        },
        {
          key: "floor",
          label: "Floor",
          type: "select",
          required: true,
          options: [
            "Ground Floor",
            "1st Floor",
            "2nd Floor",
            "3rd Floor",
          ],
        },
        {
          key: "roomNo",
          label: "Room No",
          required: true,
          placeholder:
            "Enter Room No",
        },
        {
          key: "fullName",
          label: "Full Name",
          placeholder:
            "Enter Full Name",
        },
      ]}
      defaults={{
        fullName:
          "Expert Coaching Center",
      }}
    />
  );
}

/* =========================================================
   4. CLASS TEACHER ASSIGN LIST
========================================================= */

export function ClassTeacherAssignListPage() {
  return (
    <CrudListPage
      title="Class Teacher List"
      createLabel="Create Class teacher assign"
      initialRows={[]}
      columns={[
        {
          key: "serial",
          label: "#",
          render: (
            _row,
            index
          ) => index + 1,
        },
        {
          key: "className",
          label: "Class",
        },
        {
          key: "section",
          label: "Section",
        },
        {
          key: "teacher",
          label:
            "Class Teacher Name",
        },
        {
          key: "createdDate",
          label: "Created Date",
        },
      ]}
      fields={[
        {
          key: "className",
          label: "Class",
          type: "select",
          options: classOptions,
          required: true,
        },
        {
          key: "section",
          label: "Section",
          type: "select",
          options: [
            "EXAM BATCH",
            "Morning",
            "Day",
            "All",
            "demo",
          ],
          required: true,
        },
        {
          key: "teacher",
          label:
            "Class Teacher Name",
          required: true,
          placeholder:
            "Enter Teacher Name",
        },
      ]}
    />
  );
}

/* =========================================================
   5. SUBJECT COMBINE CREATE
========================================================= */

function newCombineRow() {
  return {
    id: newId(),
    className: "",
    combineName: "",
    subject: "",
  };
}

export function SubjectCombineCreatePage() {
  const [count, setCount] =
    useState(1);

  const [rows, setRows] =
    useState([
      newCombineRow(),
    ]);

  const updateRow = (
    id,
    key,
    value
  ) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [key]: value,
            }
          : row
      )
    );
  };

  const addRows = () => {
    const amount = Math.max(
      1,
      Number(count) || 1
    );

    setRows((prev) => [
      ...prev,
      ...Array.from(
        { length: amount },
        () => newCombineRow()
      ),
    ]);
  };

  const removeRow = (id) => {
    setRows((prev) =>
      prev.filter(
        (row) => row.id !== id
      )
    );
  };

  return (
    <PageRoot>
      <Panel
        title="Create Subject Combine"
        action={
          <button
            type="button"
            onClick={() =>
              window.history.back()
            }
            className="btn btn-info btn-sm min-h-0 text-white"
          >
            Back to Subject combine List
          </button>
        }
      >
        <div className="space-y-4 p-5">
          <RequiredNotice />

          <section className="mx-auto max-w-[1065px] overflow-hidden rounded border border-[#456db5] bg-white">
            <div className="flex items-center justify-between bg-[#456db5] px-4 py-1 text-white">
              <h3 className="text-lg font-bold">
                Subject Combine
              </h3>

              <div className="flex">
                <Input
                  type="number"
                  min="1"
                  value={count}
                  onChange={(e) =>
                    setCount(
                      e.target.value
                    )
                  }
                  className="w-10 rounded-r-none text-center"
                />

                <button
                  type="button"
                  onClick={addRows}
                  className="btn btn-info btn-sm min-h-0 rounded-l-none text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[850px]">
                <thead className="text-black">
                  <tr>
                    <th className="border border-base-300">
                      Class
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th className="border border-base-300">
                      Subject Combine Name
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th className="border border-base-300">
                      Subject
                      <span className="text-red-500">
                        *
                      </span>
                    </th>

                    <th className="border border-base-300">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="border border-base-300">
                        <Select
                          value={
                            row.className
                          }
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "className",
                              e.target
                                .value
                            )
                          }
                        >
                          <option value="">
                            Select Class
                          </option>

                          {classOptions.map(
                            (
                              className
                            ) => (
                              <option
                                key={
                                  className
                                }
                              >
                                {
                                  className
                                }
                              </option>
                            )
                          )}
                        </Select>
                      </td>

                      <td className="border border-base-300">
                        <Input
                          value={
                            row.combineName
                          }
                          placeholder="Enter Subject Combine"
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "combineName",
                              e.target
                                .value
                            )
                          }
                        />
                      </td>

                      <td className="border border-base-300">
                        <Select
                          value={
                            row.subject
                          }
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              "subject",
                              e.target
                                .value
                            )
                          }
                          className={
                            !row.subject
                              ? "text-slate-400"
                              : ""
                          }
                        >
                          <option value="">
                            Nothing selected
                          </option>

                          {subjectOptions.map(
                            (subject) => (
                              <option
                                key={
                                  subject
                                }
                              >
                                {
                                  subject
                                }
                              </option>
                            )
                          )}
                        </Select>
                      </td>

                      <td className="border border-base-300">
                        <button
                          type="button"
                          onClick={() =>
                            removeRow(
                              row.id
                            )
                          }
                          className="btn btn-error btn-xs text-white"
                        >
                          <Trash2
                            size={14}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="h-12" />
          </section>

          <div className="mx-auto max-w-[1065px] pl-[136px]">
            <button
              type="button"
              onClick={() =>
                window.alert(
                  "Subject combine submitted."
                )
              }
              className="btn btn-success btn-sm min-h-0 text-white"
            >
              Submit
            </button>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   6. CLASS LIST
========================================================= */

export function ClassPage() {
  return (
    <CrudListPage
      title="Class List"
      createLabel="Create Classes"
      initialRows={initialClasses}
      columns={[
        {
          key: "sl",
          label: "SL NO.",
          render: (
            _row,
            index
          ) => index + 1,
        },
        {
          key: "sorting",
          label: "Sorting",
        },
        {
          key: "className",
          label: "Class Name",
        },
        {
          key: "groupExists",
          label: "Group Exists",
        },
        {
          key: "createdBy",
          label: "Created By",
        },
        {
          key: "createdDate",
          label: "Created Date",
        },
      ]}
      fields={[
        {
          key: "sorting",
          label: "Sorting",
          type: "number",
          required: true,
        },
        {
          key: "className",
          label: "Class Name",
          required: true,
        },
        {
          key: "groupExists",
          label: "Group Exists",
          type: "select",
          options: ["Yes", "-"],
        },
      ]}
      defaults={{
        createdBy:
          "Expert Coaching Center",
        groupExists: "Yes",
      }}
    />
  );
}

/* =========================================================
   7. SECTION LIST
========================================================= */

export function SectionPage() {
  return (
    <CrudListPage
      title="Section List"
      createLabel="Create Section"
      initialRows={
        initialSections
      }
      columns={[
        {
          key: "className",
          label: "Class Name",
        },
        {
          key: "sectionName",
          label: "Section Name",
        },
        {
          key: "shift",
          label: "Shift",
        },
        {
          key: "createdDate",
          label: "Created Date",
        },
        {
          key: "fullName",
          label: "Full Name",
        },
      ]}
      fields={[
        {
          key: "className",
          label: "Class Name",
          type: "select",
          options: classOptions,
          required: true,
        },
        {
          key: "sectionName",
          label: "Section Name",
          required: true,
        },
        {
          key: "shift",
          label: "Shift",
          type: "select",
          options: shiftOptions,
          required: true,
        },
        {
          key: "fullName",
          label: "Full Name",
        },
      ]}
      defaults={{
        fullName:
          "Expert Coaching Center",
      }}
    />
  );
}

/* =========================================================
   8. SYLLABUS
========================================================= */

export function SyllabusPage() {
  const [filters, setFilters] =
    useState({
      session: "2026",
      className: "",
    });

  const [rows, setRows] =
    useState([]);

  const [selected, setSelected] =
    useState([]);

  const [modalOpen, setModalOpen] =
    useState(false);

  const toggleSelected = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter(
            (item) =>
              item !== id
          )
        : [...prev, id]
    );
  };

  const deleteSelected = () => {
    if (!selected.length)
      return;

    setRows((prev) =>
      prev.filter(
        (row) =>
          !selected.includes(
            row.id
          )
      )
    );

    setSelected([]);
  };

  return (
    <PageRoot>
      <div className="space-y-5">
        <Panel title="Session Syllabus List">
          <div className="p-5">
            <div className="grid max-w-[1330px] gap-x-7 gap-y-4 lg:grid-cols-2">
              <div className="grid items-center gap-3 sm:grid-cols-[145px_1fr]">
                <label className="text-sm">
                  Session Year:
                </label>

                <Select
                  value={
                    filters.session
                  }
                  onChange={(e) =>
                    setFilters(
                      (prev) => ({
                        ...prev,
                        session:
                          e.target
                            .value,
                      })
                    )
                  }
                >
                  {sessions.map(
                    (session) => (
                      <option
                        key={
                          session
                        }
                      >
                        {session}
                      </option>
                    )
                  )}
                </Select>
              </div>

              <div className="grid items-center gap-3 sm:grid-cols-[145px_1fr]">
                <label className="text-sm">
                  Class:
                </label>

                <Select
                  value={
                    filters.className
                  }
                  onChange={(e) =>
                    setFilters(
                      (prev) => ({
                        ...prev,
                        className:
                          e.target
                            .value,
                      })
                    )
                  }
                >
                  <option value="">
                    Select Class
                  </option>

                  {classOptions.map(
                    (
                      className
                    ) => (
                      <option
                        key={
                          className
                        }
                      >
                        {
                          className
                        }
                      </option>
                    )
                  )}
                </Select>
              </div>

              <div className="sm:ml-[158px]">
                <button
                  type="button"
                  className="btn btn-info btn-sm min-h-0 text-white"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title="Session Syllabus List"
          action={
            <button
              type="button"
              onClick={() =>
                setModalOpen(true)
              }
              className="btn btn-info btn-sm min-h-0 text-white"
            >
              Create Session syllabus
            </button>
          }
        >
          <div className="p-4">
            <button
              type="button"
              onClick={
                deleteSelected
              }
              className="btn btn-error btn-sm mb-0 min-h-0 text-white"
            >
              Delete Selected Items
            </button>

            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[1000px] border border-base-300">
                <thead className="bg-[#f2f2f2] text-black">
                  <tr>
                    <th className="border border-base-300">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-xs"
                        checked={
                          rows.length >
                            0 &&
                          selected.length ===
                            rows.length
                        }
                        onChange={(
                          e
                        ) =>
                          setSelected(
                            e.target
                              .checked
                              ? rows.map(
                                  (
                                    row
                                  ) =>
                                    row.id
                                )
                              : []
                          )
                        }
                      />{" "}
                      #
                    </th>

                    <th className="border border-base-300">
                      Session Name
                    </th>

                    <th className="border border-base-300">
                      Title
                    </th>

                    <th className="border border-base-300">
                      Syllabus
                    </th>

                    <th className="border border-base-300">
                      Full Name
                    </th>

                    <th className="border border-base-300">
                      Created Date
                    </th>

                    <th className="border border-base-300">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map(
                    (row, index) => (
                      <tr
                        key={row.id}
                      >
                        <td className="border border-base-300">
                          <input
                            type="checkbox"
                            checked={selected.includes(
                              row.id
                            )}
                            onChange={() =>
                              toggleSelected(
                                row.id
                              )
                            }
                            className="checkbox checkbox-xs"
                          />{" "}
                          {index + 1}
                        </td>

                        <td className="border border-base-300">
                          {
                            row.sessionName
                          }
                        </td>

                        <td className="border border-base-300">
                          {row.title}
                        </td>

                        <td className="border border-base-300">
                          {
                            row.syllabus
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.fullName
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.createdDate
                          }
                        </td>

                        <td className="border border-base-300">
                          <button
                            type="button"
                            onClick={() =>
                              setRows(
                                (
                                  prev
                                ) =>
                                  prev.filter(
                                    (
                                      item
                                    ) =>
                                      item.id !==
                                      row.id
                                  )
                              )
                            }
                            className="btn btn-error btn-xs text-white"
                          >
                            <Trash2
                              size={14}
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-5 text-sm font-bold">
              Showing{" "}
              {rows.length
                ? 1
                : 0}{" "}
              to {rows.length} of{" "}
              {rows.length} results.
            </p>
          </div>
        </Panel>
      </div>

      <CrudModal
        key={
          modalOpen
            ? "new-syllabus"
            : "closed"
        }
        title="Create Session syllabus"
        open={modalOpen}
        fields={[
          {
            key: "sessionName",
            label:
              "Session Name",
            type: "select",
            options: sessions,
            required: true,
          },
          {
            key: "title",
            label: "Title",
            required: true,
          },
          {
            key: "syllabus",
            label: "Syllabus",
            required: true,
            fullWidth: true,
            placeholder:
              "Syllabus file/name",
          },
        ]}
        initialValue={{
          sessionName: "2026",
        }}
        onClose={() =>
          setModalOpen(false)
        }
        onSave={(form) => {
          setRows((prev) => [
            ...prev,
            {
              id: newId(),
              ...form,
              fullName:
                "Expert Coaching Center",
              createdDate:
                nowStamp(),
            },
          ]);

          setModalOpen(false);
        }}
      />
    </PageRoot>
  );
}

/* =========================================================
   9. SHIFT LIST
========================================================= */

export function ShiftPage() {
  return (
    <CrudListPage
      title="School Shift List"
      createLabel="Create School shift"
      initialRows={initialShifts}
      columns={[
        {
          key: "sl",
          label: "SL.",
          render: (
            _row,
            index
          ) => index + 1,
        },
        {
          key: "sorting",
          label: "Sorting",
        },
        {
          key: "name",
          label: "Name",
        },
        {
          key: "startTime",
          label: "Start Time",
        },
        {
          key: "lateTime",
          label: "Late Time",
        },
        {
          key: "endTime",
          label: "End Time",
        },
        {
          key: "fullName",
          label: "Full Name",
        },
        {
          key: "createdDate",
          label: "Created Date",
        },
      ]}
      fields={[
        {
          key: "sorting",
          label: "Sorting",
          type: "number",
        },
        {
          key: "name",
          label: "Shift Name",
          required: true,
        },
        {
          key: "startTime",
          label: "Start Time",
          required: true,
          placeholder:
            "07:00 AM",
        },
        {
          key: "lateTime",
          label: "Late Time",
          placeholder:
            "07:30 AM",
        },
        {
          key: "endTime",
          label: "End Time",
          required: true,
          placeholder:
            "09:00 AM",
        },
      ]}
      defaults={{
        fullName:
          "Expert Coaching Center",
      }}
    />
  );
}

/* =========================================================
   10. STUDENT GROUP
========================================================= */

export function StudentGroupPage() {
  return (
    <CrudListPage
      title="Groups List"
      createLabel="Create Groups"
      initialRows={initialGroups}
      columns={[
        {
          key: "groupName",
          label: "Group Name",
        },
        {
          key: "createdBy",
          label: "Created By",
        },
        {
          key: "createdDate",
          label: "Created Date",
        },
      ]}
      fields={[
        {
          key: "groupName",
          label: "Group Name",
          required: true,
          placeholder:
            "Enter Group Name",
        },
      ]}
      defaults={{
        createdBy:
          "Expert Coaching Center",
      }}
    />
  );
}

/* =========================================================
   11. STUDENT CATEGORY
========================================================= */

export function StudentCategoryPage() {
  return (
    <CrudListPage
      title="Student Category List"
      createLabel="Create Student category"
      initialRows={
        initialStudentCategories
      }
      columns={[
        {
          key: "categoryName",
          label:
            "Student Category Name",
        },
        {
          key: "createdBy",
          label: "Created By",
        },
        {
          key: "createdDate",
          label: "Created Date",
        },
      ]}
      fields={[
        {
          key: "categoryName",
          label:
            "Student Category Name",
          required: true,
          placeholder:
            "Enter Student Category Name",
        },
      ]}
      defaults={{
        createdBy:
          "Expert Coaching Center",
      }}
    />
  );
}

/* =========================================================
   12. ACADEMIC SETUP
========================================================= */

function SetupField({
  label,
  required = false,
  children,
}) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[185px_minmax(0,1fr)]">
      <label className="text-sm font-bold text-black">
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

function PreviewBox({
  src,
  small = false,
}) {
  return (
    <div
      className={`mt-1 flex items-center justify-center overflow-hidden rounded border border-slate-300 bg-white ${
        small
          ? "h-10 w-10"
          : "h-24 w-24"
      }`}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-contain"
        />
      ) : small ? (
        <ImageIcon
          size={19}
          className="text-slate-400"
        />
      ) : (
        <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-black text-center">
          <School size={28} />

          <span className="mt-1 text-[8px] font-black">
            Expert Coaching
          </span>
        </div>
      )}
    </div>
  );
}

export function AcademicSetupPage() {
  const [form, setForm] =
    useState({
      name:
        "EXPERT COACHING CENTER",
      nameBn:
        "এক্সপার্ট কোচিং সেন্টার",
      email:
        "expertjashore@gmail.com",
      phone: "01719486254",
      mobile: "01719486254",
      eiin: "",
      institutionCode: "",
      institutionType:
        "Coaching Center",
      established: "2017",
      district: "Jashore",
      upazila: "Sadar",
      postOffice: "যশোর-৭৪০০",
      address:
        "Stadium Road, Puraton Library, Judge Court Mor, Jashore",
      addressBn:
        "স্টেডিয়াম রোড, পুরাতন লাইব্রেরী, যশোর।",
    });

  const [logoPreview, setLogoPreview] =
    useState("");

  const [
    faviconPreview,
    setFaviconPreview,
  ] = useState("");

  const update = (
    key,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const previewFile = (
    file,
    setter
  ) => {
    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = () => {
      setter(
        String(
          reader.result || ""
        )
      );
    };

    reader.readAsDataURL(file);
  };

  return (
    <PageRoot>
      <Panel title="Setup Institution Information">
        <div className="space-y-5 p-5">
          <RequiredNotice />

          <div className="grid gap-x-7 gap-y-4 xl:grid-cols-2">
            {/* LEFT */}
            <div className="space-y-4">
              <SetupField
                label="Name:"
                required
              >
                <Input
                  value={form.name}
                  onChange={(e) =>
                    update(
                      "name",
                      e.target.value
                    )
                  }
                />
              </SetupField>

              <SetupField label="Name (bn):">
                <Input
                  value={
                    form.nameBn
                  }
                  onChange={(e) =>
                    update(
                      "nameBn",
                      e.target.value
                    )
                  }
                />
              </SetupField>

              <SetupField
                label="Email:"
                required
              >
                <Input
                  value={
                    form.email
                  }
                  onChange={(e) =>
                    update(
                      "email",
                      e.target.value
                    )
                  }
                />
              </SetupField>

              <SetupField
                label="Phone:"
                required
              >
                <Input
                  value={
                    form.phone
                  }
                  onChange={(e) =>
                    update(
                      "phone",
                      e.target.value
                    )
                  }
                />
              </SetupField>

              <SetupField
                label="Mobile:"
                required
              >
                <Input
                  value={
                    form.mobile
                  }
                  onChange={(e) =>
                    update(
                      "mobile",
                      e.target.value
                    )
                  }
                />
              </SetupField>

              <SetupField label="EIIN No:">
                <Input
                  value={form.eiin}
                  placeholder="Enter EIIN No"
                  onChange={(e) =>
                    update(
                      "eiin",
                      e.target.value
                    )
                  }
                />
              </SetupField>

              <SetupField label="Institution Code:">
                <Input
                  value={
                    form.institutionCode
                  }
                  placeholder="Enter Institution Code"
                  onChange={(e) =>
                    update(
                      "institutionCode",
                      e.target.value
                    )
                  }
                />
              </SetupField>

              <SetupField label="Institution Type:">
                <Select
                  value={
                    form.institutionType
                  }
                  onChange={(e) =>
                    update(
                      "institutionType",
                      e.target.value
                    )
                  }
                >
                  <option>
                    Coaching Center
                  </option>
                  <option>
                    School
                  </option>
                  <option>
                    College
                  </option>
                  <option>
                    School & College
                  </option>
                </Select>
              </SetupField>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              <SetupField label="Year Of Established:">
                <Input
                  value={
                    form.established
                  }
                  onChange={(e) =>
                    update(
                      "established",
                      e.target.value
                    )
                  }
                />
              </SetupField>

              <SetupField
                label="District:"
                required
              >
                <Select
                  value={
                    form.district
                  }
                  onChange={(e) =>
                    update(
                      "district",
                      e.target.value
                    )
                  }
                >
                  <option>
                    Jashore
                  </option>
                  <option>
                    Khulna
                  </option>
                  <option>
                    Dhaka
                  </option>
                </Select>
              </SetupField>

              <SetupField
                label="Upazila:"
                required
              >
                <Input
                  value={
                    form.upazila
                  }
                  onChange={(e) =>
                    update(
                      "upazila",
                      e.target.value
                    )
                  }
                />
              </SetupField>

              <SetupField
                label="Post Office:"
                required
              >
                <Input
                  value={
                    form.postOffice
                  }
                  onChange={(e) =>
                    update(
                      "postOffice",
                      e.target.value
                    )
                  }
                />
              </SetupField>

              <SetupField
                label="Address:"
                required
              >
                <Input
                  value={
                    form.address
                  }
                  onChange={(e) =>
                    update(
                      "address",
                      e.target.value
                    )
                  }
                />
              </SetupField>

              <SetupField label="Address (bn):">
                <Input
                  value={
                    form.addressBn
                  }
                  onChange={(e) =>
                    update(
                      "addressBn",
                      e.target.value
                    )
                  }
                />
              </SetupField>
            </div>
          </div>

          {/* LOGO NOTE */}
          <div className="mx-auto max-w-[965px] rounded border border-[#f1daa0] bg-[#fff3cd] px-4 py-3 text-xs text-[#8a6500]">
            <span className="font-black">
              ●
            </span>{" "}
            This logo will use for website
            logo and making result as
            watermark. So logo size should
            be minimum 500px in width.
          </div>

          {/* LOGO / FAVICON */}
          <div className="grid max-w-[900px] gap-6 lg:grid-cols-2">
            <div className="grid items-start gap-3 sm:grid-cols-[185px_1fr]">
              <label className="pt-2 text-sm font-bold">
                Logo:
              </label>

              <div>
                <label className="btn btn-info btn-sm min-h-0 cursor-pointer text-white">
                  Select Logo

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      previewFile(
                        e.target
                          .files?.[0],
                        setLogoPreview
                      )
                    }
                  />
                </label>

                <PreviewBox
                  src={logoPreview}
                />
              </div>
            </div>

            <div className="grid items-start gap-3 sm:grid-cols-[185px_1fr]">
              <label className="pt-2 text-sm font-bold">
                Favicon:
              </label>

              <div>
                <label className="btn btn-info btn-sm min-h-0 cursor-pointer text-white">
                  Select Favicon

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      previewFile(
                        e.target
                          .files?.[0],
                        setFaviconPreview
                      )
                    }
                  />
                </label>

                <PreviewBox
                  src={
                    faviconPreview
                  }
                  small
                />
              </div>
            </div>
          </div>

          <div className="max-w-[900px] sm:pl-[405px]">
            <button
              type="button"
              onClick={() =>
                window.alert(
                  "Institution information saved."
                )
              }
              className="btn btn-success btn-sm min-h-0 text-white"
            >
              Submit
            </button>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}