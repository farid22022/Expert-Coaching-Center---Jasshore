import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

const BLUE = "#456db5";

const initialPayrolls = [
  {
    id: 1,
    title: "Vice Chairman",
    basic: 0,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-17 23:14:27",
  },
  {
    id: 2,
    title: "Driver",
    basic: 10500,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-15 14:53:23",
  },
  {
    id: 3,
    title: "Cleaner",
    basic: 7350,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-15 14:52:08",
  },
  {
    id: 4,
    title: "Sister",
    basic: 7350,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-15 14:51:37",
  },
  {
    id: 5,
    title: "Guard",
    basic: 8400,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-15 14:51:01",
  },
  {
    id: 6,
    title: "Peon",
    basic: 8400,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-15 14:50:26",
  },
  {
    id: 7,
    title: "Part Time Assistant Teacher",
    basic: 5250,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-08 10:03:04",
  },
  {
    id: 8,
    title: "Part Time Assistant Teacher",
    basic: 5000,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-08 10:02:35",
  },
  {
    id: 9,
    title: "Assistant Teacher Quran",
    basic: 15750,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-08 09:56:01",
  },
  {
    id: 10,
    title: "Assistant Teacher",
    basic: 12600,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "wahid",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-08 09:54:19",
  },
  {
    id: 11,
    title: "Assistant Teacher",
    basic: 10500,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-08 09:53:38",
  },
  {
    id: 12,
    title: "Assistant Teacher",
    basic: 11500,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "Co-ordinator",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-08 08:56:15",
  },
  {
    id: 13,
    title: "Superintendent",
    basic: 26250,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "Expert Coaching Center",
    createdDate: "2025-02-08 08:53:27",
  },
  {
    id: 14,
    title: "Vice Principal",
    basic: 42000,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "পাঠশালা স্কুল এন্ড কলেজ",
    createdDate: "2025-02-06 17:07:58",
  },
  {
    id: 15,
    title: "Admin Officer",
    basic: 17850,
    medical: 0,
    house: 0,
    convince: 0,
    tax: 0,
    notes: "",
    fullName: "পাঠশালা স্কুল এন্ড কলেজ",
    createdDate: "2025-02-06 17:07:11",
  },
];

function useSiblingNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (slug) => {
    const path = location.pathname.replace(/\/[^/]+\/?$/, `/${slug}`);
    navigate(path);
  };

  return { go };
}

