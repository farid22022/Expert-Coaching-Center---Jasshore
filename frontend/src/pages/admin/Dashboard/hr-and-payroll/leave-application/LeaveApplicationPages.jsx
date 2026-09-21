import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Ban,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";

const BLUE = "#456db5";

const userGroups = [
  "Teacher",
  "Employee",
  "Management",
  "Administrator",
];

const applicants = [
  "Expert Coaching Center",
  "Teacher 01",
  "Teacher 02",
  "Employee 01",
];

const leaveCategories = [
  "Casual leave",
  "Sick Leave",
  "Annual Leave",
  "Emergency Leave",
];

const receivers = [
  "Principal",
  "Vice Principal",
  "Administrator",
  "Expert Coaching Center",
];

const initialLeaveApplications = [
  {
    id: 1,
    applicantName: "Expert Coaching Center",
    extra: "()",
    leaveReason: "Casual leave",
    startDate: "2025-11-01",
    endDate: "2026-10-07",
    status: "Pending",
    receiver: "",
    approvedBy: "",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-05-07 19:54:13",
    userGroup: "Management",
    leaveCategory: "Casual leave",
  },
  {
    id: 2,
    applicantName: "Expert Coaching Center",
    extra: "()",
    leaveReason: "Casual leave",
    startDate: "2025-11-01",
    endDate: "2026-10-07",
    status: "Pending",
    receiver: "",
    approvedBy: "",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-05-07 19:53:45",
    userGroup: "Management",
    leaveCategory: "Casual leave",
  },
  {
    id: 3,
    applicantName: "Expert Coaching Center",
    extra: "()",
    leaveReason: "Casual leave",
    startDate: "2025-11-01",
    endDate: "2026-10-07",
    status: "Pending",
    receiver: "",
    approvedBy: "",
    createdBy: "Expert Coaching Center",
    createdDate: "2026-05-07 19:53:30",
    userGroup: "Management",
    leaveCategory: "Casual leave",
  },
];

function useSiblingNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (slug) => {
    navigate(location.pathname.replace(/\/[^/]+\/?$/, `/${slug}`));
  };

  return { go };
}

