import { useMemo, useState } from "react";
import {
  FileText,
  Palette,
  Printer,
  Search,
} from "lucide-react";
import { UserManagementNav } from "./UserManagementDashboard.jsx";

import "./../styles/studentManagement.css";

const sessions = [
  "2026",
  "2025",
  "2024",
];

const shifts = [
  "Morning",
  "Day",
  "Evening",
];

const classes = [
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "HSC 1st Year",
  "HSC 2nd Year",
];

const sections = [
  "A",
  "B",
  "C",
];

const templates = [
  "Vertical 1",
  "Vertical 2",
  "Horizontal 1",
  "Horizontal 2",
];

const templateSides = [
  "Both Side",
  "Front Side",
  "Back Side",
];

const layouts = [
  "Portrait",
  "Landscape",
];

const demoStudents = [
  {
    id: "STU-2026-001",
    name: "Fahim Hasan",
    roll: "01",
    session: "2026",
    shift: "Morning",
    className: "Nine",
    section: "A",
    group: "Science",
    photo:
      "https://placehold.co/180x210/e8f2ee/173d33?text=FH",
    bloodGroup: "B+",
    phone: "01711000001",
  },

  {
    id: "STU-2026-002",
    name: "Ayesha Rahman",
    roll: "02",
    session: "2026",
    shift: "Morning",
    className: "Nine",
    section: "A",
    group: "Science",
    photo:
      "https://placehold.co/180x210/e8f2ee/173d33?text=AR",
    bloodGroup: "A+",
    phone: "01711000002",
  },

  {
    id: "STU-2026-003",
    name: "Nusrat Jahan",
    roll: "03",
    session: "2026",
    shift: "Day",
    className: "Ten",
    section: "B",
    group: "Humanities",
    photo:
      "https://placehold.co/180x210/e8f2ee/173d33?text=NJ",
    bloodGroup: "O+",
    phone: "01711000003",
  },
];


/* =========================================================
   PANEL
========================================================= */

function Panel({
  title,
  children,
}) {
  return (
    <section className="student-panel">
      <div className="student-panel-title">
        <span>{title}</span>
      </div>

      <div className="student-panel-body">
        {children}
      </div>
    </section>
  );
}


/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  children,
}) {
  return (
    <div className="student-field">
      <label>{label}</label>

      {children}
    </div>
  );
}


/* =========================================================
   SELECT
========================================================= */

function Select({
  name,
  value,
  onChange,
  options,
  placeholder,
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="student-input"
    >
      {placeholder && (
        <option value="">
          {placeholder}
        </option>
      )}

      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  );
}


/* =========================================================
   PAGE
========================================================= */

