import { useMemo, useState } from "react";
import {
  CheckCircle2,
  PowerOff,
} from "lucide-react";
import { UserManagementNav } from "./UserManagementDashboard.jsx";

import "./../styles/studentManagement.css";


/* =========================================================
   STORAGE
========================================================= */

const MANAGEMENT_STORAGE_KEY =
  "expertDemoManagementUsers";

const DISABLED_STORAGE_KEY =
  "expertDisabledManagementUsers";


/* =========================================================
   FALLBACK DEMO MANAGEMENT USERS
========================================================= */

const fallbackManagementUsers = [
  {
    id: "MGT-001",
    adminId: "900101",
    name: "Academic Coordinator",
    designation: "Academic Coordinator",
    roleName: "Management",
    mobile: "01712000001",
    email: "academic@example.com",
    address: "Jashore, Bangladesh",
  },

  {
    id: "MGT-002",
    adminId: "900102",
    name: "Office Administrator",
    designation: "Administrator",
    roleName: "Administrator",
    mobile: "01712000002",
    email: "admin.office@example.com",
    address: "Jashore, Bangladesh",
  },

  {
    id: "MGT-003",
    adminId: "900103",
    name: "Accounts Manager",
    designation: "Accounts Manager",
    roleName: "Accounts",
    mobile: "01712000003",
    email: "accounts@example.com",
    address: "Jashore, Bangladesh",
  },
];


/* =========================================================
   LOAD MANAGEMENT
========================================================= */

function loadManagementUsers() {
  try {
    const saved = localStorage.getItem(
      MANAGEMENT_STORAGE_KEY
    );

    if (!saved) {
      return fallbackManagementUsers;
    }

    const parsed = JSON.parse(saved);

    return parsed.map((person, index) => ({
      ...person,

      adminId:
        person.adminId ||
        `900${String(index + 101).padStart(
          3,
          "0"
        )}`,

      roleName:
        person.roleName ||
        person.designation ||
        "Management",
    }));
  } catch {
    return fallbackManagementUsers;
  }
}


/* =========================================================
   LOAD DISABLED
========================================================= */

function loadDisabledUsers() {
  try {
    const saved = localStorage.getItem(
      DISABLED_STORAGE_KEY
    );

    return saved
      ? JSON.parse(saved)
      : [];
  } catch {
    return [];
  }
}


/* =========================================================
   PANEL
========================================================= */

function Panel({
  title,
  action,
  children,
}) {
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


/* =========================================================
   PAGE
========================================================= */

export default function ManagementDisablePage() {
  const [managementUsers] = useState(
    loadManagementUsers
  );

  const [disabledUsers, setDisabledUsers] =
    useState(loadDisabledUsers);

  const [selected, setSelected] =
    useState([]);

  const [message, setMessage] =
    useState("");


  /* =======================================================
     ACTIVE MANAGEMENT USERS
  ======================================================= */

  const activeUsers = useMemo(() => {
    const disabledIds =
      new Set(
        disabledUsers.map(
          (person) => person.id
        )
      );

    return managementUsers.filter(
      (person) =>
        !disabledIds.has(person.id)
    );
  }, [
    managementUsers,
    disabledUsers,
  ]);


  /* =======================================================
     TOGGLE SINGLE
  ======================================================= */

  const toggleUser = (id) => {
    setMessage("");

    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter(
            (item) => item !== id
          )
        : [...previous, id]
    );
  };


  /* =======================================================
     TOGGLE ALL
  ======================================================= */

  const toggleAll = (checked) => {
    setMessage("");

    if (checked) {
      setSelected(
        activeUsers.map(
          (person) => person.id
        )
      );

      return;
    }

    setSelected([]);
  };


  /* =======================================================
     DISABLE
  ======================================================= */

  const handleDisable = () => {
    if (!selected.length) {
      alert(
        "Please select at least one management user."
      );

      return;
    }

    const now =
      new Date().toISOString();

    const selectedUsers =
      activeUsers
        .filter((person) =>
          selected.includes(
            person.id
          )
        )
        .map((person) => ({
          ...person,

          disabledAt: now,

          remarks:
            "Disabled from User Management",
        }));


    const updatedDisabled = [
      ...disabledUsers,
      ...selectedUsers,
    ];


    localStorage.setItem(
      DISABLED_STORAGE_KEY,
      JSON.stringify(
        updatedDisabled
      )
    );


    setDisabledUsers(
      updatedDisabled
    );

    setSelected([]);

    setMessage(
      `${selectedUsers.length} management user(s) disabled successfully.`
    );
  };


  const allSelected =
    activeUsers.length > 0 &&
    selected.length ===
      activeUsers.length;


  return (
    <div className="student-admin-page">
      <UserManagementNav />

      <Panel
        title="Admin Disable List"
        action={
          <button
            type="button"
            className="student-btn student-btn-success"
            onClick={
              handleDisable
            }
          >
            <PowerOff size={15} />

            Submit
          </button>
        }
      >

        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="management-disable-success">
            <CheckCircle2
              size={17}
            />

            <span>
              {message}
            </span>
          </div>
        )}


        {/* TABLE */}

        <div className="management-disable-table-wrap">

          <table className="management-disable-table">

            <thead>
              <tr>

                <th className="management-disable-check-column">
                  <label className="management-disable-check-all">
                    <input
                      type="checkbox"
                      checked={
                        allSelected
                      }
                      onChange={(
                        event
                      ) =>
                        toggleAll(
                          event.target
                            .checked
                        )
                      }
                    />

                    <span>#</span>
                  </label>
                </th>

                <th>
                  Admin ID
                </th>

                <th>
                  Full Name
                </th>

                <th>
                  Role Name
                </th>

              </tr>
            </thead>


            <tbody>
              {activeUsers.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="management-disable-empty"
                  >
                    No active
                    management user
                    available.
                  </td>
                </tr>
              ) : (
                activeUsers.map(
                  (person) => (
                    <tr
                      key={
                        person.id
                      }
                    >

                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(
                            person.id
                          )}
                          onChange={() =>
                            toggleUser(
                              person.id
                            )
                          }
                        />
                      </td>


                      <td>
                        <strong>
                          {
                            person.adminId
                          }
                        </strong>
                      </td>


                      <td>
                        {person.name}
                      </td>


                      <td>
                        {
                          person.roleName
                        }
                      </td>

                    </tr>
                  )
                )
              )}
            </tbody>

          </table>

        </div>


        {/* OPTIONAL BOTTOM SUBMIT */}

        {activeUsers.length > 0 && (
          <div className="management-disable-bottom-action">

            <button
              type="button"
              className="student-btn student-btn-success"
              onClick={
                handleDisable
              }
            >
              <PowerOff
                size={15}
              />

              Submit
            </button>

          </div>
        )}

      </Panel>

    </div>
  );
}
