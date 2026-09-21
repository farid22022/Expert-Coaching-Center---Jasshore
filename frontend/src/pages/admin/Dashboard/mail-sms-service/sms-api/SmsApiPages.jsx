import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "mail_sms_api_list";

const defaultSmsApis = [
  {
    id: 1,
    mainUrl:
      "https://pathshala.quicksmsapp.com/Api/sms/campaign_api?",
    apiKey: "",
    balanceUrl: "",
    balanceRate: "0.35",
    responseParam: "",
    balance: "1.40",
    totalSms: 3,
    status: "Inactive",
    params: [],
  },
  {
    id: 2,
    mainUrl:
      "https://sms.mram.com.bd/smsapi?",
    apiKey: "",
    balanceUrl: "",
    balanceRate: "0.3",
    responseParam: "",
    balance: "0.00",
    totalSms: 0,
    status: "Active",
    params: [],
  },
];

function getStoredApis() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultSmsApis)
      );

      return defaultSmsApis;
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : defaultSmsApis;
  } catch {
    return defaultSmsApis;
  }
}

function saveApis(rows) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(rows)
  );
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random()}`
  );
}

function createParamRow() {
  return {
    id: createId(),
    key: "",
    value: "",
    option: "",
  };
}

/* =========================================================
   ROUTE HELPER
========================================================= */

function useSmsApiNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const goSibling = (
    slug,
    state = undefined
  ) => {
    const current =
      location.pathname.replace(
        /\/+$/,
        ""
      );

    const parent =
      current.substring(
        0,
        current.lastIndexOf("/")
      );

    navigate(`${parent}/${slug}`, {
      state,
    });
  };

  return {
    goCreate: (state) =>
      goSibling(
        "sms-api-create",
        state
      ),

    goList: () =>
      goSibling("sms-api-list"),
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
  children,
  className = "",
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

function RequiredNotice() {
  return (
    <div className="rounded border border-amber-200 bg-[#fff3cd] px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

/* =========================================================
   SMS API CREATE
========================================================= */

export function SmsApiCreatePage() {
  const location = useLocation();

  const { goList } =
    useSmsApiNavigation();

  const editApi =
    location.state?.api || null;

  const [form, setForm] =
    useState({
      mainUrl:
        editApi?.mainUrl || "",
      apiKey:
        editApi?.apiKey || "",
      balanceUrl:
        editApi?.balanceUrl || "",
      balanceRate:
        editApi?.balanceRate || "",
      responseParam:
        editApi?.responseParam || "",
      status:
        editApi?.status || "",
    });

  const [params, setParams] =
    useState(
      editApi?.params?.length
        ? editApi.params
        : [createParamRow()]
    );

  const [addCount, setAddCount] =
    useState(1);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const updateForm = (
    key,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setError("");
    setSuccess("");
  };

  const updateParam = (
    id,
    key,
    value
  ) => {
    setParams((prev) =>
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
    const count = Math.max(
      1,
      Number(addCount) || 1
    );

    setParams((prev) => [
      ...prev,
      ...Array.from(
        { length: count },
        () => createParamRow()
      ),
    ]);
  };

  const deleteParam = (id) => {
    setParams((prev) => {
      if (prev.length === 1) {
        return [
          createParamRow(),
        ];
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

    if (!form.mainUrl.trim()) {
      setError(
        "SMS Api URL is required."
      );
      return;
    }

    if (!form.apiKey.trim()) {
      setError(
        "SMS Api Key is required."
      );
      return;
    }

    const validParams =
      params.filter(
        (row) =>
          row.key.trim() &&
          row.value.trim()
      );

    if (!validParams.length) {
      setError(
        "At least one SMS Api Param is required."
      );
      return;
    }

    const existing =
      getStoredApis();

    const payload = {
      id:
        editApi?.id ??
        createId(),

      mainUrl:
        form.mainUrl.trim(),

      apiKey:
        form.apiKey.trim(),

      balanceUrl:
        form.balanceUrl.trim(),

      balanceRate:
        form.balanceRate.trim(),

      responseParam:
        form.responseParam.trim(),

      balance:
        editApi?.balance ??
        "0.00",

      totalSms:
        editApi?.totalSms ?? 0,

      status:
        form.status ||
        "Inactive",

      params: validParams,
    };

    const updated =
      editApi
        ? existing.map((item) =>
            item.id ===
            editApi.id
              ? payload
              : item
          )
        : [
            ...existing,
            payload,
          ];

    saveApis(updated);

    setError("");
    setSuccess(
      editApi
        ? "SMS API updated successfully."
        : "SMS API created successfully."
    );

    if (!editApi) {
      setForm({
        mainUrl: "",
        apiKey: "",
        balanceUrl: "",
        balanceRate: "",
        responseParam: "",
        status: "",
      });

      setParams([
        createParamRow(),
      ]);

      setAddCount(1);
    }
  };

  return (
    <PageRoot>
      <Panel
        title="SMS API Create"
        action={
          <HeaderButton
            onClick={goList}
          >
            Back to Sms api List
          </HeaderButton>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-5 sm:p-6"
        >
          <RequiredNotice />

          {error && (
            <div className="alert alert-error py-2 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success py-2 text-sm text-white">
              {success}
            </div>
          )}

          {/* SMS API URL */}
          <div className="grid items-center gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
            <label className="text-sm font-bold">
              SMS Api URL:
              <span className="text-red-500">
                *
              </span>
            </label>

            <Input
              value={
                form.mainUrl
              }
              onChange={(e) =>
                updateForm(
                  "mainUrl",
                  e.target.value
                )
              }
              placeholder="Enter SMS Api URL"
            />
          </div>

          {/* API KEY */}
          <div className="grid items-center gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
            <label className="text-sm font-bold">
              SMS Api Key:
              <span className="text-red-500">
                *
              </span>
            </label>

            <Input
              value={
                form.apiKey
              }
              onChange={(e) =>
                updateForm(
                  "apiKey",
                  e.target.value
                )
              }
              placeholder="Enter SMS Api Key"
            />
          </div>

          {/* PARAM TABLE */}
          <div className="grid gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
            <div />

            <div className="overflow-hidden rounded-md border border-base-300 bg-white shadow-sm">
              <div className="flex min-h-[40px] items-center justify-between bg-[#456db5] px-5 py-2 text-white">
                <h3 className="text-lg font-bold">
                  SMS Api Param
                </h3>

                <div className="join">
                  <input
                    type="number"
                    min="1"
                    value={
                      addCount
                    }
                    onChange={(e) =>
                      setAddCount(
                        e.target.value
                      )
                    }
                    className="input input-sm join-item h-8 w-10 rounded-none bg-white px-2 text-center text-black"
                  />

                  <button
                    type="button"
                    onClick={
                      addRows
                    }
                    className="btn btn-info btn-sm join-item min-h-0 rounded-none text-white"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="p-5">
                <div className="overflow-x-auto">
                  <table className="table table-xs min-w-[800px] border border-base-300">
                    <thead>
                      <tr>
                        <th className="border border-base-300">
                          SMS Api Param{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </th>

                        <th className="border border-base-300">
                          SMS Api Param
                          Value{" "}
                          <span className="text-red-500">
                            *
                          </span>
                        </th>

                        <th className="border border-base-300">
                          Options
                        </th>

                        <th className="w-[95px] border border-base-300">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {params.map(
                        (row) => (
                          <motion.tr
                            key={
                              row.id
                            }
                            initial={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1,
                            }}
                          >
                            <td className="border border-base-300 bg-[#f1f1f1]">
                              <Input
                                value={
                                  row.key
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateParam(
                                    row.id,
                                    "key",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Enter Api Key"
                              />
                            </td>

                            <td className="border border-base-300 bg-[#f1f1f1]">
                              <Input
                                value={
                                  row.value
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateParam(
                                    row.id,
                                    "value",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Enter Api Value"
                              />
                            </td>

                            <td className="border border-base-300 bg-[#f1f1f1]">
                              <Select
                                value={
                                  row.option
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateParam(
                                    row.id,
                                    "option",
                                    e
                                      .target
                                      .value
                                  )
                                }
                              >
                                <option value="">
                                  Select
                                  Options
                                </option>

                                <option value="sender">
                                  Sender
                                </option>

                                <option value="number">
                                  Mobile
                                  Number
                                </option>

                                <option value="message">
                                  Message
                                </option>

                                <option value="api-key">
                                  API Key
                                </option>

                                <option value="fixed">
                                  Fixed
                                  Value
                                </option>
                              </Select>
                            </td>

                            <td className="border border-base-300 bg-[#f1f1f1]">
                              <button
                                type="button"
                                onClick={() =>
                                  deleteParam(
                                    row.id
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
                            </td>
                          </motion.tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* BALANCE URL */}
          <div className="grid items-center gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
            <label className="text-sm font-bold">
              Api Balance URL:
            </label>

            <div className="grid md:grid-cols-3">
              <Input
                value={
                  form.balanceUrl
                }
                onChange={(e) =>
                  updateForm(
                    "balanceUrl",
                    e.target.value
                  )
                }
                placeholder="Enter Api Balance URL"
                className="rounded-r-none"
              />

              <Input
                value={
                  form.balanceRate
                }
                onChange={(e) =>
                  updateForm(
                    "balanceRate",
                    e.target.value
                  )
                }
                placeholder="Balance Rate"
                className="rounded-none border-l-0"
              />

              <Input
                value={
                  form.responseParam
                }
                onChange={(e) =>
                  updateForm(
                    "responseParam",
                    e.target.value
                  )
                }
                placeholder="Response Param"
                className="rounded-l-none border-l-0"
              />
            </div>
          </div>

          {/* STATUS */}
          <div className="grid items-center gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
            <label className="text-sm font-bold">
              Api Status:
            </label>

            <Select
              value={
                form.status
              }
              onChange={(e) =>
                updateForm(
                  "status",
                  e.target.value
                )
              }
            >
              <option value="">
                Select Options
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </Select>
          </div>

          {/* SUBMIT */}
          <div className="grid lg:grid-cols-[250px_minmax(0,1fr)]">
            <div />

            <div className="pl-[130px] pt-1 lg:pl-[134px]">
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
   SMS API LIST
========================================================= */

export function SmsApiListPage() {
  const { goCreate } =
    useSmsApiNavigation();

  const [rows, setRows] =
    useState(() =>
      getStoredApis()
    );

  const handleDelete = (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this SMS API?"
      );

    if (!confirmed) return;

    const updated =
      rows.filter(
        (row) => row.id !== id
      );

    setRows(updated);
    saveApis(updated);
  };

  const handleView = (row) => {
    window.alert(
      [
        `Main URL: ${row.mainUrl}`,
        `Balance Rate: ${row.balanceRate}`,
        `Balance: ${row.balance}`,
        `Total SMS: ${row.totalSms}`,
        `Status: ${row.status}`,
      ].join("\n")
    );
  };

  const buySms = (row) => {
    window.alert(
      `Buy SMS for:\n${row.mainUrl}`
    );
  };

  return (
    <PageRoot>
      <Panel
        title="SMS API List"
        action={
          <HeaderButton
            onClick={() =>
              goCreate()
            }
          >
            Create Sms api
          </HeaderButton>
        }
      >
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="table table-xs w-full min-w-[950px] border border-base-300">
              <thead>
                <tr>
                  <th className="border border-base-300">
                    Main URL
                  </th>

                  <th className="border border-base-300">
                    Balance Rate
                  </th>

                  <th className="border border-base-300">
                    Balance
                  </th>

                  <th className="border border-base-300">
                    Total SMS
                  </th>

                  <th className="border border-base-300">
                    Status
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
                      className={
                        index % 2 ===
                        0
                          ? "bg-[#f1f1f1]"
                          : ""
                      }
                    >
                      <td className="border border-base-300">
                        {row.mainUrl}
                      </td>

                      <td className="border border-base-300">
                        {row.balanceRate ||
                          "0"}
                      </td>

                      <td className="border border-base-300">
                        {row.balance ||
                          "0.00"}
                      </td>

                      <td className="border border-base-300">
                        {row.totalSms ??
                          0}
                      </td>

                      <td className="border border-base-300">
                        {row.status}
                      </td>

                      <td className="border border-base-300">
                        <div className="flex items-center gap-1">
                          {row.status ===
                            "Inactive" && (
                            <button
                              type="button"
                              onClick={() =>
                                buySms(
                                  row
                                )
                              }
                              className="btn btn-primary btn-sm h-8 min-h-8 bg-violet-700 px-3 text-white hover:bg-violet-800"
                            >
                              Buy SMS
                            </button>
                          )}

                          <button
                            type="button"
                            title="View"
                            onClick={() =>
                              handleView(
                                row
                              )
                            }
                            className="btn btn-info btn-square btn-sm h-8 min-h-8 w-8 text-white"
                          >
                            <Eye
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              goCreate({
                                api: row,
                              })
                            }
                            className="btn btn-info btn-square btn-sm h-8 min-h-8 w-8 text-white"
                          >
                            <Pencil
                              size={15}
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
                            className="btn btn-error btn-square btn-sm h-8 min-h-8 w-8 text-white"
                          >
                            <Trash2
                              size={15}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}

                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-base-300 py-7 text-center text-base-content/50"
                    >
                      No SMS API data
                      available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>
    </PageRoot>
  );
}