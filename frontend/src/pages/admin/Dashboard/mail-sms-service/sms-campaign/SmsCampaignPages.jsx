import { useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  FileText,
  Trash2,
  Eraser,
} from "lucide-react";

/* =========================================================
   STORAGE / DEMO DATA
========================================================= */

const CAMPAIGN_STORAGE_KEY =
  "mail_sms_campaign_reports";

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random()}`
  );
}

const defaultCampaignReports = [
  {
    id: 1,
    campaignName: "student_result",
    totalMobile: 71,
    totalSms: 355,
    createdAt: "2026-09-10 11:57:41",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 2,
    campaignName: "student_result",
    totalMobile: 52,
    totalSms: 260,
    createdAt: "2026-09-08 18:31:52",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 3,
    campaignName: "student_result",
    totalMobile: 5,
    totalSms: 25,
    createdAt: "2026-09-07 18:20:26",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 4,
    campaignName: "student_result",
    totalMobile: 48,
    totalSms: 240,
    createdAt: "2026-09-07 18:15:07",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 5,
    campaignName: "student_result",
    totalMobile: 48,
    totalSms: 240,
    createdAt: "2026-09-07 18:15:04",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 6,
    campaignName: "student_result",
    totalMobile: 44,
    totalSms: 220,
    createdAt: "2026-09-07 18:12:01",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 7,
    campaignName: "student_result",
    totalMobile: 15,
    totalSms: 75,
    createdAt: "2026-09-07 11:33:46",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 8,
    campaignName: "student_result",
    totalMobile: 19,
    totalSms: 95,
    createdAt: "2026-09-07 11:24:50",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 9,
    campaignName: "student_result",
    totalMobile: 19,
    totalSms: 95,
    createdAt: "2026-09-07 11:24:48",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 10,
    campaignName: "student_result",
    totalMobile: 71,
    totalSms: 355,
    createdAt: "2026-09-03 17:44:54",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 11,
    campaignName: "student_result",
    totalMobile: 71,
    totalSms: 355,
    createdAt: "2026-09-03 17:44:34",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 12,
    campaignName: "student_result",
    totalMobile: 71,
    totalSms: 355,
    createdAt: "2026-09-02 18:27:45",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 13,
    campaignName: "student_result",
    totalMobile: 65,
    totalSms: 324,
    createdAt: "2026-08-27 17:27:41",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 14,
    campaignName: "student_result",
    totalMobile: 18,
    totalSms: 90,
    createdAt: "2026-08-22 19:24:13",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 15,
    campaignName: "student_result",
    totalMobile: 65,
    totalSms: 325,
    createdAt: "2026-08-22 19:00:23",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 16,
    campaignName: "student_result",
    totalMobile: 43,
    totalSms: 215,
    createdAt: "2026-08-22 18:21:00",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 17,
    campaignName: "student_result",
    totalMobile: 18,
    totalSms: 90,
    createdAt: "2026-08-22 18:11:42",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 18,
    campaignName: "student_result",
    totalMobile: 18,
    totalSms: 90,
    createdAt: "2026-08-22 17:47:04",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 19,
    campaignName: "student_result",
    totalMobile: 68,
    totalSms: 340,
    createdAt: "2026-08-22 17:45:14",
    createdBy: "Expert Coaching Center",
  },
  {
    id: 20,
    campaignName: "student_result",
    totalMobile: 57,
    totalSms: 285,
    createdAt: "2026-08-20 17:31:10",
    createdBy: "Expert Coaching Center",
  },
];

function getCampaignReports() {
  try {
    const saved =
      localStorage.getItem(
        CAMPAIGN_STORAGE_KEY
      );

    if (!saved) {
      localStorage.setItem(
        CAMPAIGN_STORAGE_KEY,
        JSON.stringify(
          defaultCampaignReports
        )
      );

      return defaultCampaignReports;
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : defaultCampaignReports;
  } catch {
    return defaultCampaignReports;
  }
}

function saveCampaignReports(rows) {
  localStorage.setItem(
    CAMPAIGN_STORAGE_KEY,
    JSON.stringify(rows)
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

function useCampaignNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goSibling = (slug) => {
    const path =
      location.pathname.replace(
        /\/+$/,
        ""
      );

    const parent =
      path.substring(
        0,
        path.lastIndexOf("/")
      );

    navigate(`${parent}/${slug}`);
  };

  return {
    goCreate: () =>
      goSibling(
        "sms-campaign-create"
      ),

    goList: () =>
      goSibling(
        "sms-report-list"
      ),

    goSearch: () =>
      goSibling(
        "sms-report-search"
      ),

    goOrganization: () =>
      goSibling(
        "sms-campaign-organization"
      ),
  };
}

/* =========================================================
   SHARED UI
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
}) {
  return (
    <section className="overflow-hidden rounded-md border border-base-300 bg-white shadow-sm">
      <div className="flex min-h-[40px] items-center justify-between gap-3 bg-[#456db5] px-3 py-2 text-white sm:px-5">
        <h2 className="text-base font-bold sm:text-lg">
          {title}
        </h2>

        {action}
      </div>

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
      className={`input input-bordered input-sm h-8 min-h-8 w-full rounded-[3px] bg-white ${className}`}
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
      className={`select select-bordered select-sm h-8 min-h-8 w-full rounded-[3px] bg-white ${className}`}
    >
      {children}
    </select>
  );
}

function HeaderButton({
  children,
  onClick,
}) {
  return (
    <motion.button
      whileTap={{
        scale: 0.96,
      }}
      type="button"
      onClick={onClick}
      className="btn btn-info btn-sm min-h-0 text-white"
    >
      {children}
    </motion.button>
  );
}

function FormRow({
  label,
  children,
  required = false,
}) {
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[280px_minmax(0,1fr)]">
      <label className="text-sm font-bold">
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

function SmsMessageEditor({
  template,
  setTemplate,
  message,
  setMessage,
}) {
  const characterCount =
    message.length;

  const totalSms =
    characterCount === 0
      ? 0
      : Math.ceil(
          characterCount / 160
        );

  const remaining =
    totalSms === 0
      ? 0
      : totalSms * 160 -
        characterCount;

  return (
    <div>
      <div className="flex">
        <Select
          value={template}
          onChange={(e) =>
            setTemplate(
              e.target.value
            )
          }
          className="rounded-r-none"
        >
          <option>
            Application Approved SMS
          </option>
          <option>
            Student Result SMS
          </option>
          <option>
            Admission SMS
          </option>
          <option>
            General SMS
          </option>
        </Select>

        <button
          type="button"
          title="Clear message"
          onClick={() =>
            setMessage("")
          }
          className="btn btn-neutral btn-square btn-sm h-8 min-h-8 w-8 rounded-l-none"
        >
          <Eraser size={15} />
        </button>
      </div>

      <textarea
        value={message}
        onChange={(e) =>
          setMessage(
            e.target.value
          )
        }
        placeholder="Enter Message"
        className="textarea textarea-bordered min-h-[54px] w-full rounded-t-none text-sm"
      />

      <p className="mt-1 text-[11px] text-cyan-600">
        * Note:160 GSM and 70
        Unicode count as 1 SMS and
        153 GSM & 67 Unicode
        Characters for multipart SMS
      </p>

      <p className="text-[11px] text-cyan-600">
        SMS Encoding: N/A, Total
        Char. Count:{" "}
        {characterCount}, Total SMS
        Count: {totalSms}, Remaining
        Characters: {remaining}
      </p>
    </div>
  );
}

/* =========================================================
   1. SMS CAMPAIGN CREATE
========================================================= */

export function SmsCampaignCreatePage() {
  const { goList } =
    useCampaignNavigation();

  const [campaignName, setCampaignName] =
    useState("");

  const [selectType, setSelectType] =
    useState("Enter Number");

  const [numbers, setNumbers] =
    useState("");

  const [template, setTemplate] =
    useState(
      "Application Approved SMS"
    );

  const [message, setMessage] =
    useState("");

  const [status, setStatus] =
    useState("");

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (!campaignName.trim()) {
      setStatus(
        "Campaign Name is required."
      );
      return;
    }

    const numberList =
      numbers
        .split(/[\s,\n]+/)
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);

    const totalMobile =
      Math.max(
        numberList.length,
        numbers.trim() ? 1 : 0
      );

    const smsPerNumber =
      Math.max(
        1,
        Math.ceil(
          message.length / 160
        )
      );

    const newCampaign = {
      id: createId(),
      campaignName:
        campaignName.trim(),
      totalMobile,
      totalSms:
        totalMobile *
        smsPerNumber,
      createdAt:
        new Date()
          .toISOString()
          .replace("T", " ")
          .slice(0, 19),
      createdBy:
        "Expert Coaching Center",
      template,
      message,
    };

    const existing =
      getCampaignReports();

    saveCampaignReports([
      newCampaign,
      ...existing,
    ]);

    setStatus(
      "SMS campaign created successfully."
    );

    setCampaignName("");
    setNumbers("");
    setMessage("");
  };

  return (
    <PageRoot>
      <Panel
        title="SMS campaign Create"
        action={
          <HeaderButton
            onClick={goList}
          >
            Back to Sms campaign List
          </HeaderButton>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="p-5"
        >
          {status && (
            <div className="alert alert-info mb-4 py-2 text-sm">
              {status}
            </div>
          )}

          <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_370px]">
            <div className="space-y-3">
              <FormRow label="Campaign Name:">
                <Input
                  value={campaignName}
                  onChange={(e) =>
                    setCampaignName(
                      e.target.value
                    )
                  }
                  placeholder="Enter Campaign Name"
                />
              </FormRow>

              <FormRow label="Select Type:">
                <Select
                  value={selectType}
                  onChange={(e) =>
                    setSelectType(
                      e.target.value
                    )
                  }
                >
                  <option>
                    Enter Number
                  </option>

                  <option>
                    Contact List
                  </option>

                  <option>
                    Organization
                  </option>
                </Select>
              </FormRow>

              <FormRow label="Enter Number:">
                <Input
                  value={numbers}
                  onChange={(e) =>
                    setNumbers(
                      e.target.value
                    )
                  }
                  placeholder="Enter Number"
                />
              </FormRow>

              <div className="grid items-start gap-3 sm:grid-cols-[280px_minmax(0,1fr)]">
                <label className="pt-2 text-sm font-bold">
                  Message:
                </label>

                <SmsMessageEditor
                  template={template}
                  setTemplate={
                    setTemplate
                  }
                  message={message}
                  setMessage={
                    setMessage
                  }
                />
              </div>

              <div className="grid sm:grid-cols-[280px_minmax(0,1fr)]">
                <div />

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn btn-success btn-sm min-h-0 text-white"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>

            {/* SMS API INFORMATION */}
            <div className="overflow-hidden rounded-md shadow-md">
              <div className="bg-[#456db5] px-5 py-3 text-lg font-bold text-white">
                SMS Api Information
              </div>

              <div className="bg-cyan-600 px-5 py-5 text-sm text-white">
                <p>
                  Total Active SMS Api:{" "}
                  <strong>1</strong>
                </p>

                <p className="mt-1">
                  Total Available SMS:{" "}
                  <strong>0</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="min-h-[10px]" />
        </form>
      </Panel>
    </PageRoot>
  );
}

/* =========================================================
   2. SMS REPORT LIST
========================================================= */

export function SmsReportListPage() {
  const { goCreate } =
    useCampaignNavigation();

  const [rows, setRows] =
    useState(() =>
      getCampaignReports()
    );

  const [fromDate, setFromDate] =
    useState("2026-09-18");

  const [toDate, setToDate] =
    useState("2026-09-18");

  const [invoice, setInvoice] =
    useState("");

  const [searched, setSearched] =
    useState({
      fromDate: "",
      toDate: "",
      invoice: "",
    });

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      const rowDate =
        row.createdAt?.slice(0, 10) ||
        "";

      const fromOk =
        !searched.fromDate ||
        rowDate >= searched.fromDate;

      const toOk =
        !searched.toDate ||
        rowDate <= searched.toDate;

      const invoiceOk =
        !searched.invoice ||
        String(row.id)
          .toLowerCase()
          .includes(
            searched.invoice.toLowerCase()
          );

      return (
        fromOk &&
        toOk &&
        invoiceOk
      );
    });
  }, [rows, searched]);

  const deleteCampaign = (
    id
  ) => {
    if (
      !window.confirm(
        "Delete this SMS campaign?"
      )
    ) {
      return;
    }

    const updated =
      rows.filter(
        (row) => row.id !== id
      );

    setRows(updated);
    saveCampaignReports(updated);
  };

  const viewCampaign = (
    row
  ) => {
    window.alert(
      [
        `Campaign: ${row.campaignName}`,
        `Total Mobile: ${row.totalMobile}`,
        `Total SMS: ${row.totalSms}`,
        `Create Time: ${row.createdAt}`,
        `Create By: ${row.createdBy}`,
      ].join("\n")
    );
  };

  return (
    <PageRoot>
      <div className="space-y-6">
        <Panel
          title="SMS Campaign Search"
          action={
            <HeaderButton
              onClick={goCreate}
            >
              Create Sms campaign
            </HeaderButton>
          }
        >
          <div className="px-5 py-5">
            <div className="mx-auto grid max-w-[1050px] gap-x-7 gap-y-4 lg:grid-cols-2">
              <FormRow label="From:">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) =>
                    setFromDate(
                      e.target.value
                    )
                  }
                />
              </FormRow>

              <FormRow label="To:">
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) =>
                    setToDate(
                      e.target.value
                    )
                  }
                />
              </FormRow>

              <FormRow label="Invoice:">
                <Input
                  value={invoice}
                  onChange={(e) =>
                    setInvoice(
                      e.target.value
                    )
                  }
                  placeholder="Enter Invoice"
                />
              </FormRow>

              <div />

              <div className="lg:col-start-1 sm:ml-[280px]">
                <button
                  type="button"
                  onClick={() =>
                    setSearched({
                      fromDate,
                      toDate,
                      invoice:
                        invoice.trim(),
                    })
                  }
                  className="btn btn-info btn-sm min-h-0 text-white"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="min-h-[15px]" />
          </div>
        </Panel>

        <Panel
          title="SMS Report List"
          action={
            <HeaderButton
              onClick={goCreate}
            >
              Create Sms campaign
            </HeaderButton>
          }
        >
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="table table-xs w-full min-w-[950px] border border-base-300">
                <thead>
                  <tr>
                    <th className="border border-base-300">
                      Campaign Name
                    </th>

                    <th className="border border-base-300">
                      Total Mobile Number
                    </th>

                    <th className="border border-base-300">
                      Total Sms
                    </th>

                    <th className="border border-base-300">
                      Create Time
                    </th>

                    <th className="border border-base-300">
                      Create by
                    </th>

                    <th className="border border-base-300">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map(
                    (row, index) => (
                      <tr
                        key={row.id}
                        className={
                          index % 2 === 0
                            ? "bg-[#f1f1f1]"
                            : ""
                        }
                      >
                        <td className="border border-base-300">
                          {
                            row.campaignName
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.totalMobile
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.totalSms
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.createdAt
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.createdBy
                          }
                        </td>

                        <td className="border border-base-300">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              title="Delete"
                              onClick={() =>
                                deleteCampaign(
                                  row.id
                                )
                              }
                              className="btn btn-error btn-square btn-xs text-white"
                            >
                              <Trash2
                                size={13}
                              />
                            </button>

                            <button
                              type="button"
                              title="View"
                              onClick={() =>
                                viewCampaign(
                                  row
                                )
                              }
                              className="btn btn-success btn-square btn-xs text-white"
                            >
                              <Eye
                                size={13}
                              />
                            </button>

                            <button
                              type="button"
                              title="Report"
                              className="btn btn-success btn-square btn-xs text-white"
                            >
                              <FileText
                                size={13}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-bold">
                Showing 1 to{" "}
                {Math.min(
                  filtered.length,
                  20
                )}{" "}
                of 394 results.
              </p>

              <div className="join">
                <button className="btn btn-primary btn-xs join-item">
                  1
                </button>

                <button className="btn btn-ghost btn-xs join-item">
                  2
                </button>

                <button className="btn btn-ghost btn-xs join-item">
                  3
                </button>

                <button className="btn btn-ghost btn-xs join-item">
                  &gt;
                </button>

                <button className="btn btn-ghost btn-xs join-item">
                  Last ›
                </button>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   SMS REPORT SEARCH DEMO DATA
========================================================= */

const studentNames = [
  ["279002", "NAFISA ANJUM", "2", "01912230683"],
  ["279030", "ARNAB MAZUMDAR", "30", "01688879137"],
  ["279047", "AZIZUL HAKIM", "47", "01746457960"],
  ["279029", "MAHIB DAIYAN", "29", "01726932992"],
  ["279037", "BIPROTEEP VOUMIK", "37", "01533472747"],
  ["279038", "SOUMIK SORKER", "38", "01716352101"],
  ["279040", "ARKO DAS", "40", "01822900852"],
  ["279001", "FARJANA AKTER JUTHY", "1", "01989585699"],
  ["279012", "TABASSUM TANHA", "12", "01779343525"],
  ["279035", "ABDULLAH AL SIUM", "35", "01406409270"],
  ["279003", "SOUROV DHOR", "3", "01756252397"],
];

const detailedSmsRows =
  Array.from(
    { length: 21 },
    (_, index) => {
      const student =
        studentNames[
          Math.floor(index / 2) %
            studentNames.length
        ];

      const className =
        index % 2 === 0
          ? "Class 09"
          : "Class 10";

      return {
        id: index + 1,
        studentId: student[0],
        studentName: student[1],
        className,
        roll: student[2],
        mobile: student[3],
        message: `Exam Result PRE MODEL TEST 01 SSC 2027 Name: ${student[1]} (${student[0]}) Subject: Information & communication technology Date: 27-08-2026 Exam Type: MCQ: 60 Obtain mark: MCQ (51) Total Mark: 51 out of 60 Grade: A+ Highest Mark: 51 Position: ${
          index + 1
        }th - Expert Coaching Center.`,
        submitTime:
          "2026-09-10 11:57:41",
        response: "Delivered",
      };
    }
  );

/* =========================================================
   3. SMS REPORT SEARCH
========================================================= */

export function SmsReportSearchPage() {
  const [fromDate, setFromDate] =
    useState("2026-09-01");

  const [toDate, setToDate] =
    useState("2026-09-30");

  const [mobile, setMobile] =
    useState("");

  const [tableSearch, setTableSearch] =
    useState("");

  const filteredRows =
    useMemo(() => {
      const query =
        tableSearch
          .trim()
          .toLowerCase();

      return detailedSmsRows.filter(
        (row) => {
          const mobileMatch =
            !mobile.trim() ||
            row.mobile.includes(
              mobile.trim()
            );

          const tableMatch =
            !query ||
            Object.values(row)
              .join(" ")
              .toLowerCase()
              .includes(query);

          return (
            mobileMatch &&
            tableMatch
          );
        }
      );
    }, [mobile, tableSearch]);

  return (
    <PageRoot>
      <div className="space-y-6">
        <Panel title="SMS Report Search">
          <div className="px-5 py-5">
            <div className="mx-auto grid max-w-[950px] gap-x-7 gap-y-4 lg:grid-cols-2">
              <FormRow label="From:">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) =>
                    setFromDate(
                      e.target.value
                    )
                  }
                />
              </FormRow>

              <FormRow label="To:">
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) =>
                    setToDate(
                      e.target.value
                    )
                  }
                />
              </FormRow>

              <FormRow label="Mobile:">
                <Input
                  value={mobile}
                  onChange={(e) =>
                    setMobile(
                      e.target.value
                    )
                  }
                  placeholder="Mobile Number"
                />
              </FormRow>

              <div />

              <div className="flex gap-1 sm:ml-[280px]">
                <button
                  type="button"
                  className="btn btn-info btn-sm min-h-0 text-white"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() =>
                    window.print()
                  }
                  className="btn btn-success btn-sm min-h-0 text-white"
                >
                  Print
                </button>
              </div>
            </div>

            <div className="min-h-[10px]" />
          </div>
        </Panel>

        <Panel title="SMS Report List">
          <div className="p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-1 text-sm">
                <Select
                  defaultValue="50"
                  className="w-[65px]"
                >
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </Select>

                entries per page
              </label>

              <label className="flex items-center gap-2 text-sm">
                Search:
                <Input
                  value={
                    tableSearch
                  }
                  onChange={(e) =>
                    setTableSearch(
                      e.target.value
                    )
                  }
                  className="w-[180px]"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-xs min-w-[1250px] border border-base-300">
                <thead>
                  <tr>
                    <th className="border border-base-300">
                      SL
                    </th>

                    <th className="border border-base-300">
                      Student ID
                    </th>

                    <th className="border border-base-300">
                      Student Name
                    </th>

                    <th className="border border-base-300">
                      Class
                    </th>

                    <th className="border border-base-300">
                      Roll
                    </th>

                    <th className="border border-base-300">
                      Mobile
                    </th>

                    <th className="min-w-[500px] border border-base-300">
                      Message
                    </th>

                    <th className="border border-base-300">
                      Submit Time
                    </th>

                    <th className="border border-base-300">
                      Response
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map(
                    (row, index) => (
                      <tr
                        key={row.id}
                        className={
                          index % 2 === 0
                            ? "bg-[#f1f1f1]"
                            : ""
                        }
                      >
                        <td className="border border-base-300 text-center">
                          {index + 1}
                        </td>

                        <td className="border border-base-300 text-center">
                          {
                            row.studentId
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.studentName
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.className
                          }
                        </td>

                        <td className="border border-base-300 text-center">
                          {row.roll}
                        </td>

                        <td className="border border-base-300">
                          {
                            row.mobile
                          }
                        </td>

                        <td className="border border-base-300 leading-5">
                          {
                            row.message
                          }
                        </td>

                        <td className="border border-base-300 text-center">
                          {
                            row.submitTime
                          }
                        </td>

                        <td className="border border-base-300">
                          {
                            row.response
                          }
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
      </div>
    </PageRoot>
  );
}

/* =========================================================
   ORGANIZATION DATA
========================================================= */

const organizationGroups = [
  {
    title: "EXAM BATCH HSC 2026",
    rows: [
      {
        className: "HSC",
        section: "EXAM BATCH (188)",
      },
    ],
  },
  {
    title: "EXAM BATCH SSC 2026",
    rows: [
      {
        className: "SSC",
        section: "EXAM BATCH (60)",
      },
    ],
  },
  {
    title: "All Shift",
    rows: [
      {
        className: "Class 10",
        section: "Day (72)",
      },
      {
        className: "Class 09",
        section: "Day (65)",
      },
    ],
  },
  {
    title: "All shift for HSC",
    rows: [
      {
        className:
          "Inter 2nd year",
        section: "All (57)",
      },
    ],
  },
  {
    title:
      "9.30AM- 11.30AM Morning",
    rows: [],
  },
  {
    title: "demo shift",
    rows: [
      {
        className: "demo",
        section: "demo (1)",
      },
    ],
  },
];

/* =========================================================
   4. SMS CAMPAIGN ORGANIZATION
========================================================= */

export function SmsCampaignOrganizationPage() {
  const { goList } =
    useCampaignNavigation();

  const [campaignName, setCampaignName] =
    useState("");

  const [template, setTemplate] =
    useState(
      "Application Approved SMS"
    );

  const [message, setMessage] =
    useState("");

  const [activeTab, setActiveTab] =
    useState("All Students");

  const [selectAll, setSelectAll] =
    useState(false);

  const tabs = [
    "All Students",
    "Online Application Students",
    "Teacher & Employee",
    "Administrative Users",
    "Management Users",
  ];

  return (
    <PageRoot>
      <Panel
        title="Organization List"
        action={
          <HeaderButton
            onClick={goList}
          >
            Back to Sms campaign List
          </HeaderButton>
        }
      >
        <div className="p-5">
          {/* TOP FORM */}
          <div className="mx-auto max-w-[1100px] space-y-4">
            <FormRow
              label="Campaign Name:"
              required
            >
              <Input
                value={campaignName}
                onChange={(e) =>
                  setCampaignName(
                    e.target.value
                  )
                }
                placeholder="Enter Campaign Name"
              />
            </FormRow>

            <div className="grid items-start gap-3 sm:grid-cols-[280px_minmax(0,1fr)]">
              <label className="pt-2 text-sm font-bold">
                Message:
                <span className="text-red-500">
                  *
                </span>
              </label>

              <SmsMessageEditor
                template={template}
                setTemplate={
                  setTemplate
                }
                message={message}
                setMessage={
                  setMessage
                }
              />
            </div>

            <div className="grid sm:grid-cols-[280px_minmax(0,1fr)]">
              <div />

              <div className="text-center">
                <button
                  type="button"
                  onClick={() =>
                    window.alert(
                      `Campaign: ${campaignName || "N/A"}`
                    )
                  }
                  className="btn btn-success btn-sm min-h-0 text-white"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="mt-5 flex flex-wrap border-b border-base-300">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() =>
                  setActiveTab(tab)
                }
                className={`border border-b-0 px-4 py-2 text-sm ${
                  activeTab === tab
                    ? "bg-base-200 font-bold text-black"
                    : "border-transparent text-blue-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* STUDENT GROUP */}
          <div className="mt-3 overflow-hidden rounded border border-base-300">
            <div className="flex items-center justify-between bg-[#456db5] px-3 py-2 text-white">
              <span className="font-bold">
                {activeTab}
              </span>

              <label className="flex items-center gap-1 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) =>
                    setSelectAll(
                      e.target.checked
                    )
                  }
                  className="checkbox checkbox-xs"
                />
                Select All
              </label>
            </div>

            <div className="space-y-4 p-4">
              {activeTab ===
              "All Students" ? (
                organizationGroups.map(
                  (group) => (
                    <div
                      key={
                        group.title
                      }
                    >
                      <h3 className="mb-2 text-xl font-medium text-black">
                        {group.title}
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="table table-xs min-w-[650px] border border-base-300">
                          <thead>
                            <tr>
                              <th className="border border-base-300">
                                Class
                              </th>

                              <th className="border border-base-300">
                                Section
                              </th>

                              <th className="w-[250px] border border-base-300">
                                Roll
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {group.rows
                              .length >
                            0 ? (
                              group.rows.map(
                                (
                                  row,
                                  rowIndex
                                ) => (
                                  <tr
                                    key={`${group.title}-${rowIndex}`}
                                  >
                                    <td className="border border-base-300">
                                      {
                                        row.className
                                      }
                                    </td>

                                    <td className="border border-base-300">
                                      {
                                        row.section
                                      }
                                    </td>

                                    <td className="border border-base-300">
                                      <Select defaultValue="">
                                        <option value="">
                                          Nothing
                                          selected
                                        </option>

                                        <option>
                                          All
                                        </option>

                                        <option>
                                          1
                                        </option>

                                        <option>
                                          2
                                        </option>
                                      </Select>
                                    </td>
                                  </tr>
                                )
                              )
                            ) : (
                              <tr>
                                <td className="border border-base-300" />
                                <td className="border border-base-300" />
                                <td className="border border-base-300" />
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="py-12 text-center text-base-content/60">
                  No data available
                  for {activeTab}.
                </div>
              )}
            </div>
          </div>

          <div className="min-h-[45px]" />
        </div>
      </Panel>
    </PageRoot>
  );
}