import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Pencil,
  Trash2,
  History,
} from "lucide-react";

/* =========================================================
   SHARED
========================================================= */

const BLUE = "bg-[#456db5]";

function PageContainer({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-[calc(100vh-60px)] bg-[#f5f5f5] p-2 sm:p-3"
    >
      {children}
    </motion.div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="overflow-hidden rounded-md border border-base-300 bg-white shadow-sm">
      <div
        className={`${BLUE} flex min-h-[40px] items-center justify-between gap-3 px-5 py-2 text-white`}
      >
        <h2 className="text-lg font-bold">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function RequiredAlert() {
  return (
    <div className="rounded border border-[#f4dea2] bg-[#fff3cd] px-5 py-4 text-sm font-bold text-red-500">
      (*) field required
    </div>
  );
}

function Input({
  className = "",
  ...props
}) {
  return (
    <input
      {...props}
      className={`input input-bordered input-sm h-8 w-full rounded-[3px] bg-white ${className}`}
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

function siblingPath(pathname, slug) {
  const parts = pathname
    .split("/")
    .filter(Boolean);

  if (!parts.length) {
    return `/${slug}`;
  }

  parts[parts.length - 1] = slug;

  return `/${parts.join("/")}`;
}

/* =========================================================
   PAYMENT GATEWAY CREATE
========================================================= */

export function PaymentGatewayCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    apiName: "",
    apiUrl: "",
    apiKey: "",
    apiStatus: "",
    charge: "",
  });

  const [rowCount, setRowCount] =
    useState(1);

  const [params, setParams] = useState([
    {
      id: Date.now(),
      key: "",
      value: "",
    },
  ]);

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const addParamRows = () => {
    const count = Math.max(
      1,
      Number(rowCount) || 1
    );

    const newRows = Array.from(
      { length: count },
      (_, index) => ({
        id:
          Date.now() +
          index +
          Math.random(),
        key: "",
        value: "",
      })
    );

    setParams((prev) => [
      ...prev,
      ...newRows,
    ]);
  };

  const updateParam = (
    id,
    field,
    value
  ) => {
    setParams((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const removeParam = (id) => {
    setParams((prev) => {
      if (prev.length === 1) {
        return prev.map((row) =>
          row.id === id
            ? {
                ...row,
                key: "",
                value: "",
              }
            : row
        );
      }

      return prev.filter(
        (row) => row.id !== id
      );
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log({
      ...form,
      params,
    });
  };

  const goToList = () => {
    navigate(
      siblingPath(
        location.pathname,
        "payment-gateway-list"
      )
    );
  };

  return (
    <PageContainer>
      <Panel
        title="Payment gateway Create"
        action={
          <button
            type="button"
            onClick={goToList}
            className="btn btn-info btn-sm min-h-0 text-white"
          >
            Back to Payment gateway List
          </button>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-5"
        >
          <RequiredAlert />

          <div className="space-y-3 pt-1">
            {/* API NAME */}
            <div className="grid items-center gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
              <label className="text-sm font-bold">
                Api Name:
                <span className="text-red-500">
                  *
                </span>
              </label>

              <Input
                value={form.apiName}
                onChange={(e) =>
                  updateForm(
                    "apiName",
                    e.target.value
                  )
                }
                placeholder="Enter Api Name"
              />
            </div>

            {/* API URL */}
            <div className="grid items-center gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
              <label className="text-sm font-bold">
                Api URL:
                <span className="text-red-500">
                  *
                </span>
              </label>

              <Input
                value={form.apiUrl}
                onChange={(e) =>
                  updateForm(
                    "apiUrl",
                    e.target.value
                  )
                }
                placeholder="Enter  Api URL"
              />
            </div>

            {/* API KEY */}
            <div className="grid items-center gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
              <label className="text-sm font-bold">
                Api Key:
                <span className="text-red-500">
                  *
                </span>
              </label>

              <Input
                value={form.apiKey}
                onChange={(e) =>
                  updateForm(
                    "apiKey",
                    e.target.value
                  )
                }
                placeholder="Enter  Api Key"
              />
            </div>

            {/* API PARAM */}
            <div className="grid gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
              <div />

              <div className="overflow-hidden rounded-md shadow-sm">
                <div
                  className={`${BLUE} flex items-center justify-between px-5 py-2 text-white`}
                >
                  <h3 className="text-lg font-bold">
                    Api Param
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
                      onClick={addParamRows}
                      className="btn btn-info btn-sm join-item min-h-0 rounded-none text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="bg-white p-5">
                  <div className="overflow-x-auto">
                    <table className="table table-xs min-w-[650px] border border-base-300">
                      <thead>
                        <tr>
                          <th className="border border-base-300">
                            Api Key{" "}
                            <span className="text-red-500">
                              *
                            </span>
                          </th>

                          <th className="border border-base-300">
                            Api Value{" "}
                            <span className="text-red-500">
                              *
                            </span>
                          </th>

                          <th className="w-28 border border-base-300">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {params.map(
                          (row) => (
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
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeParam(
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

            {/* API STATUS */}
            <div className="grid items-center gap-3 pt-1 lg:grid-cols-[250px_minmax(0,1fr)]">
              <label className="text-sm font-bold">
                Api Status:
              </label>

              <Select
                value={form.apiStatus}
                onChange={(e) =>
                  updateForm(
                    "apiStatus",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Status
                </option>
                <option value="Active">
                  Active
                </option>
                <option value="Inactive">
                  Inactive
                </option>
              </Select>
            </div>

            {/* CHARGE */}
            <div className="grid items-center gap-3 lg:grid-cols-[250px_minmax(0,1fr)]">
              <label className="text-sm font-bold">
                Charge (Per 100tk
                amount):
              </label>

              <Input
                type="number"
                step="0.01"
                value={form.charge}
                onChange={(e) =>
                  updateForm(
                    "charge",
                    e.target.value
                  )
                }
                placeholder="Enter charge per 100 tk"
              />
            </div>

            <div className="grid lg:grid-cols-[250px_minmax(0,1fr)]">
              <div />

              <div className="pt-1">
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
          </div>
        </form>
      </Panel>
    </PageContainer>
  );
}

/* =========================================================
   PAYMENT GATEWAY LIST
========================================================= */

const initialGateways = [
  {
    id: 1,
    apiName: "Surjopay",
    baseUrl:
      "https://engine.shurjopayment.com",
    status: "Active",
    charge: "1.6",
    apiType: "Live",
    createdBy: "Ismail Hossain",
    createdDate:
      "01-09-2025 06:48:56",
  },
  {
    id: 2,
    apiName: "Surjopay Sandbox",
    baseUrl:
      "https://sandbox.shurjopayment.com",
    status: "Active",
    charge: "1.6",
    apiType: "Sandbox",
    createdBy: "Ismail Hossain",
    createdDate:
      "01-09-2025 06:48:56",
  },
  {
    id: 3,
    apiName: "Bkash",
    baseUrl:
      "https://tokenized.pay.bka.sh/v1.2.0-beta",
    status: "Active",
    charge: "1.8",
    apiType: "Live",
    createdBy: "Ismail Hossain",
    createdDate:
      "01-09-2025 06:18:56",
  },
  {
    id: 4,
    apiName: "Bkash Sandbox",
    baseUrl:
      "https://tokenized.pay.bka.sh/v1.2.0-beta",
    status: "Active",
    charge: "1.8",
    apiType: "Sandbox",
    createdBy: "Ismail Hossain",
    createdDate:
      "01-09-2025 06:18:56",
  },
];

export function PaymentGatewayListPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [gateways, setGateways] =
    useState(initialGateways);

  const goToCreate = () => {
    navigate(
      siblingPath(
        location.pathname,
        "payment-gateway-create"
      )
    );
  };

  const handleEdit = (gateway) => {
    navigate(
      siblingPath(
        location.pathname,
        "payment-gateway-create"
      ),
      {
        state: {
          gateway,
        },
      }
    );
  };

  const handleDelete = (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this payment gateway?"
      );

    if (!confirmed) return;

    setGateways((prev) =>
      prev.filter(
        (gateway) =>
          gateway.id !== id
      )
    );
  };

  const handleHistory = (gateway) => {
    console.log(
      "Gateway history:",
      gateway
    );
  };

  return (
    <PageContainer>
      <Panel
        title="Payment gateway List"
        action={
          <button
            type="button"
            onClick={goToCreate}
            className="btn btn-info btn-sm min-h-0 text-white"
          >
            Create Payment gateway
          </button>
        }
      >
        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="table table-xs w-full min-w-[1050px] border border-base-300">
              <thead>
                <tr>
                  <th className="w-8 border border-base-300">
                    #
                  </th>

                  <th className="border border-base-300">
                    Api Name
                  </th>

                  <th className="border border-base-300">
                    Base URL
                  </th>

                  <th className="border border-base-300">
                    Status
                  </th>

                  <th className="border border-base-300">
                    Charge
                  </th>

                  <th className="border border-base-300">
                    Api Type
                  </th>

                  <th className="border border-base-300">
                    Created By
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
                {gateways.map(
                  (gateway, index) => (
                    <motion.tr
                      key={gateway.id}
                      layout
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      className={
                        index % 2 === 0
                          ? "bg-[#f1f1f1]"
                          : "bg-white"
                      }
                    >
                      <td className="border border-base-300">
                        {index + 1}
                      </td>

                      <td className="border border-base-300">
                        {
                          gateway.apiName
                        }
                      </td>

                      <td className="border border-base-300">
                        {
                          gateway.baseUrl
                        }
                      </td>

                      <td className="border border-base-300">
                        {
                          gateway.status
                        }
                      </td>

                      <td className="border border-base-300">
                        {
                          gateway.charge
                        }
                      </td>

                      <td className="border border-base-300">
                        {
                          gateway.apiType
                        }
                      </td>

                      <td className="border border-base-300">
                        {
                          gateway.createdBy
                        }
                      </td>

                      <td className="border border-base-300">
                        {
                          gateway.createdDate
                        }
                      </td>

                      <td className="border border-base-300">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              handleEdit(
                                gateway
                              )
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
                                gateway.id
                              )
                            }
                            className="btn btn-error btn-square btn-sm h-8 min-h-8 w-8 text-white"
                          >
                            <Trash2
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            title="History"
                            onClick={() =>
                              handleHistory(
                                gateway
                              )
                            }
                            className="btn btn-neutral btn-square btn-sm h-8 min-h-8 w-8 text-white"
                          >
                            <History
                              size={15}
                            />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                )}

                {gateways.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="border border-base-300 py-6 text-center"
                    >
                      No payment gateway
                      data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>
    </PageContainer>
  );
}