function PageRoot({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-[calc(100vh-70px)] bg-[#f4f5f6] p-2 sm:p-3"
    >
      {children}
    </motion.div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="overflow-hidden rounded-[3px] bg-white shadow-sm">
      <div
        className="flex min-h-[38px] items-center justify-between px-4 py-2"
        style={{ backgroundColor: BLUE }}
      >
        <h2 className="text-[16px] font-bold text-white">{title}</h2>
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
      className="rounded-[3px] bg-[#19a5bc] px-3 py-[6px] text-[11px] text-white shadow-sm transition hover:bg-[#168da1]"
    >
      {children}
    </button>
  );
}

function RequiredNotice() {
  return (
    <div className="rounded-[3px] border border-[#f3dfa1] bg-[#fff3cd] px-5 py-3 text-[12px] font-semibold text-red-500">
      (*) field required
    </div>
  );
}

function FormRow({ label, required, children }) {
  return (
    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[390px_minmax(0,790px)]">
      <label className="text-[12px] font-bold text-black">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}) {
  return (
    <input
      type={type}
      min={min}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-[28px] w-full border border-slate-300 bg-white px-2 text-[11px] text-slate-700 outline-none transition focus:border-sky-500"
    />
  );
}

/* ========================================================================== */
/*                              PAYROLL CREATE                                */
/* ========================================================================== */

export function PayrollCreatePage() {
  const { go } = useSiblingNavigation();

  const [form, setForm] = useState({
    title: "",
    basic: "",
    medical: "",
    house: "",
    convince: "",
    tax: "",
    notes: "",
  });

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const total = useMemo(() => {
    const basic = Number(form.basic) || 0;
    const medical = Number(form.medical) || 0;
    const house = Number(form.house) || 0;
    const convince = Number(form.convince) || 0;
    const tax = Number(form.tax) || 0;

    const medicalAmount = (basic * medical) / 100;
    const houseAmount = (basic * house) / 100;
    const convinceAmount = (basic * convince) / 100;
    const taxAmount = (basic * tax) / 100;

    return (
      basic +
      medicalAmount +
      houseAmount +
      convinceAmount -
      taxAmount
    );
  }, [
    form.basic,
    form.medical,
    form.house,
    form.convince,
    form.tax,
  ]);

  const handleSubmit = () => {
    const required = [
      "title",
      "basic",
      "medical",
      "house",
      "convince",
      "tax",
    ];

    const hasMissing = required.some(
      (field) => String(form[field]).trim() === ""
    );

    if (hasMissing) {
      window.alert("Please complete all required fields.");
      return;
    }

    window.alert("Payroll created successfully.");
  };

  return (
    <PageRoot>
      <Panel
        title="Create Payroll"
        action={
          <HeaderButton onClick={() => go("payroll-list")}>
            Back to Payroll List
          </HeaderButton>
        }
      >
        <div className="p-4 sm:p-5">
          <RequiredNotice />

          <div className="mt-4 space-y-[17px]">
            <FormRow label="Title:" required>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Enter Title"
              />
            </FormRow>

            <FormRow label="Basic:" required>
              <Input
                type="number"
                min="0"
                value={form.basic}
                onChange={(e) => update("basic", e.target.value)}
                placeholder="Enter Basic"
              />
            </FormRow>

            <FormRow label="Medical(%):" required>
              <Input
                type="number"
                min="0"
                value={form.medical}
                onChange={(e) => update("medical", e.target.value)}
                placeholder="Enter Medical"
              />
            </FormRow>

            <FormRow label="House(%):" required>
              <Input
                type="number"
                min="0"
                value={form.house}
                onChange={(e) => update("house", e.target.value)}
                placeholder="Enter House"
              />
            </FormRow>

            <FormRow label="Convince(%):" required>
              <Input
                type="number"
                min="0"
                value={form.convince}
                onChange={(e) => update("convince", e.target.value)}
                placeholder="Enter Convince"
              />
            </FormRow>

            <FormRow label="Tax(%):" required>
              <Input
                type="number"
                min="0"
                value={form.tax}
                onChange={(e) => update("tax", e.target.value)}
                placeholder="Enter Tax"
              />
            </FormRow>

            <div className="border-t border-slate-200 pt-5">
              <div className="grid grid-cols-1 items-center sm:grid-cols-[390px_minmax(0,790px)]">
                <span className="text-[12px] font-bold text-black">
                  Total:
                </span>

                <span className="text-[12px] font-semibold text-slate-700">
                  {total > 0 ? total.toFixed(2) : ""}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <FormRow label="Notes:">
                <Input
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Enter Notes"
                />
              </FormRow>
            </div>

            <div className="sm:ml-[390px]">
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-[3px] bg-[#28a745] px-3 py-[7px] text-[11px] text-white transition hover:bg-[#218838]"
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
/*                               PAYROLL LIST                                 */
/* ========================================================================== */

export function PayrollListPage() {
  const { go } = useSiblingNavigation();
  const [rows, setRows] = useState(initialPayrolls);

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payroll?"
    );

    if (!confirmed) return;

    setRows((current) => current.filter((row) => row.id !== id));
  };

  const handleEdit = (row) => {
    window.alert(`Edit payroll: ${row.title}`);
  };

  const formatPercentage = (value) => `${value} (${value}%)`;

  return (
    <PageRoot>
      <Panel
        title="Payroll List"
        action={
          <HeaderButton onClick={() => go("payroll-create")}>
            Create Payroll
          </HeaderButton>
        }
      >
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] border-collapse text-[11px] text-black">
              <thead>
                <tr className="bg-[#f1f1f1]">
                  {[
                    "Title",
                    "Basic",
                    "Medical",
                    "House",
                    "Convince",
                    "Tax",
                    "Notes",
                    "Full Name",
                    "Created Date",
                    "Action",
                  ].map((header) => (
                    <th
                      key={header}
                      className="border border-slate-300 px-1 py-[7px] text-left font-bold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={
                      index % 2 === 0 ? "bg-white" : "bg-[#eeeeee]"
                    }
                  >
                    <td className="border border-slate-300 px-1 py-[7px]">
                      {row.title}
                    </td>

                    <td className="border border-slate-300 px-1 py-[7px]">
                      {row.basic}
                    </td>

                    <td className="border border-slate-300 px-1 py-[7px]">
                      {formatPercentage(row.medical)}
                    </td>

                    <td className="border border-slate-300 px-1 py-[7px]">
                      {formatPercentage(row.house)}
                    </td>

                    <td className="border border-slate-300 px-1 py-[7px]">
                      {formatPercentage(row.convince)}
                    </td>

                    <td className="border border-slate-300 px-1 py-[7px]">
                      {formatPercentage(row.tax)}
                    </td>

                    <td className="border border-slate-300 px-1 py-[7px]">
                      {row.notes}
                    </td>

                    <td className="border border-slate-300 px-1 py-[7px]">
                      {row.fullName}
                    </td>

                    <td className="border border-slate-300 px-1 py-[7px]">
                      {row.createdDate}
                    </td>

                    <td className="border border-slate-300 px-1 py-1">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => handleEdit(row)}
                          className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#1ca4b9] text-white transition hover:bg-[#168da0]"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDelete(row.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-[3px] bg-[#e63946] text-white transition hover:bg-[#c92f3b]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-[11px] font-bold text-black">
            Showing {rows.length ? 1 : 0} to {rows.length} of {rows.length}{" "}
            results.
          </p>
        </div>
      </Panel>
    </PageRoot>
  );
}
