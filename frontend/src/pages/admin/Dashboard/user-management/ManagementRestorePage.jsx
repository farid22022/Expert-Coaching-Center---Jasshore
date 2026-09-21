import { useMemo, useState } from "react";
import {
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { UserManagementNav } from "./UserManagementDashboard.jsx";

import "./../styles/studentManagement.css";


/* =========================================================
   STORAGE KEYS
========================================================= */

const MANAGEMENT_STORAGE_KEY =
  "expertDemoManagementUsers";

const DISABLED_STORAGE_KEY =
  "expertDisabledManagementUsers";


/* =========================================================
   STORAGE HELPERS
========================================================= */

function loadManagementUsers() {
  try {
    const saved =
      localStorage.getItem(
        MANAGEMENT_STORAGE_KEY
      );

    return saved
      ? JSON.parse(saved)
      : [];
  } catch {
    return [];
  }
}

function loadDisabledUsers() {
  try {
    const saved =
      localStorage.getItem(
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

export default function ManagementRestorePage() {
  const [disabledUsers, setDisabledUsers] =
    useState(loadDisabledUsers);

  const [selected, setSelected] =
    useState([]);

  const [message, setMessage] =
    useState("");


  const allSelected =
    disabledUsers.length > 0 &&
    selected.length ===
      disabledUsers.length;


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
        disabledUsers.map(
          (person) => person.id
        )
      );

      return;
    }

    setSelected([]);
  };


  /* =======================================================
     RESTORE
  ======================================================= */

  const handleRestore = () => {
    if (!selected.length) {
      alert(
        "Please select at least one management user."
      );
      return;
    }


    const usersToRestore =
      disabledUsers.filter(
        (person) =>
          selected.includes(
            person.id
          )
      );


    const remainingDisabled =
      disabledUsers.filter(
        (person) =>
          !selected.includes(
            person.id
          )
      );


    const currentManagement =
      loadManagementUsers();


    /*
      Remove disable-only fields before
      pushing back to active management.
    */

    const restoredUsers =
      usersToRestore.map(
        ({
          disabledAt,
          remarks,
          ...person
        }) => person
      );


    /*
      Prevent duplicates in case a record
      already exists in active management.
    */

    const existingIds =
      new Set(
        currentManagement.map(
          (person) => person.id
        )
      );


    const mergedManagement = [
      ...currentManagement,
      ...restoredUsers.filter(
        (person) =>
          !existingIds.has(
            person.id
          )
      ),
    ];


    localStorage.setItem(
      MANAGEMENT_STORAGE_KEY,
      JSON.stringify(
        mergedManagement
      )
    );


    localStorage.setItem(
      DISABLED_STORAGE_KEY,
      JSON.stringify(
        remainingDisabled
      )
    );


    setDisabledUsers(
      remainingDisabled
    );

    setSelected([]);

    setMessage(
      `${usersToRestore.length} management user(s) restored successfully.`
    );
  };


  return (
    <div className="student-admin-page">
      <UserManagementNav />

      <Panel
        title="Admin Restore List"
        action={
          <button
            type="button"
            className="student-btn student-btn-success"
            onClick={
              handleRestore
            }
          >
            <RotateCcw size={15} />
            Submit
          </button>
        }
      >

        {/* SUCCESS */}

        {message && (
          <div className="management-restore-success">
            <CheckCircle2
              size={17}
            />

            <span>
              {message}
            </span>
          </div>
        )}


        {/* TABLE */}

        <div className="management-restore-table-wrap">
          <table className="management-restore-table">

            <thead>
              <tr>
                <th className="management-restore-check-column">
                  <label className="management-restore-check-all">
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

                <th>
                  Disabled At
                </th>

                <th>
                  Remarks
                </th>
              </tr>
            </thead>


            <tbody>
              {disabledUsers.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="management-restore-empty"
                  >
                    No disabled
                    management user
                    available.
                  </td>
                </tr>
              ) : (
                disabledUsers.map(
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
                        {
                          person.name
                        }
                      </td>


                      <td>
                        {
                          person.roleName ||
                          person.designation ||
                          "Management"
                        }
                      </td>


                      <td>
                        {
                          person.disabledAt
                        }
                      </td>


                      <td>
                        {
                          person.remarks ||
                          "-"
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

        {disabledUsers.length > 0 && (
          <div className="management-restore-bottom-action">
            <button
              type="button"
              className="student-btn student-btn-success"
              onClick={
                handleRestore
              }
            >
              <RotateCcw
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
