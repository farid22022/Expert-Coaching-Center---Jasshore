import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Link2Off,
  Save,
} from "lucide-react";
import { UserManagementNav } from "./UserManagementDashboard.jsx";

import "./../styles/studentManagement.css";


/* =========================================================
   STORAGE
========================================================= */

const RFID_STORAGE_KEY = "expertTeacherEmployeeRFID";

const demoTeachers = [
  {
    id: "201702",
    name: "K M ABDULLAH",
    designation: "TEACHER",
    type: "Teacher",
  },
  {
    id: "201703",
    name: "Rasel mahmud",
    designation: "TEACHER",
    type: "Teacher",
  },
  {
    id: "201704",
    name: "MD NAIMUR RAHMAN",
    designation: "TEACHER",
    type: "Teacher",
  },
  {
    id: "201705",
    name: "MD ASHIQ",
    designation: "TEACHER",
    type: "Teacher",
  },
  {
    id: "201706",
    name: "UZZAL KUMAR",
    designation: "TEACHER",
    type: "Teacher",
  },
  {
    id: "201707",
    name: "MASUL BILLAH",
    designation: "TEACHER",
    type: "Teacher",
  },
  {
    id: "201708",
    name: "MD ALAMIN",
    designation: "TEACHER",
    type: "Teacher",
  },
  {
    id: "201709",
    name: "MD NAIMUR RAHMAN",
    designation: "TEACHER",
    type: "Teacher",
  },
  {
    id: "201710",
    name: "RASEL AHMED",
    designation: "TEACHER",
    type: "Teacher",
  },
];


/* =========================================================
   HELPERS
========================================================= */

function loadSavedRFID() {
  try {
    const saved =
      localStorage.getItem(
        RFID_STORAGE_KEY
      );

    return saved
      ? JSON.parse(saved)
      : {};
  } catch {
    return {};
  }
}


function getEmployeesFromStorage() {
  try {
    const saved =
      localStorage.getItem(
        "expertDemoEmployees"
      );

    if (!saved) {
      return [];
    }

    const employees =
      JSON.parse(saved);

    return employees
      .filter(
        (employee) =>
          !employee.disabled
      )
      .map((employee) => ({
        id:
          employee.employeeId ||
          employee.id,

        name: employee.name,

        designation:
          employee.designation ||
          "EMPLOYEE",

        type: "Employee",
      }));
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

export default function TeacherEmployeeRFIDPage() {
  const [rfidValues, setRfidValues] =
    useState(loadSavedRFID);

  const [savedMessage, setSavedMessage] =
    useState("");

  /*
   * Include the screenshot teacher list and
   * any demo employees created through the
   * Employee Management section.
   */
  const people = useMemo(() => {
    const employees =
      getEmployeesFromStorage();

    return [
      ...demoTeachers,
      ...employees,
    ];
  }, []);


  /* =======================================================
     CHANGE RFID
  ======================================================= */

  const handleRFIDChange = (
    id,
    value
  ) => {
    setSavedMessage("");

    setRfidValues((previous) => ({
      ...previous,
      [id]: value,
    }));
  };


  /* =======================================================
     REMOVE RFID
  ======================================================= */

  const clearRFID = (id) => {
    setRfidValues((previous) => ({
      ...previous,
      [id]: "",
    }));

    setSavedMessage("");
  };


  /* =======================================================
     SAVE
  ======================================================= */

  const saveRFIDs = () => {
    const cleaned = {};

    Object.entries(
      rfidValues
    ).forEach(([id, value]) => {
      const trimmed =
        String(value || "").trim();

      if (trimmed) {
        cleaned[id] = trimmed;
      }
    });


    /*
     * Optional validation:
     * prevent assigning the same RFID
     * number to multiple people.
     */

    const values =
      Object.values(cleaned);

    const duplicates =
      values.filter(
        (value, index) =>
          values.indexOf(value) !==
          index
      );

    if (duplicates.length) {
      alert(
        "Duplicate RFID numbers are not allowed."
      );
      return;
    }


    localStorage.setItem(
      RFID_STORAGE_KEY,
      JSON.stringify(cleaned)
    );

    setRfidValues(cleaned);

    setSavedMessage(
      "RFID information saved successfully."
    );
  };


  return (
    <div className="student-admin-page">
      <UserManagementNav />

      <Panel
        title="Teacher / Employee RFID"
        action={
          <button
            type="button"
            className="student-btn student-btn-success"
            onClick={saveRFIDs}
          >
            <Save size={15} />

            Submit
          </button>
        }
      >

        {/* SUCCESS MESSAGE */}

        {savedMessage && (
          <div className="rfid-success-message">
            <CheckCircle2
              size={17}
            />

            {savedMessage}
          </div>
        )}


        {/* TABLE */}

        <div className="rfid-table-wrap">
          <table className="rfid-table">
            <thead>
              <tr>
                <th>SL.</th>

                <th>ID</th>

                <th>
                  Teacher/Employee Name
                </th>

                <th>
                  Designation
                </th>

                <th>
                  RFID No.
                </th>

                <th>
                  Action
                </th>
              </tr>
            </thead>


            <tbody>
              {people.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="rfid-empty"
                  >
                    No teacher or
                    employee found.
                  </td>
                </tr>
              ) : (
                people.map(
                  (person, index) => (
                    <tr
                      key={`${person.type}-${person.id}-${index}`}
                    >
                      {/* SL */}

                      <td>
                        {index + 1}
                      </td>


                      {/* ID */}

                      <td>
                        {person.id}
                      </td>


                      {/* NAME */}

                      <td>
                        <div className="rfid-person-name">
                          <strong>
                            {
                              person.name
                            }
                          </strong>

                          <small>
                            {
                              person.type
                            }
                          </small>
                        </div>
                      </td>


                      {/* DESIGNATION */}

                      <td>
                        {
                          person.designation
                        }
                      </td>


                      {/* RFID */}

                      <td>
                        <input
                          type="text"
                          value={
                            rfidValues[
                              person.id
                            ] || ""
                          }
                          onChange={(
                            event
                          ) =>
                            handleRFIDChange(
                              person.id,
                              event
                                .target
                                .value
                            )
                          }
                          className="rfid-input"
                          placeholder="Enter RFID number"
                          autoComplete="off"
                        />
                      </td>


                      {/* ACTION */}

                      <td>
                        <button
                          type="button"
                          className="rfid-remove-button"
                          onClick={() =>
                            clearRFID(
                              person.id
                            )
                          }
                          title="Remove RFID"
                          aria-label={`Remove RFID from ${person.name}`}
                        >
                          <Link2Off
                            size={16}
                          />
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>


        {/* BOTTOM SUBMIT */}

        <div className="rfid-bottom-action">
          <button
            type="button"
            className="student-btn student-btn-success"
            onClick={saveRFIDs}
          >
            <Save size={15} />

            Submit
          </button>
        </div>

      </Panel>

    </div>
  );
}