function PageRoot({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-[calc(100vh-70px)] bg-[#f4f5f6] p-2 sm:p-3"
    >
      {children}
    </motion.div>
  );
}

function Panel({ title, action, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-[3px] bg-white shadow-sm ${className}`}
    >
      <div
        className="flex min-h-[40px] items-center justify-between px-4 py-2"
        style={{ backgroundColor: BLUE }}
      >
        <h2 className="text-[16px] font-bold text-white sm:text-[18px]">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function HeaderButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[3px] bg-[#1ca4b9] px-3 py-[6px] text-[11px] font-medium text-white shadow-sm transition hover:bg-[#178da0]"
    >
      {children}
    </button>
  );
}

function RequiredNotice() {
  return (
    <div className="rounded-[4px] border border-[#f5dfa1] bg-[#fff3cd] px-5 py-3 text-[12px] font-semibold text-red-500">
      (*) field required
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
  compact = false,
}) {
  return (
    <div
      className={`grid items-center gap-2 ${
        compact
          ? "grid-cols-1 sm:grid-cols-[170px_1fr]"
          : "grid-cols-1 sm:grid-cols-[390px_1fr]"
      }`}
    >
      <label className="text-[12px] font-bold text-black">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}

function SelectBox({
  value,
  onChange,
  children,
  disabled = false,
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="h-[29px] w-full rounded-[3px] border border-slate-300 bg-white px-2 text-[11px] text-slate-700 outline-none transition focus:border-sky-500 disabled:bg-slate-100"
    >
      {children}
    </select>
  );
}

function InputBox({
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-[29px] w-full rounded-[3px] border border-slate-300 bg-white px-2 text-[11px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-500"
    />
  );
}

function SearchButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[3px] bg-[#1ca4b9] px-3 py-[7px] text-[11px] font-medium text-white transition hover:bg-[#168da0]"
    >
      Search
    </button>
  );
}

function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-[3px] bg-[#28a745] px-3 py-[7px] text-[11px] font-medium text-white transition hover:bg-[#218838]"
    >
      Print
    </button>
  );
}

/* ========================================================================== */
/*                       LEAVE APPLICATION CREATE PAGE                        */
/* ========================================================================== */

export function LeaveApplicationCreatePage() {
  const { go } = useSiblingNavigation();

  const [form, setForm] = useState({
    userGroup: "",
    leaveFor: "",
    leaveCategory: "",
    startDate: "",
    endDate: "",
    receiver: "",
  });

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    const required = [
      "userGroup",
      "leaveFor",
      "leaveCategory",
      "startDate",
      "endDate",
      "receiver",
    ];

    const missing = required.some((key) => !form[key]);

    if (missing) {
      window.alert("Please complete all required fields.");
      return;
    }

    window.alert("Leave application submitted successfully.");
  };

  return (
    <PageRoot>
      <Panel
        title="Create Leave Application"
        action={
          <HeaderButton
            onClick={() => go("leave-application-list")}
          >
            Back to Leave application List
          </HeaderButton>
        }
      >
        <div className="p-4 sm:p-5">
          <RequiredNotice />

          <div className="mt-4 space-y-4">
            <Field label="User Group:" required>
              <SelectBox
                value={form.userGroup}
                onChange={(e) =>
                  update("userGroup", e.target.value)
                }
              >
                <option value="">Select User Group</option>
                {userGroups.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectBox>
            </Field>

            <Field label="Leave For:" required>
              <SelectBox
                value={form.leaveFor}
                onChange={(e) =>
                  update("leaveFor", e.target.value)
                }
              >
                <option value="">Select Applicant</option>
                {applicants.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectBox>
            </Field>

            <Field label="Leave Category:" required>
              <SelectBox
                value={form.leaveCategory}
                onChange={(e) =>
                  update("leaveCategory", e.target.value)
                }
              >
                <option value="">
                  Select Leave Category
                </option>

                {leaveCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectBox>
            </Field>

            <Field label="Start Date:" required>
              <InputBox
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  update("startDate", e.target.value)
                }
              />
            </Field>

            <Field label="End Date:" required>
              <InputBox
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  update("endDate", e.target.value)
                }
              />
            </Field>

            <Field label="Receiver:" required>
              <SelectBox
                value={form.receiver}
                onChange={(e) =>
                  update("receiver", e.target.value)
                }
              >
                <option value="">
                  Select Receiver
                </option>

                {receivers.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectBox>
            </Field>

            <div className="sm:ml-[390px]">
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-[3px] bg-[#28a745] px-3 py-[7px] text-[11px] font-medium text-white transition hover:bg-[#218838]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}

/* ========================================================================== */
/*                        LEAVE APPLICATION LIST PAGE                         */
/* ========================================================================== */

export function LeaveApplicationListPage() {
  const { go } = useSiblingNavigation();

  const [rows, setRows] = useState(initialLeaveApplications);

  const [filters, setFilters] = useState({
    session: "2026",
    userGroup: "",
    applicationStatus: "",
    leaveCategory: "",
    fromDate: "",
    toDate: "",
  });

  const [appliedFilters, setAppliedFilters] =
    useState(filters);

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const groupMatch =
        !appliedFilters.userGroup ||
        row.userGroup === appliedFilters.userGroup;

      const statusMatch =
        !appliedFilters.applicationStatus ||
        row.status ===
          appliedFilters.applicationStatus;

      const categoryMatch =
        !appliedFilters.leaveCategory ||
        row.leaveCategory ===
          appliedFilters.leaveCategory;

      const fromMatch =
        !appliedFilters.fromDate ||
        row.startDate >= appliedFilters.fromDate;

      const toMatch =
        !appliedFilters.toDate ||
        row.endDate <= appliedFilters.toDate;

      return (
        groupMatch &&
        statusMatch &&
        categoryMatch &&
        fromMatch &&
        toMatch
      );
    });
  }, [rows, appliedFilters]);

  const handleSearch = () => {
    setAppliedFilters(filters);
  };

  const approveApplication = (id) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              status: "Approved",
              approvedBy: "Expert Coaching Center",
            }
          : row
      )
    );
  };

  const rejectApplication = (id) => {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              status: "Rejected",
            }
          : row
      )
    );
  };

  const editApplication = (row) => {
    window.alert(
      `Edit leave application #${row.id}`
    );
  };

  const deleteApplication = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this leave application?"
    );

    if (!confirmed) return;

    setRows((current) =>
      current.filter((row) => row.id !== id)
    );
  };

  return (
    <PageRoot>
      <Panel
        title="Application Search"
        action={
          <HeaderButton
            onClick={() =>
              go("leave-application-create")
            }
          >
            Create Leave application
          </HeaderButton>
        }
      >
        <div className="px-4 py-5 sm:px-10 lg:px-40">
          <div className="grid gap-x-6 gap-y-4 lg:grid-cols-2">
            <Field label="Session Year:" compact>
              <SelectBox
                value={filters.session}
                onChange={(e) =>
                  updateFilter(
                    "session",
                    e.target.value
                  )
                }
              >
                <option>2026</option>
                <option>2025</option>
                <option>2024</option>
              </SelectBox>
            </Field>

            <Field label="User Group:" compact>
              <SelectBox
                value={filters.userGroup}
                onChange={(e) =>
                  updateFilter(
                    "userGroup",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select User Group
                </option>

                {userGroups.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectBox>
            </Field>

            <Field
              label="Application Status:"
              compact
            >
              <SelectBox
                value={
                  filters.applicationStatus
                }
                onChange={(e) =>
                  updateFilter(
                    "applicationStatus",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Application Status
                </option>
                <option value="Pending">
                  Pending
                </option>
                <option value="Approved">
                  Approved
                </option>
                <option value="Rejected">
                  Rejected
                </option>
              </SelectBox>
            </Field>

            <Field label="Leave Category:" compact>
              <SelectBox
                value={filters.leaveCategory}
                onChange={(e) =>
                  updateFilter(
                    "leaveCategory",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Leave Category
                </option>

                {leaveCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectBox>
            </Field>

            <Field label="From Date:" compact>
              <InputBox
                type="date"
                value={filters.fromDate}
                onChange={(e) =>
                  updateFilter(
                    "fromDate",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="To Date:" compact>
              <InputBox
                type="date"
                value={filters.toDate}
                onChange={(e) =>
                  updateFilter(
                    "toDate",
                    e.target.value
                  )
                }
              />
            </Field>
          </div>

          <div className="mt-4 flex gap-1 sm:ml-[170px]">
            <SearchButton onClick={handleSearch} />
            <PrintButton />
          </div>
        </div>
      </Panel>

      <Panel
        title="Leave Application List"
        className="mt-5"
      >
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse text-[11px] text-black">
              <thead>
                <tr className="bg-[#f1f1f1]">
                  {[
                    "Applicant Name",
                    "Leave Reason",
                    "Date\n(Start-End)",
                    "Status",
                    "Receiver",
                    "Approved By",
                    "Created By",
                    "Created Date",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-pre-line border border-slate-300 px-1 py-2 text-left font-bold"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRows.map(
                  (row, index) => (
                    <tr
                      key={row.id}
                      className={
                        index % 2 === 0
                          ? "bg-[#eeeeee]"
                          : "bg-white"
                      }
                    >
                      <td className="border border-slate-300 px-1 py-2">
                        <div>
                          {row.applicantName}
                        </div>
                        <div>{row.extra}</div>
                      </td>

                      <td className="border border-slate-300 px-1 py-2">
                        {row.leaveReason}
                      </td>

                      <td className="border border-slate-300 px-1 py-2">
                        {row.startDate} to{" "}
                        {row.endDate}
                      </td>

                      <td className="border border-slate-300 px-1 py-2">
                        {row.status}
                      </td>

                      <td className="border border-slate-300 px-1 py-2">
                        {row.receiver}
                      </td>

                      <td className="border border-slate-300 px-1 py-2">
                        {row.approvedBy}
                      </td>

                      <td className="border border-slate-300 px-1 py-2">
                        {row.createdBy}
                      </td>

                      <td className="border border-slate-300 px-1 py-2">
                        {row.createdDate}
                      </td>

                      <td className="border border-slate-300 px-1 py-1">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Approve"
                            onClick={() =>
                              approveApplication(
                                row.id
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#28a745] text-white transition hover:bg-[#218838]"
                          >
                            <Check size={15} />
                          </button>

                          <button
                            type="button"
                            title="Reject"
                            onClick={() =>
                              rejectApplication(
                                row.id
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#65767d] text-white transition hover:bg-[#536168]"
                          >
                            <Ban size={15} />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              editApplication(row)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#1ca4b9] text-white transition hover:bg-[#168da0]"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() =>
                              deleteApplication(
                                row.id
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#e63946] text-white transition hover:bg-[#c92f3b]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}

                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="border border-slate-300 py-8 text-center text-slate-500"
                    >
                      No leave applications
                      found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[11px] font-bold text-black">
            Showing{" "}
            {filteredRows.length
              ? 1
              : 0}{" "}
            to {filteredRows.length} of{" "}
            {filteredRows.length} results.
          </p>
        </div>
      </Panel>
    </PageRoot>
  );
}