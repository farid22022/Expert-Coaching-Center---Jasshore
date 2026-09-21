import { useState } from "react";
import { motion } from "framer-motion";
import {
  Pencil,
  Trash2,
  X,
} from "lucide-react";

/* =========================================================
   STORAGE
========================================================= */

const SETTINGS_KEY = "mail_sms_settings";
const TEMPLATE_KEY = "mail_sms_templates";

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random()}`
  );
}

const admissionStudentMessage =
  "Full Name:[[full_name]] ([[class]]-[[section]], [[roll]]) Admission Date:[[date]]. You are admitted into the class [[class]]. sms by Expert Team. Visit www.expertjashore.com, or find us on Facebook at fb.me/expertjashore.";

const teacherJoinMessage =
  "Company name: [[company_name]], Full Name:[[full_name]], Teacher Id:[[teacher_id]], Designation:[[teacher_designation]], Joining Date:[[joining_date]], Sms Time:[[sms_time]], Payroll Name:[[payroll_name]], Payroll Amount:[[payroll_total]]";

const defaultSettings = {
  onlineStudentAdmission: {
    manual: true,
    auto: false,
    message: admissionStudentMessage,
  },

  softwareStudentAdmission: {
    manual: true,
    auto: true,
    message: admissionStudentMessage,
  },

  onlineTeacherJoin: {
    manual: true,
    auto: false,
    message: teacherJoinMessage,
  },

  softwareTeacherJoin: {
    manual: true,
    auto: false,
    message: teacherJoinMessage,
  },

  softwareTeacherEmployeeJoin: {
    manual: true,
    auto: false,
    message: teacherJoinMessage,
  },
};

const defaultTemplates = [
  {
    id: "application-approved",
    title: "Application Approved SMS",
    template:
      "Thank you for your application, your application form is approved. Please submit this form in our office and collect student's admit card. sms BY Expert Team.",
    createdBy: "Expert Coaching Center",
    createdAt: "2024-11-10 20:31:21",
  },
];

function loadSettings() {
  try {
    const value =
      localStorage.getItem(
        SETTINGS_KEY
      );

    if (!value) {
      return defaultSettings;
    }

    return {
      ...defaultSettings,
      ...JSON.parse(value),
    };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(settings) {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings)
  );
}

function loadTemplates() {
  try {
    const value =
      localStorage.getItem(
        TEMPLATE_KEY
      );

    if (!value) {
      localStorage.setItem(
        TEMPLATE_KEY,
        JSON.stringify(
          defaultTemplates
        )
      );

      return defaultTemplates;
    }

    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : defaultTemplates;
  } catch {
    return defaultTemplates;
  }
}

function saveTemplates(rows) {
  localStorage.setItem(
    TEMPLATE_KEY,
    JSON.stringify(rows)
  );
}

/* =========================================================
   SHARED
========================================================= */

function PageRoot({ children }) {
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
        duration: 0.18,
      }}
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

function Toggle({
  checked,
  onChange,
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) =>
        onChange(e.target.checked)
      }
      className="toggle toggle-primary toggle-sm"
    />
  );
}

function SettingRow({
  label,
  value,
  onChange,
  keywordText,
}) {
  return (
    <div className="grid border-t border-base-300 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div className="px-5 py-5">
        <div className="text-sm font-bold text-black">
          {label}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="grid gap-0 md:grid-cols-[115px_minmax(0,1fr)]">
          {/* TOGGLES */}
          <div className="rounded-l border border-base-300 bg-[#f1f3f5] px-3 py-2">
            <label className="flex items-center gap-2">
              <Toggle
                checked={
                  value.manual
                }
                onChange={(checked) =>
                  onChange({
                    ...value,
                    manual: checked,
                  })
                }
              />

              <span className="text-sm">
                Manual
              </span>
            </label>

            <label className="mt-2 flex items-center gap-2">
              <Toggle
                checked={
                  value.auto
                }
                onChange={(checked) =>
                  onChange({
                    ...value,
                    auto: checked,
                  })
                }
              />

              <span className="text-sm">
                Auto
              </span>
            </label>
          </div>

          {/* MESSAGE */}
          <textarea
            value={value.message}
            onChange={(e) =>
              onChange({
                ...value,
                message:
                  e.target.value,
              })
            }
            className="textarea textarea-bordered min-h-[62px] w-full rounded-l-none text-sm leading-6"
          />
        </div>

        <p className="mt-1 text-[11px] leading-4 text-cyan-600">
          {keywordText}
        </p>
      </div>
    </div>
  );
}

function smsInfo(message) {
  const length =
    message?.length || 0;

  const hasUnicode =
    /[^\x00-\x7F]/.test(
      message || ""
    );

  const single =
    hasUnicode ? 70 : 160;

  const multi =
    hasUnicode ? 67 : 153;

  let count = 0;
  let remaining = 0;

  if (length) {
    count =
      length <= single
        ? 1
        : Math.ceil(
            length / multi
          );

    const capacity =
      count === 1
        ? single
        : count * multi;

    remaining =
      Math.max(
        0,
        capacity - length
      );
  }

  return {
    encoding: hasUnicode
      ? "Unicode"
      : "GSM",
    length,
    count,
    remaining,
  };
}

/* =========================================================
   SMS / MAIL SETUP
========================================================= */

export function SmsMailSetupPage() {
  const [settings, setSettings] =
    useState(() =>
      loadSettings()
    );

  const [saved, setSaved] =
    useState(false);

  const updateSetting = (
    key,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
  };

  const studentKeywords =
    "[[company_name]], [[full_name]], [[session]], [[shift]], [[class]], [[section]], [[roll]], [[admission_date]], [[sms_time]] Keywords refer by Company Name, Student Name, Session, Shift, Class, Section, Roll, Admission Date & Sms time respectively.";

  const teacherKeywords =
    "[[company_name]], [[full_name]], [[teacher_id]], [[teacher_designation]], [[joining_date]], [[sms_time]], [[payroll_name]], [[payroll_total]] Keywords refer by Company Name, Teacher Name, Id, Designation, Joining Date, Sms Time, Payroll Name & Payroll Total respectively.";

  return (
    <PageRoot>
      <Panel title="Sms Settings Create">
        <div className="space-y-4 p-4">
          {saved && (
            <div className="alert alert-success py-2 text-sm text-white">
              SMS/Mail settings saved
              successfully.
            </div>
          )}

          {/* STUDENT ADMISSION */}
          <section className="overflow-hidden rounded border border-base-300">
            <div className="bg-[#f5f5f5] px-5 py-3 text-sm font-bold text-black">
              Admission SMS
            </div>

            <SettingRow
              label="Online Student Admission"
              value={
                settings.onlineStudentAdmission
              }
              onChange={(value) =>
                updateSetting(
                  "onlineStudentAdmission",
                  value
                )
              }
              keywordText={
                studentKeywords
              }
            />

            <SettingRow
              label="Software Student Admission"
              value={
                settings.softwareStudentAdmission
              }
              onChange={(value) =>
                updateSetting(
                  "softwareStudentAdmission",
                  value
                )
              }
              keywordText={
                studentKeywords
              }
            />
          </section>

          {/* TEACHER JOIN */}
          <section className="overflow-hidden rounded border border-base-300">
            <div className="bg-[#f5f5f5] px-5 py-3 text-sm font-bold text-black">
              Admission SMS
            </div>

            <SettingRow
              label="Online Teacher Join"
              value={
                settings.onlineTeacherJoin
              }
              onChange={(value) =>
                updateSetting(
                  "onlineTeacherJoin",
                  value
                )
              }
              keywordText={
                teacherKeywords
              }
            />

            <SettingRow
              label="Software Teacher Join"
              value={
                settings.softwareTeacherJoin
              }
              onChange={(value) =>
                updateSetting(
                  "softwareTeacherJoin",
                  value
                )
              }
              keywordText={
                teacherKeywords
              }
            />

            <SettingRow
              label="Software Teacher/Employee Join"
              value={
                settings.softwareTeacherEmployeeJoin
              }
              onChange={(value) =>
                updateSetting(
                  "softwareTeacherEmployeeJoin",
                  value
                )
              }
              keywordText={
                teacherKeywords
              }
            />
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-success btn-sm text-white"
            >
              Save Settings
            </button>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   TEMPLATE MODAL
========================================================= */

function TemplateModal({
  open,
  initial,
  onClose,
  onSave,
}) {
  const [title, setTitle] =
    useState(
      initial?.title || ""
    );

  const [template, setTemplate] =
    useState(
      initial?.template || ""
    );

  if (!open) return null;

  const info =
    smsInfo(template);

  const submit = () => {
    if (!title.trim()) {
      window.alert(
        "Template title is required."
      );
      return;
    }

    if (!template.trim()) {
      window.alert(
        "SMS template is required."
      );
      return;
    }

    onSave({
      id:
        initial?.id ||
        createId(),

      title:
        title.trim(),

      template:
        template.trim(),

      createdBy:
        initial?.createdBy ||
        "Expert Coaching Center",

      createdAt:
        initial?.createdAt ||
        new Date()
          .toISOString()
          .replace("T", " ")
          .slice(0, 19),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
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
        <div className="flex items-center justify-between bg-[#456db5] px-5 py-3 text-white">
          <h3 className="font-bold">
            {initial
              ? "Update Message Template"
              : "Create Message Template"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-xs text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-bold">
              Title:
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Enter Template Title"
              className="input input-bordered input-sm w-full"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold">
              SMS Template:
            </label>

            <textarea
              value={template}
              onChange={(e) =>
                setTemplate(
                  e.target.value
                )
              }
              placeholder="Enter SMS Template"
              className="textarea textarea-bordered min-h-32 w-full"
            />
          </div>

          <div className="rounded bg-base-200 p-3 text-xs leading-5">
            <div>
              Encoding:{" "}
              <strong>
                {info.encoding}
              </strong>
            </div>

            <div>
              Total Char.:{" "}
              <strong>
                {info.length}
              </strong>
            </div>

            <div>
              SMS Count:{" "}
              <strong>
                {info.count}
              </strong>
            </div>

            <div>
              Remaining Char.:{" "}
              <strong>
                {info.remaining}
              </strong>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submit}
              className="btn btn-success btn-sm text-white"
            >
              {initial
                ? "Update"
                : "Submit"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================
   SMS / MAIL TEMPLATE
========================================================= */

export function SmsMailTemplatePage() {
  const [templates, setTemplates] =
    useState(() =>
      loadTemplates()
    );

  const [modalOpen, setModalOpen] =
    useState(false);

  const [
    editingTemplate,
    setEditingTemplate,
  ] = useState(null);

  const openCreate = () => {
    setEditingTemplate(null);
    setModalOpen(true);
  };

  const openEdit = (
    template
  ) => {
    setEditingTemplate(
      template
    );

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingTemplate(null);
  };

  const handleSave = (
    template
  ) => {
    let updated;

    if (editingTemplate) {
      updated =
        templates.map(
          (item) =>
            item.id ===
            editingTemplate.id
              ? template
              : item
        );
    } else {
      updated = [
        ...templates,
        template,
      ];
    }

    setTemplates(updated);
    saveTemplates(updated);
    closeModal();
  };

  const handleDelete = (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this message template?"
      );

    if (!confirmed) return;

    const updated =
      templates.filter(
        (item) =>
          item.id !== id
      );

    setTemplates(updated);
    saveTemplates(updated);
  };

  return (
    <PageRoot>
      <Panel
        title="SMS/Mail template"
        action={
          <button
            type="button"
            onClick={openCreate}
            className="btn btn-info btn-sm text-white"
          >
            Create Message template
          </button>
        }
      >
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="table table-xs min-w-[1050px] border border-base-300">
              <thead className="text-black">
                <tr>
                  <th className="border border-base-300">
                    #
                  </th>

                  <th className="border border-base-300">
                    Title
                  </th>

                  <th className="min-w-[420px] border border-base-300">
                    SMS Template
                  </th>

                  <th className="min-w-[280px] border border-base-300">
                    SMS Info
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
                {templates.map(
                  (
                    template,
                    index
                  ) => {
                    const info =
                      smsInfo(
                        template.template
                      );

                    return (
                      <tr
                        key={
                          template.id
                        }
                        className={
                          index % 2 ===
                          0
                            ? "bg-[#f1f1f1]"
                            : ""
                        }
                      >
                        <td className="border border-base-300 align-top">
                          {index + 1}
                        </td>

                        <td className="border border-base-300 align-top">
                          {
                            template.title
                          }
                        </td>

                        <td className="border border-base-300 align-top leading-5">
                          {
                            template.template
                          }
                        </td>

                        <td className="border border-base-300 align-top leading-5">
                          <div>
                            Encoding:{" "}
                            {
                              info.encoding
                            }
                          </div>

                          <div>
                            Total Char.:{" "}
                            {
                              info.length
                            }
                          </div>

                          <div>
                            SMS Count:{" "}
                            {
                              info.count
                            }
                          </div>

                          <div>
                            Remaining Char.:{" "}
                            {
                              info.remaining
                            }
                          </div>
                        </td>

                        <td className="border border-base-300 align-top">
                          {
                            template.createdBy
                          }
                        </td>

                        <td className="border border-base-300 align-top">
                          {
                            template.createdAt
                          }
                        </td>

                        <td className="border border-base-300 align-top">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              title="Edit"
                              onClick={() =>
                                openEdit(
                                  template
                                )
                              }
                              className="btn btn-info btn-square btn-sm h-8 min-h-8 w-8 text-white"
                            >
                              <Pencil
                                size={
                                  15
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Delete"
                              onClick={() =>
                                handleDelete(
                                  template.id
                                )
                              }
                              className="btn btn-error btn-square btn-sm h-8 min-h-8 w-8 text-white"
                            >
                              <Trash2
                                size={
                                  15
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}

                {templates.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="border border-base-300 py-8 text-center text-base-content/50"
                    >
                      No message templates
                      available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-sm font-bold">
            Showing{" "}
            {templates.length
              ? 1
              : 0}{" "}
            to {templates.length} of{" "}
            {templates.length} results.
          </p>
        </div>
      </Panel>

      <TemplateModal
        key={
          editingTemplate?.id ||
          (modalOpen
            ? "create"
            : "closed")
        }
        open={modalOpen}
        initial={
          editingTemplate
        }
        onClose={closeModal}
        onSave={handleSave}
      />
    </PageRoot>
  );
}