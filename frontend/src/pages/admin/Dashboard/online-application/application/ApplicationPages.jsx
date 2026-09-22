import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  defaultAdmissionPrograms,
  getAdmissionPrograms,
  saveAdmissionPrograms,
} from "../../../../../data/admissionPrograms.js";

/* =========================================================
   SHARED DATA
========================================================= */

const sessions = ["2026", "2025", "2024"];

const classes = [
  "Class 09",
  "Class 10",
  "SSC",
  "HSC",
  "Inter 1st year",
  "Inter 2nd year",
];

const shifts = ["Morning", "Day", "Evening"];

const paidToOptions = [
  "School",
  "Bank",
  "Mobile Banking",
  "Online",
];

const paymentMethods = [
  "Cash",
  "bKash",
  "Nagad",
  "Rocket",
  "Bank",
  "Online Gateway",
];

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

function Panel({ title, action, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-md border border-base-300 bg-white shadow-sm ${className}`}
    >
      <div className="flex min-h-[40px] items-center justify-between gap-3 bg-[#456db5] px-4 py-2 text-white sm:px-5">
        <h2 className="text-base font-bold sm:text-lg">{title}</h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`input input-bordered input-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white ${className}`}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`select select-bordered select-sm h-8 min-h-8 w-full rounded-[3px] border-slate-300 bg-white ${className}`}
    >
      {children}
    </select>
  );
}

function Field({ label, children }) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[245px_minmax(0,1fr)]">
      <label className="text-sm font-bold text-black">{label}</label>
      {children}
    </div>
  );
}

function SearchGrid({ children }) {
  return (
    <div className="grid gap-x-7 gap-y-4 lg:grid-cols-2">
      {children}
    </div>
  );
}

function CyanButton({ children, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className="btn btn-info btn-sm min-h-0 text-white"
    >
      {children}
    </motion.button>
  );
}

function HeaderButton({ children, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type="button"
      onClick={onClick}
      className="btn btn-info btn-sm min-h-0 text-white"
    >
      {children}
    </motion.button>
  );
}

function EmptyApplicationTable({
  columns,
  selectedAll,
  setSelectedAll,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-xs min-w-[1200px] border border-base-300">
        <thead className="bg-[#f2f2f2] text-black">
          <tr>
            {columns.map((column, index) => (
              <th
                key={column}
                className="border border-base-300 text-center"
              >
                {index === 0 ? (
                  <label className="flex items-center justify-center gap-1">
                    <input
                      type="checkbox"
                      checked={selectedAll}
                      onChange={(e) =>
                        setSelectedAll(e.target.checked)
                      }
                      className="checkbox checkbox-xs"
                    />

                    <span>{column}</span>
                  </label>
                ) : (
                  column
                )}
              </th>
            ))}
          </tr>
        </thead>
      </table>
    </div>
  );
}

/* =========================================================
   APPLICATION LIST
========================================================= */

export function ApplicationListPage() {
  const [filters, setFilters] = useState({
    session: "2025",
    shift: "",
    className: "",
    studentId: "",
    paidTo: "",
    paymentBy: "",
  });

  const [selectedAll, setSelectedAll] = useState(false);

  const update = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <PageRoot>
      <div className="space-y-0">
        {/* SEARCH */}
        <Panel title="Application Search">
          <div className="px-5 py-5">
            <SearchGrid>
              <Field label="Session Year:">
                <Select
                  value={filters.session}
                  onChange={(e) =>
                    update("session", e.target.value)
                  }
                >
                  {sessions.map((session) => (
                    <option key={session} value={session}>
                      {session}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Shift:">
                <Select
                  value={filters.shift}
                  onChange={(e) =>
                    update("shift", e.target.value)
                  }
                >
                  <option value="">Select Shift</option>

                  {shifts.map((shift) => (
                    <option key={shift}>{shift}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Class:">
                <Select
                  value={filters.className}
                  onChange={(e) =>
                    update("className", e.target.value)
                  }
                >
                  <option value="">Select class</option>

                  {classes.map((className) => (
                    <option key={className}>{className}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Student ID:">
                <Input
                  value={filters.studentId}
                  onChange={(e) =>
                    update("studentId", e.target.value)
                  }
                  placeholder="Student ID"
                />
              </Field>

              <Field label="Paid To:">
                <Select
                  value={filters.paidTo}
                  onChange={(e) =>
                    update("paidTo", e.target.value)
                  }
                >
                  <option value="">Select Paid To</option>

                  {paidToOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Payment By:">
                <Select
                  value={filters.paymentBy}
                  onChange={(e) =>
                    update("paymentBy", e.target.value)
                  }
                >
                  <option value="">Select Payment By</option>

                  {paymentMethods.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>

              <div className="lg:col-start-1">
                <div className="flex flex-wrap gap-1 sm:ml-[258px]">
                  <CyanButton
                    onClick={() =>
                      console.log("Application search:", filters)
                    }
                  >
                    Search List
                  </CyanButton>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn btn-success btn-sm min-h-0 text-white"
                  >
                    Print
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm min-h-0 border-violet-700 bg-violet-700 text-white hover:bg-violet-800"
                  >
                    PDF
                  </button>
                </div>
              </div>
            </SearchGrid>

            <div className="min-h-[15px]" />
          </div>
        </Panel>

        {/* LIST */}
        <Panel
          title="Online Applicaton List"
          action={
            <HeaderButton
              onClick={() =>
                alert("Create Online Admission")
              }
            >
              Create Online Admission
            </HeaderButton>
          }
        >
          <div className="p-5">
            <EmptyApplicationTable
              selectedAll={selectedAll}
              setSelectedAll={setSelectedAll}
              columns={[
                "SL",
                "Photo",
                "Student Name",
                "Student ID",
                "Gender",
                "Class",
                "Session",
                "Contact",
                "Paid To",
                "Paid By",
                "Created Date",
                "Action",
              ]}
            />

            <p className="mt-5 text-sm font-bold">
              Showing 0 to 0 of 0 results.
            </p>
          </div>

          <div className="border-t border-base-300 bg-[#fafafa] px-5 py-3">
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                className="btn btn-success btn-sm text-white"
              >
                Transfer Selected Items
              </button>

              <button
                type="button"
                className="btn btn-error btn-sm text-white"
              >
                Delete Selected Items
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   PENDING LIST
========================================================= */

export function PendingListPage() {
  const [filters, setFilters] = useState({
    session: "2025",
    shift: "",
    className: "",
    studentId: "",
    paymentBy: "",
  });

  const [selectedAll, setSelectedAll] = useState(false);

  const update = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <PageRoot>
      <div className="space-y-0">
        {/* SEARCH */}
        <Panel title="Application Search">
          <div className="px-5 py-5">
            <SearchGrid>
              <Field label="Session Year:">
                <Select
                  value={filters.session}
                  onChange={(e) =>
                    update("session", e.target.value)
                  }
                >
                  {sessions.map((session) => (
                    <option key={session}>{session}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Shift:">
                <Select
                  value={filters.shift}
                  onChange={(e) =>
                    update("shift", e.target.value)
                  }
                >
                  <option value="">Select Shift</option>

                  {shifts.map((shift) => (
                    <option key={shift}>{shift}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Class:">
                <Select
                  value={filters.className}
                  onChange={(e) =>
                    update("className", e.target.value)
                  }
                >
                  <option value="">Select class</option>

                  {classes.map((className) => (
                    <option key={className}>{className}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Student ID:">
                <Input
                  value={filters.studentId}
                  onChange={(e) =>
                    update("studentId", e.target.value)
                  }
                  placeholder="Student ID"
                />
              </Field>

              <Field label="Payment By:">
                <Select
                  value={filters.paymentBy}
                  onChange={(e) =>
                    update("paymentBy", e.target.value)
                  }
                >
                  <option value="">Select Payment By</option>

                  {paymentMethods.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>

              <div />

              <div className="lg:col-start-1">
                <div className="sm:ml-[258px]">
                  <CyanButton
                    onClick={() =>
                      console.log("Pending search:", filters)
                    }
                  >
                    Search List
                  </CyanButton>
                </div>
              </div>
            </SearchGrid>

            <div className="min-h-[15px]" />
          </div>
        </Panel>

        {/* PENDING */}
        <Panel
          title="Applicaton Pending List"
          action={
            <HeaderButton
              onClick={() =>
                alert("Create Online Admission")
              }
            >
              Create Online Admission
            </HeaderButton>
          }
        >
          <div className="p-5">
            <EmptyApplicationTable
              selectedAll={selectedAll}
              setSelectedAll={setSelectedAll}
              columns={[
                "SL",
                "Photo",
                "Student Name",
                "Student ID",
                "Class",
                "Session",
                "Payment Number",
                "Sender Number",
                "Payment Method",
                "Transaction ID",
                "Amount",
                "Created Date",
                "Action",
              ]}
            />

            <p className="mt-5 text-sm font-bold">
              Showing 1 to 1 of 1 results.
            </p>
          </div>

          <div className="border-t border-base-300 bg-[#fafafa] px-5 py-3">
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                className="btn btn-success btn-sm text-white"
              >
                Approve Selected Items
              </button>

              <button
                type="button"
                className="btn btn-error btn-sm text-white"
              >
                Delete Selected Items
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   FORM SETTING HELPERS
========================================================= */

const initialFormSettings = {
  onlineAdmissionForm: true,

  fullName: true,
  bloodGroup: false,
  studentUid: false,
  contactNumber: true,
  studentEmail: false,

  dateOfBirth: false,
  birthPlace: false,
  birthCertificate: false,
  religion: false,
  gender: false,
  country: false,
  tribal: false,

  fatherName: false,
  fatherMobile: false,
  fatherNid: false,
  fatherDob: false,
  fatherProfession: false,
  guardianName: false,
  guardianContact: false,

  motherName: false,
  motherMobile: false,
  motherNid: false,
  motherDob: false,
  motherProfession: false,
  guardianRelation: false,

  livingDivision: false,
  livingDistrict: false,
  livingUpazila: false,
  livingMunicipality: false,
  livingWard: false,
  livingPostOffice: false,
  livingPostalCode: false,
  livingAddress: false,

  permanentDivision: false,
  permanentDistrict: false,
  permanentUpazila: false,
  permanentMunicipality: false,
  permanentWard: false,
  permanentPostOffice: false,
  permanentPostalCode: false,
  permanentAddress: false,

  category: false,
  sessionYear: false,
  shift: false,
  className: true,
  section: false,
  group: false,
  version: false,
  registerNo: false,
  admissionDate: false,

  studentId: false,
  studentImage: false,

  previousSchoolName: true,
  previousClass: true,
  previousRoll: true,
};

function CheckItem({
  label,
  name,
  checked,
  onChange,
  required = false,
}) {
  return (
    <label className="grid grid-cols-[1fr_22px] items-center gap-3 py-2 text-sm font-semibold">
      <span>
        {label}

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(
            name,
            e.target.checked
          )
        }
        className="checkbox checkbox-primary checkbox-xs"
      />
    </label>
  );
}

function SettingsBox({ title, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded border border-base-300 bg-white ${className}`}
    >
      <div className="border-b border-base-300 bg-[#f5f5f5] px-4 py-2 text-sm font-bold">
        {title}
      </div>

      <div className="p-4">
        {children}
      </div>
    </section>
  );
}

