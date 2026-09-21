import { useState } from "react";
import {
  CheckCircle2,
  Link2Off,
  Save,
} from "lucide-react";
import { UserManagementNav } from "./UserManagementDashboard.jsx";

import "./../styles/studentManagement.css";


const STORAGE_KEY = "expertOtherUsersRFID";


/* =========================================================
   DEMO USERS
   Based on the supplied admin screenshot
========================================================= */

const users = [
  {
    id: "900006",
    name: "Ismail Hossain",
  },

  {
    id: "900005",
    name: "পাঠশালা স্কুল এন্ড কলেজ",
  },

  {
    id: "900004",
    name: "Super Admin",
  },

  {
    id: "900001",
    name: "Expert Coaching Center",
  },
];


/* =========================================================
   STORAGE
========================================================= */

function loadRFIDValues() {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    return saved
      ? JSON.parse(saved)
      : {};
  } catch {
    return {};
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
   OTHER USERS RFID PAGE
========================================================= */

export default function OtherUsersRFIDPage() {
  const [rfidValues, setRfidValues] =
    useState(loadRFIDValues);

  const [message, setMessage] =
    useState("");


  /* =======================================================
     RFID CHANGE
  ======================================================= */

  const handleChange = (
    userId,
    value
  ) => {
    setMessage("");

    setRfidValues((previous) => ({
      ...previous,
      [userId]: value,
    }));
  };


  /* =======================================================
     CLEAR RFID
  ======================================================= */

  const clearRFID = (userId) => {
    setMessage("");

    setRfidValues((previous) => ({
      ...previous,
      [userId]: "",
    }));
  };


  /* =======================================================
     SAVE
  ======================================================= */

  const handleSubmit = () => {
    const cleaned = {};

    Object.entries(
      rfidValues
    ).forEach(([id, value]) => {
      const rfid =
        String(value || "").trim();

      if (rfid) {
        cleaned[id] = rfid;
      }
    });


    /* Prevent duplicate RFID numbers */

    const assignedRFIDs =
      Object.values(cleaned);

    const duplicate =
      assignedRFIDs.find(
        (rfid, index) =>
          assignedRFIDs.indexOf(
            rfid
          ) !== index
      );

    if (duplicate) {
      alert(
        `RFID "${duplicate}" is assigned more than once.`
      );

      return;
    }


    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cleaned)
    );

    setRfidValues(cleaned);

    setMessage(
      "Other user RFID information saved successfully."
    );
  };


  return (
    <div className="student-admin-page">
      <UserManagementNav />

      <Panel
        title="Users List"
        action={
          <button
            type="button"
            className="student-btn student-btn-success"
            onClick={handleSubmit}
          >
            <Save size={15} />

            Submit
          </button>
        }
      >

        {/* SUCCESS */}

        {message && (
          <div className="rfid-success-message">
            <CheckCircle2
              size={17}
            />

            {message}
          </div>
        )}


        {/* TABLE */}

        <div className="rfid-table-wrap">
          <table className="rfid-table other-users-rfid-table">

            <thead>
              <tr>
                <th>SL.</th>

                <th>ID</th>

                <th>
                  User Name
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
              {users.map(
                (user, index) => (
                  <tr key={user.id}>

                    {/* SERIAL */}

                    <td>
                      {index + 1}
                    </td>


                    {/* ID */}

                    <td>
                      {user.id}
                    </td>


                    {/* USER */}

                    <td>
                      {user.name}
                    </td>


                    {/* RFID */}

                    <td>
                      <input
                        type="text"
                        value={
                          rfidValues[
                            user.id
                          ] || ""
                        }
                        onChange={(
                          event
                        ) =>
                          handleChange(
                            user.id,
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
                            user.id
                          )
                        }
                        title="Remove RFID"
                        aria-label={`Remove RFID from ${user.name}`}
                      >
                        <Link2Off
                          size={16}
                        />
                      </button>
                    </td>

                  </tr>
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
            onClick={handleSubmit}
          >
            <Save size={15} />

            Submit
          </button>
        </div>

      </Panel>

    </div>
  );
}