export default function StudentIdCardPage() {
  const [form, setForm] =
    useState({
      session: "2026",
      shift: "",
      className: "",
      section: "",
      roll: "",
      studentId: "",

      template: "Vertical 1",
      templateSide: "Both Side",
      layout: "Portrait",

      issueDate: "2026-01-01",
      expireDate: "2026-12-31",
    });

  const [searched, setSearched] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =======================================================
     FILTER STUDENTS
  ======================================================= */

  const results = useMemo(() => {
    if (!searched) {
      return [];
    }

    return demoStudents.filter(
      (student) => {
        if (
          form.session &&
          student.session !==
            form.session
        ) {
          return false;
        }

        if (
          form.shift &&
          student.shift !== form.shift
        ) {
          return false;
        }

        if (
          form.className &&
          student.className !==
            form.className
        ) {
          return false;
        }

        if (
          form.section &&
          student.section !==
            form.section
        ) {
          return false;
        }

        if (
          form.roll &&
          student.roll !==
            form.roll.trim()
        ) {
          return false;
        }

        if (
          form.studentId &&
          !student.id
            .toLowerCase()
            .includes(
              form.studentId
                .trim()
                .toLowerCase()
            )
        ) {
          return false;
        }

        return true;
      }
    );
  }, [form, searched]);


  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    setSearched(true);
  };


  const handlePrint = () => {
    window.print();
  };


  const handlePdf = () => {
    /*
      Demo behaviour.

      Later replace this with jsPDF /
      backend-generated PDF.
    */

    window.print();
  };


  const handleDesignConfig = () => {
    localStorage.setItem(
      "studentIdCardConfig",
      JSON.stringify({
        template: form.template,
        templateSide:
          form.templateSide,
        layout: form.layout,
      })
    );

    alert(
      "ID card design configuration saved."
    );
  };


  return (
    <div className="student-admin-page">
      <UserManagementNav />

      <Panel title="Student ID Card">
        <form
          onSubmit={handleSearch}
        >
          <div className="student-search-grid student-id-card-search">

            {/* LEFT */}

            <Field label="Session Year:">
              <Select
                name="session"
                value={form.session}
                onChange={
                  handleChange
                }
                options={sessions}
              />
            </Field>


            {/* RIGHT */}

            <Field label="School Shift:">
              <Select
                name="shift"
                value={form.shift}
                onChange={
                  handleChange
                }
                options={shifts}
                placeholder="Select Shift"
              />
            </Field>


            <Field label="Class:">
              <Select
                name="className"
                value={
                  form.className
                }
                onChange={
                  handleChange
                }
                options={classes}
                placeholder="Select class"
              />
            </Field>


            <Field label="Section:">
              <Select
                name="section"
                value={form.section}
                onChange={
                  handleChange
                }
                options={sections}
                placeholder="Select Section"
              />
            </Field>


            <Field label="Roll:">
              <input
                type="text"
                name="roll"
                value={form.roll}
                onChange={
                  handleChange
                }
                placeholder="Enter roll"
                className="student-input"
              />
            </Field>


            <Field label="Student Id:">
              <input
                type="text"
                name="studentId"
                value={
                  form.studentId
                }
                onChange={
                  handleChange
                }
                placeholder="Enter Student ID"
                className="student-input"
              />
            </Field>


            <Field label="Template:">
              <Select
                name="template"
                value={
                  form.template
                }
                onChange={
                  handleChange
                }
                options={templates}
              />
            </Field>


            <Field label="Template Side:">
              <Select
                name="templateSide"
                value={
                  form.templateSide
                }
                onChange={
                  handleChange
                }
                options={
                  templateSides
                }
              />
            </Field>


            <Field label="Layout:">
              <Select
                name="layout"
                value={form.layout}
                onChange={
                  handleChange
                }
                options={layouts}
              />
            </Field>


            <Field label="Issue Date:">
              <input
                type="date"
                name="issueDate"
                value={
                  form.issueDate
                }
                onChange={
                  handleChange
                }
                className="student-input"
              />
            </Field>


            <Field label="Expire Date:">
              <input
                type="date"
                name="expireDate"
                value={
                  form.expireDate
                }
                onChange={
                  handleChange
                }
                className="student-input"
              />
            </Field>

          </div>


          {/* ACTIONS */}

          <div className="student-action-row student-id-card-actions">
            <button
              type="submit"
              className="student-btn student-btn-secondary"
            >
              <Search size={15} />
              Search
            </button>

            <button
              type="button"
              className="student-btn student-btn-success"
              onClick={handlePrint}
            >
              <Printer size={15} />
              Print
            </button>

            <button
              type="button"
              className="student-btn student-btn-blue"
              onClick={handlePdf}
            >
              <FileText size={15} />
              PDF
            </button>

            <button
              type="button"
              className="student-btn student-btn-muted"
              onClick={
                handleDesignConfig
              }
            >
              <Palette size={15} />
              Design & Config
            </button>
          </div>
        </form>
      </Panel>


      {/* =====================================================
          SEARCH RESULT
      ===================================================== */}

      {searched && (
        <Panel title="Student ID Card Preview">
          {results.length === 0 ? (
            <div className="student-id-card-empty">
              No student found using
              the selected criteria.
            </div>
          ) : (
            <div className="student-id-card-grid">
              {results.map(
                (student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    form={form}
                  />
                )
              )}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}


/* =========================================================
   ID CARD PREVIEW
========================================================= */

function StudentCard({
  student,
  form,
}) {
  return (
    <article
      className={`student-id-preview ${
        form.layout ===
        "Landscape"
          ? "landscape"
          : ""
      }`}
    >
      <div className="student-id-preview-header">
        <img
          src="/jasshoreExpert.png"
          alt="Expert Coaching Center"
        />

        <div>
          <strong>
            EXPERT COACHING CENTER
          </strong>

          <small>
            Jashore, Bangladesh
          </small>
        </div>
      </div>


      <div className="student-id-title">
        STUDENT ID CARD
      </div>


      <div className="student-id-photo">
        <img
          src={student.photo}
          alt={student.name}
        />
      </div>


      <h3>{student.name}</h3>


      <div className="student-id-info">
        <div>
          <span>Student ID</span>
          <strong>
            {student.id}
          </strong>
        </div>

        <div>
          <span>Class</span>
          <strong>
            {student.className}
          </strong>
        </div>

        <div>
          <span>Roll</span>
          <strong>
            {student.roll}
          </strong>
        </div>

        <div>
          <span>Section</span>
          <strong>
            {student.section}
          </strong>
        </div>

        <div>
          <span>Group</span>
          <strong>
            {student.group}
          </strong>
        </div>

        <div>
          <span>Session</span>
          <strong>
            {student.session}
          </strong>
        </div>
      </div>


      <div className="student-id-validity">
        Valid:
        {" "}
        {form.issueDate}
        {" — "}
        {form.expireDate}
      </div>
    </article>
  );
}