function AdmissionProgramManager() {
  const emptyProgram = {
    id: "",
    title: "",
    className: "",
    image: "/slide1.jpeg",
    startDate: "",
    endDate: "",
    admissionFee: "",
    seats: "",
    teachers: "",
    subjects: "",
    schedule: "",
    eligibility: "",
    description: "",
    formFields: ["Student Name", "Guardian Phone", "School Name", "Preferred Shift"],
  };

  const [programs, setPrograms] = useState(() => getAdmissionPrograms());
  const [editingId, setEditingId] = useState(programs[0]?.id || "");
  const selectedProgram = programs.find((program) => program.id === editingId) || emptyProgram;
  const [form, setForm] = useState(selectedProgram);

  const selectProgram = (id) => {
    const next = programs.find((program) => program.id === id);
    setEditingId(id);
    setForm(next || emptyProgram);
  };

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const saveProgram = () => {
    const id = form.id || form.title.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
    const nextProgram = {
      ...form,
      id,
      formFields: String(form.formFields || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const exists = programs.some((program) => program.id === id);
    const nextPrograms = exists
      ? programs.map((program) => (program.id === id ? nextProgram : program))
      : [nextProgram, ...programs];

    setPrograms(nextPrograms);
    saveAdmissionPrograms(nextPrograms);
    setEditingId(id);
    setForm(nextProgram);
    alert("Admission card saved.");
  };

  const createNew = () => {
    setEditingId("");
    setForm(emptyProgram);
  };

  const resetDefaults = () => {
    setPrograms(defaultAdmissionPrograms);
    saveAdmissionPrograms(defaultAdmissionPrograms);
    setEditingId(defaultAdmissionPrograms[0]?.id || "");
    setForm(defaultAdmissionPrograms[0] || emptyProgram);
  };

  const removeProgram = () => {
    if (!editingId || !confirm("Delete this admission card?")) return;
    const nextPrograms = programs.filter((program) => program.id !== editingId);
    setPrograms(nextPrograms);
    saveAdmissionPrograms(nextPrograms);
    setEditingId(nextPrograms[0]?.id || "");
    setForm(nextPrograms[0] || emptyProgram);
  };

  return (
    <SettingsBox title="Admission Cards">
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-info btn-sm text-white" onClick={createNew}>
              New Card
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={resetDefaults}>
              Reset Defaults
            </button>
          </div>

          <div className="grid gap-2">
            {programs.map((program) => (
              <button
                type="button"
                key={program.id}
                onClick={() => selectProgram(program.id)}
                className={[
                  "rounded border px-3 py-2 text-left text-sm font-bold",
                  editingId === program.id
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-700",
                ].join(" ")}
              >
                <span className="block">{program.title}</span>
                <small className="text-slate-500">{program.className} • ৳ {program.admissionFee}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Card Title:">
              <Input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Class 9 Foundation Admission" />
            </Field>
            <Field label="Class/Program:">
              <Input value={form.className} onChange={(event) => update("className", event.target.value)} placeholder="Class 9 / SSC / HSC" />
            </Field>
            <Field label="Image:">
              <Select value={form.image} onChange={(event) => update("image", event.target.value)}>
                <option value="/slide1.jpeg">slide1.jpeg</option>
                <option value="/slide2.jpeg">slide2.jpeg</option>
                <option value="/slide3.jpeg">slide3.jpeg</option>
                <option value="/jasshoreExpert.png">Logo</option>
              </Select>
            </Field>
            <Field label="Admission Fee:">
              <Input value={form.admissionFee} onChange={(event) => update("admissionFee", event.target.value)} placeholder="1500" />
            </Field>
            <Field label="Start Date:">
              <Input type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} />
            </Field>
            <Field label="End Date:">
              <Input type="date" value={form.endDate} onChange={(event) => update("endDate", event.target.value)} />
            </Field>
            <Field label="Seats:">
              <Input value={form.seats} onChange={(event) => update("seats", event.target.value)} placeholder="60" />
            </Field>
            <Field label="Teachers:">
              <Input value={form.teachers} onChange={(event) => update("teachers", event.target.value)} placeholder="Teacher names" />
            </Field>
            <Field label="Subjects:">
              <Input value={form.subjects} onChange={(event) => update("subjects", event.target.value)} placeholder="Bangla, English, Math" />
            </Field>
            <Field label="Schedule:">
              <Input value={form.schedule} onChange={(event) => update("schedule", event.target.value)} placeholder="Morning and Day batches" />
            </Field>
            <Field label="Eligibility:">
              <Input value={form.eligibility} onChange={(event) => update("eligibility", event.target.value)} placeholder="Who can apply" />
            </Field>
            <Field label="Form Fields:">
              <Input value={Array.isArray(form.formFields) ? form.formFields.join(", ") : form.formFields} onChange={(event) => update("formFields", event.target.value)} placeholder="Student Name, Guardian Phone" />
            </Field>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-black">Description:</label>
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className="textarea textarea-bordered min-h-24 w-full bg-white"
              placeholder="Short public card description"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {editingId && (
              <button type="button" className="btn btn-error btn-sm text-white" onClick={removeProgram}>
                Delete
              </button>
            )}
            <button type="button" className="btn btn-success btn-sm text-white" onClick={saveProgram}>
              Save Admission Card
            </button>
          </div>
        </div>
      </div>
    </SettingsBox>
  );
}

/* =========================================================
   FORM SETTING
========================================================= */

export function FormSettingPage() {
  const [settings, setSettings] =
    useState(initialFormSettings);

  const [payment, setPayment] = useState({
    notice:
      "নির্দিষ্ট প্রয়োজনীয় তথ্য পূরণ করে অনলাইন ফরমটি সাবমিট করুন।",
    formFee: "0",
    serviceCharge: "0",
    bkash: "01776767992",
    rocket: "01776767992",
    nagad: "01776767992",
  });

  const [examDates, setExamDates] = useState({
    SSC: "",
    HSC: "",
    "Inter 2nd year": "",
    "Inter 1st year": "",
  });

  const updateSetting = (name, value) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updatePayment = (key, value) => {
    setPayment((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const examRows = useMemo(
    () => [
      "SSC",
      "HSC",
      "Inter 2nd year",
      "Inter 1st year",
    ],
    []
  );

  return (
    <PageRoot>
      <Panel
        title="Form Setting"
        action={
          <HeaderButton
            onClick={() =>
              alert("Create Online Admission")
            }
          >
            Create Online Admission
          </HeaderButton>
        }
      >
        <div className="space-y-4 p-4">
          <AdmissionProgramManager />

          {/* ADMISSION FORM */}
          <SettingsBox title="Admission Form">
            <CheckItem
              label="Online Admission Form"
              name="onlineAdmissionForm"
              checked={settings.onlineAdmissionForm}
              onChange={updateSetting}
            />
          </SettingsBox>

          {/* STUDENT INFORMATION */}
          <SettingsBox title="Student Information">
            <div className="grid gap-x-12 lg:grid-cols-2">
              <div>
                <CheckItem
                  label="Full Name (bn):"
                  name="fullName"
                  checked={settings.fullName}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Blood Group:"
                  name="bloodGroup"
                  checked={settings.bloodGroup}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Student UID:"
                  name="studentUid"
                  checked={settings.studentUid}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Contact Number:"
                  name="contactNumber"
                  checked={settings.contactNumber}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Student's Email ID:"
                  name="studentEmail"
                  checked={settings.studentEmail}
                  onChange={updateSetting}
                />
              </div>

              <div>
                <CheckItem
                  label="Date of Birth:"
                  name="dateOfBirth"
                  checked={settings.dateOfBirth}
                  onChange={updateSetting}
                  required
                />

                <CheckItem
                  label="Birth Place:"
                  name="birthPlace"
                  checked={settings.birthPlace}
                  onChange={updateSetting}
                  required
                />

                <CheckItem
                  label="Birth Certificate No.:"
                  name="birthCertificate"
                  checked={settings.birthCertificate}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Religion:"
                  name="religion"
                  checked={settings.religion}
                  onChange={updateSetting}
                  required
                />

                <CheckItem
                  label="Gender:"
                  name="gender"
                  checked={settings.gender}
                  onChange={updateSetting}
                  required
                />

                <CheckItem
                  label="Country:"
                  name="country"
                  checked={settings.country}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Is Tribal ?"
                  name="tribal"
                  checked={settings.tribal}
                  onChange={updateSetting}
                />
              </div>
            </div>
          </SettingsBox>

          {/* PARENT INFORMATION */}
          <SettingsBox title="Parent Information">
            <div className="grid gap-x-12 lg:grid-cols-2">
              <div>
                <CheckItem
                  label="Father Name (bn):"
                  name="fatherName"
                  checked={settings.fatherName}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Father's Mobile Number:"
                  name="fatherMobile"
                  checked={settings.fatherMobile}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Father's NID:"
                  name="fatherNid"
                  checked={settings.fatherNid}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Father's DOB:"
                  name="fatherDob"
                  checked={settings.fatherDob}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Father Profession:"
                  name="fatherProfession"
                  checked={settings.fatherProfession}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Guardian Name:"
                  name="guardianName"
                  checked={settings.guardianName}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Guardian Contact Number:"
                  name="guardianContact"
                  checked={settings.guardianContact}
                  onChange={updateSetting}
                />
              </div>

              <div>
                <CheckItem
                  label="Mother Name(bn):"
                  name="motherName"
                  checked={settings.motherName}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Mother's Mobile Number:"
                  name="motherMobile"
                  checked={settings.motherMobile}
                  onChange={updateSetting}
                  required
                />

                <CheckItem
                  label="Mother's NID:"
                  name="motherNid"
                  checked={settings.motherNid}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Mother's DOB:"
                  name="motherDob"
                  checked={settings.motherDob}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Mother Profession:"
                  name="motherProfession"
                  checked={settings.motherProfession}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Guardian Relation:"
                  name="guardianRelation"
                  checked={settings.guardianRelation}
                  onChange={updateSetting}
                />
              </div>
            </div>
          </SettingsBox>

          {/* ADDRESS */}
          <div className="grid gap-4 lg:grid-cols-2">
            <SettingsBox title="Living Address">
              <CheckItem
                label="Division:"
                name="livingDivision"
                checked={settings.livingDivision}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="District:"
                name="livingDistrict"
                checked={settings.livingDistrict}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Upazila:"
                name="livingUpazila"
                checked={settings.livingUpazila}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Municipality/ Union:"
                name="livingMunicipality"
                checked={settings.livingMunicipality}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Ward No.:"
                name="livingWard"
                checked={settings.livingWard}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Post Office:"
                name="livingPostOffice"
                checked={settings.livingPostOffice}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Postal Code:"
                name="livingPostalCode"
                checked={settings.livingPostalCode}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Address:"
                name="livingAddress"
                checked={settings.livingAddress}
                onChange={updateSetting}
                required
              />
            </SettingsBox>

            <SettingsBox title="Permanent Address">
              <CheckItem
                label="Division:"
                name="permanentDivision"
                checked={settings.permanentDivision}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="District:"
                name="permanentDistrict"
                checked={settings.permanentDistrict}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Upazila:"
                name="permanentUpazila"
                checked={settings.permanentUpazila}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Municipality/ Union:"
                name="permanentMunicipality"
                checked={settings.permanentMunicipality}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Ward No.:"
                name="permanentWard"
                checked={settings.permanentWard}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Post Office:"
                name="permanentPostOffice"
                checked={settings.permanentPostOffice}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Postal Code:"
                name="permanentPostalCode"
                checked={settings.permanentPostalCode}
                onChange={updateSetting}
                required
              />

              <CheckItem
                label="Address:"
                name="permanentAddress"
                checked={settings.permanentAddress}
                onChange={updateSetting}
                required
              />
            </SettingsBox>
          </div>

          {/* CLASS INFORMATION */}
          <SettingsBox title="Class Information">
            <div className="grid gap-x-12 lg:grid-cols-2">
              <div>
                <CheckItem
                  label="Category:"
                  name="category"
                  checked={settings.category}
                  onChange={updateSetting}
                  required
                />

                <CheckItem
                  label="Session Year:"
                  name="sessionYear"
                  checked={settings.sessionYear}
                  onChange={updateSetting}
                  required
                />

                <CheckItem
                  label="Shift:"
                  name="shift"
                  checked={settings.shift}
                  onChange={updateSetting}
                  required
                />

                <CheckItem
                  label="Class:"
                  name="className"
                  checked={settings.className}
                  onChange={updateSetting}
                  required
                />

                <CheckItem
                  label="Section:"
                  name="section"
                  checked={settings.section}
                  onChange={updateSetting}
                  required
                />

                <CheckItem
                  label="Group:"
                  name="group"
                  checked={settings.group}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Version:"
                  name="version"
                  checked={settings.version}
                  onChange={updateSetting}
                  required
                />

                <CheckItem
                  label="Register No.:"
                  name="registerNo"
                  checked={settings.registerNo}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Admission Date:"
                  name="admissionDate"
                  checked={settings.admissionDate}
                  onChange={updateSetting}
                />
              </div>

              <div className="space-y-2">
                <CheckItem
                  label="Student ID:"
                  name="studentId"
                  checked={settings.studentId}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Student Image:"
                  name="studentImage"
                  checked={settings.studentImage}
                  onChange={updateSetting}
                />

                <div className="grid items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <label className="text-sm font-semibold">
                    Default Session Year:
                    <span className="text-red-500">*</span>
                  </label>

                  <Select defaultValue="2025">
                    <option>2025</option>
                    <option>2026</option>
                  </Select>
                </div>

                <div className="grid items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <label className="text-sm font-semibold">
                    Disable Class:
                  </label>

                  <Select defaultValue="Inter 2nd year, Inter 1st year, demo">
                    <option>
                      Inter 2nd year, Inter 1st year, demo
                    </option>
                  </Select>
                </div>
              </div>
            </div>
          </SettingsBox>

          {/* PREVIOUS SCHOOL */}
          <SettingsBox title="Previous School Information">
            <div className="grid gap-x-12 lg:grid-cols-2">
              <div>
                <CheckItem
                  label="School Name:"
                  name="previousSchoolName"
                  checked={settings.previousSchoolName}
                  onChange={updateSetting}
                />

                <CheckItem
                  label="Class:"
                  name="previousClass"
                  checked={settings.previousClass}
                  onChange={updateSetting}
                />
              </div>

              <div>
                <CheckItem
                  label="Roll:"
                  name="previousRoll"
                  checked={settings.previousRoll}
                  onChange={updateSetting}
                />
              </div>
            </div>
          </SettingsBox>

          {/* ADMISSION PAYMENT */}
          <SettingsBox title="Admission Payment">
            <div className="grid gap-x-10 gap-y-3 lg:grid-cols-2">
              <div className="space-y-3">
                <div className="grid items-start gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <label className="text-sm font-semibold">
                    Notice:
                  </label>

                  <textarea
                    value={payment.notice}
                    onChange={(e) =>
                      updatePayment("notice", e.target.value)
                    }
                    className="textarea textarea-bordered min-h-[62px] w-full"
                  />
                </div>

                <div className="grid items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <label className="text-sm font-semibold">
                    Bkash Number:
                  </label>

                  <Input
                    value={payment.bkash}
                    onChange={(e) =>
                      updatePayment("bkash", e.target.value)
                    }
                  />
                </div>

                <div className="grid items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <label className="text-sm font-semibold">
                    Nagad Number:
                  </label>

                  <Input
                    value={payment.nagad}
                    onChange={(e) =>
                      updatePayment("nagad", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <label className="text-sm font-semibold">
                    Form Fee:
                  </label>

                  <Input
                    type="number"
                    value={payment.formFee}
                    onChange={(e) =>
                      updatePayment("formFee", e.target.value)
                    }
                  />
                </div>

                <div className="grid items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <label className="text-sm font-semibold">
                    Service Charge (Mobile Pay):
                  </label>

                  <Input
                    type="number"
                    value={payment.serviceCharge}
                    onChange={(e) =>
                      updatePayment(
                        "serviceCharge",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="grid items-center gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                  <label className="text-sm font-semibold">
                    Rocket Number:
                  </label>

                  <Input
                    value={payment.rocket}
                    onChange={(e) =>
                      updatePayment("rocket", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </SettingsBox>

          {/* EXAM DATE */}
          <SettingsBox title="Admission Exam Date">
            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[700px] border border-base-300">
                <thead className="bg-[#f5f5f5] text-black">
                  <tr>
                    <th className="border border-base-300">#</th>
                    <th className="border border-base-300">Class</th>
                    <th className="border border-base-300">Exam Date</th>
                  </tr>
                </thead>

                <tbody>
                  {examRows.map((className, index) => (
                    <tr key={className}>
                      <td className="border border-base-300">
                        {index + 1}
                      </td>

                      <td className="border border-base-300">
                        {className}
                      </td>

                      <td className="border border-base-300">
                        <Input
                          type="date"
                          value={examDates[className]}
                          onChange={(e) =>
                            setExamDates((prev) => ({
                              ...prev,
                              [className]: e.target.value,
                            }))
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SettingsBox>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                alert("Form settings saved.")
              }
              className="btn btn-success btn-sm text-white"
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
   ALIASES REQUIRED BY YOUR ROUTER
========================================================= */

export const PendingApplicationPage = PendingListPage;
export const ApplicationFormSettingPage = FormSettingPage;
