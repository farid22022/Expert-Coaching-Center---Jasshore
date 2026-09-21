import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Download,
  FileSpreadsheet,
  Plus,
  Printer,
  Search,
  Upload,
  UserPlus,
} from "lucide-react";

import {
  bloodGroups,
  categories,
  classes,
  demoStudentBatches,
  districts,
  genders,
  groups,
  months,
  professions,
  religions,
  sections,
  sessions,
  shifts,
  upazilas,
} from "./../data/studentAdminData.js";
import { UserManagementNav } from "./UserManagementDashboard.jsx";

import "./../styles/studentManagement.css";


/* =========================================================
   COMMON COMPONENTS
========================================================= */

function Panel({
  title,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`student-panel ${className}`}
    >
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


function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div className="student-field">
      <label>
        {label}

        {required && (
          <span className="required-star">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}


function TextInput({
  placeholder = "",
  type = "text",
  value,
  onChange,
  name,
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="student-input"
    />
  );
}


function Select({
  options,
  placeholder = "Select",
  value,
  onChange,
  name,
}) {
  return (
    <select
      className="student-input"
      value={value}
      onChange={onChange}
      name={name}
    >
      <option value="">
        {placeholder}
      </option>

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


function CreateStudentButton() {
  return (
    <Link
      to="/dashboard/user-management/student/student-create"
      className="student-btn student-btn-secondary"
    >
      <UserPlus size={15} />
      Create Student
    </Link>
  );
}


function SearchButton({
  children = "Search",
}) {
  return (
    <button
      type="submit"
      className="student-btn student-btn-primary"
    >
      <Search size={15} />

      {children}
    </button>
  );
}


function SearchLayout({
  children,
}) {
  return (
    <div className="student-search-grid">
      {children}
    </div>
  );
}


/* =========================================================
   GENERIC FORM STATE
========================================================= */

const initialSearch = {
  session: "2026",
  shift: "",
  className: "",
  section: "",
  group: "",
  category: "",
  roll: "",
  studentId: "",
};


function useSearchForm() {
  const [form, setForm] =
    useState(initialSearch);

  const change = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  return {
    form,
    setForm,
    change,
  };
}


/* =========================================================
   STUDENT MODULE HOME
========================================================= */

export function StudentDashboard() {
  const items = [
    [
      "Student Create",
      "/dashboard/user-management/student/student-create",
    ],
    [
      "Waiver Student",
      "/dashboard/user-management/student/waiver-student",
    ],
    [
      "Student List",
      "/dashboard/user-management/student/student-list",
    ],
    [
      "Student Quick Entry",
      "/dashboard/user-management/student/student-quick-entry",
    ],
    [
      "Student Quick Excel Entry",
      "/dashboard/user-management/student/student-quick-excell-entry",
    ],
    [
      "Student Quick Update",
      "/dashboard/user-management/student/student-quick-update",
    ],
    [
      "Admission Update",
      "/dashboard/user-management/student/student-admission-update",
    ],
    [
      "Subject Assign",
      "/dashboard/user-management/student/student-subject-assign",
    ],
    [
      "Student Transfer",
      "/dashboard/user-management/student/student-transfer",
    ],
    [
      "Student RFID",
      "/dashboard/user-management/student/student-rfid",
    ],
    [
      "Student Info Excel Update",
      "/dashboard/user-management/student/student-info-excel-update",
    ],
    [
      "Student Details Excel Entry",
      "/dashboard/user-management/student/student-details-excel-entry",
    ],
  ];

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel title="Student Management">
        <div className="student-module-grid">
          {items.map(
            ([label, path], index) => (
              <Link
                key={path}
                to={path}
                className="student-module-card"
              >
                <span className="student-module-number">
                  {String(index + 1).padStart(
                    2,
                    "0"
                  )}
                </span>

                <strong>{label}</strong>
              </Link>
            )
          )}
        </div>
      </Panel>
    </div>
  );
}


/* =========================================================
   STUDENT CREATE
========================================================= */

const initialCreateStudent = {
  academicId: "",
  fullName: "",
  fullNameBn: "",
  bloodGroup: "",
  studentUid: "",
  contactNumber: "",
  email: "",
  password: "",

  dateOfBirth: "",
  birthPlace: "",
  birthCertificate: "",
  religion: "",
  gender: "",
  country: "Bangladesh",
  confirmPassword: "",
  tribal: "No",

  fatherName: "",
  fatherNameBn: "",
  fatherPhone: "",
  fatherNid: "",
  fatherDob: "",
  fatherProfession: "",

  motherName: "",
  motherNameBn: "",
  motherPhone: "",
  motherNid: "",
  motherDob: "",
  motherProfession: "",

  guardianName: "",
  guardianRelation: "",
  guardianPhone: "",

  division: "",
  district: "",
  upazila: "",
  municipality: "",
  postOffice: "",
  postalCode: "",
  ward: "",
  address: "",

  permanentDivision: "",
  permanentDistrict: "",
  permanentUpazila: "",
  permanentMunicipality: "",
  permanentPostOffice: "",
  permanentPostalCode: "",
  permanentWard: "",
  permanentAddress: "",

  category: "",
  session: "2026",
  shift: "",
  className: "",
  section: "",
  group: "",
  roll: "",
  version: "Bangla",
  registrationNo: "",
  admissionDate: "",
  oldNewStudent: "New",

  previousSchool: "",
  previousClass: "",
  previousRoll: "",
};


export function StudentCreate() {
  const [form, setForm] =
    useState(initialCreateStudent);

  const [sameAddress, setSameAddress] =
    useState(false);

  const change = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  const handleAddressCopy = (
    checked
  ) => {
    setSameAddress(checked);

    if (checked) {
      setForm((previous) => ({
        ...previous,

        permanentDivision:
          previous.division,

        permanentDistrict:
          previous.district,

        permanentUpazila:
          previous.upazila,

        permanentMunicipality:
          previous.municipality,

        permanentPostOffice:
          previous.postOffice,

        permanentPostalCode:
          previous.postalCode,

        permanentWard:
          previous.ward,

        permanentAddress:
          previous.address,
      }));
    }
  };


  const submit = (event) => {
    event.preventDefault();

    console.log(
      "Student Create:",
      form
    );

    alert(
      "Demo student successfully created."
    );
  };


  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Student Admission"
        action={
          <Link
            to="/dashboard/user-management/student/student-list"
            className="student-btn student-btn-secondary"
          >
            Back to Student List
          </Link>
        }
      >
        <div className="student-alert">
          (*) Field required
        </div>

        <form
          onSubmit={submit}
          className="student-create-form"
        >
          {/* Student Information */}

          <fieldset className="student-fieldset">
            <legend>
              Student Information
            </legend>

            <div className="student-create-columns">
              <div>
                <Field
                  label="Academic ID"
                  required
                >
                  <TextInput
                    name="academicId"
                    value={form.academicId}
                    onChange={change}
                    placeholder="Enter Student ID"
                  />
                </Field>

                <Field
                  label="Full Name"
                  required
                >
                  <TextInput
                    name="fullName"
                    value={form.fullName}
                    onChange={change}
                    placeholder="Enter Full Name"
                  />
                </Field>

                <Field label="Full Name (Bn)">
                  <TextInput
                    name="fullNameBn"
                    value={form.fullNameBn}
                    onChange={change}
                    placeholder="Enter Bengali Name"
                  />
                </Field>

                <Field label="Blood Group">
                  <Select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={change}
                    options={bloodGroups}
                    placeholder="Select Blood Group"
                  />
                </Field>

                <Field label="Student UID">
                  <TextInput
                    name="studentUid"
                    value={form.studentUid}
                    onChange={change}
                    placeholder="Enter Student UID"
                  />
                </Field>

                <Field label="Contact Number">
                  <TextInput
                    name="contactNumber"
                    value={
                      form.contactNumber
                    }
                    onChange={change}
                    placeholder="Enter Mobile"
                  />
                </Field>

                <Field label="Student Email">
                  <TextInput
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={change}
                    placeholder="Enter Email ID"
                  />
                </Field>

                <Field
                  label="Password"
                  required
                >
                  <TextInput
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={change}
                    placeholder="Enter password"
                  />
                </Field>
              </div>


              <div>
                <Field label="Date of Birth">
                  <TextInput
                    type="date"
                    name="dateOfBirth"
                    value={
                      form.dateOfBirth
                    }
                    onChange={change}
                  />
                </Field>

                <Field label="Birth Place">
                  <TextInput
                    name="birthPlace"
                    value={
                      form.birthPlace
                    }
                    onChange={change}
                    placeholder="According To Birth Certificate"
                  />
                </Field>

                <Field label="Birth Certificate No">
                  <TextInput
                    name="birthCertificate"
                    value={
                      form.birthCertificate
                    }
                    onChange={change}
                    placeholder="Enter Birth Certificate No"
                  />
                </Field>

                <Field
                  label="Religion"
                  required
                >
                  <Select
                    name="religion"
                    value={form.religion}
                    onChange={change}
                    options={religions}
                    placeholder="Select Religion"
                  />
                </Field>

                <Field
                  label="Gender"
                  required
                >
                  <Select
                    name="gender"
                    value={form.gender}
                    onChange={change}
                    options={genders}
                    placeholder="Select Gender"
                  />
                </Field>

                <Field label="Country">
                  <TextInput
                    name="country"
                    value={form.country}
                    onChange={change}
                  />
                </Field>

                <Field
                  label="Confirm Password"
                  required
                >
                  <TextInput
                    type="password"
                    name="confirmPassword"
                    value={
                      form.confirmPassword
                    }
                    onChange={change}
                    placeholder="Confirm Password"
                  />
                </Field>

                <Field label="Is Tribal?">
                  <div className="student-radio-row">
                    <label>
                      <input
                        type="radio"
                        name="tribal"
                        value="No"
                        checked={
                          form.tribal ===
                          "No"
                        }
                        onChange={change}
                      />
                      No
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="tribal"
                        value="Yes"
                        checked={
                          form.tribal ===
                          "Yes"
                        }
                        onChange={change}
                      />
                      Yes
                    </label>
                  </div>
                </Field>
              </div>
            </div>
          </fieldset>


          {/* Parent Information */}

          <fieldset className="student-fieldset">
            <legend>
              Parent Information
            </legend>

            <div className="student-create-columns">
              <div>
                <Field
                  label="Father Name"
                  required
                >
                  <TextInput
                    name="fatherName"
                    value={
                      form.fatherName
                    }
                    onChange={change}
                    placeholder="Enter Father Name"
                  />
                </Field>

                <Field label="Father Name (Bn)">
                  <TextInput
                    name="fatherNameBn"
                    value={
                      form.fatherNameBn
                    }
                    onChange={change}
                  />
                </Field>

                <Field
                  label="Father Mobile Number"
                  required
                >
                  <TextInput
                    name="fatherPhone"
                    value={
                      form.fatherPhone
                    }
                    onChange={change}
                    placeholder="Enter Father Mobile Number"
                  />
                </Field>

                <Field label="Father's NID">
                  <TextInput
                    name="fatherNid"
                    value={form.fatherNid}
                    onChange={change}
                    placeholder="Enter NID"
                  />
                </Field>

                <Field label="Father's DOB">
                  <TextInput
                    type="date"
                    name="fatherDob"
                    value={form.fatherDob}
                    onChange={change}
                  />
                </Field>

                <Field label="Father Profession">
                  <Select
                    name="fatherProfession"
                    value={
                      form.fatherProfession
                    }
                    onChange={change}
                    options={professions}
                    placeholder="Select Profession"
                  />
                </Field>
              </div>


              <div>
                <Field
                  label="Mother Name"
                  required
                >
                  <TextInput
                    name="motherName"
                    value={
                      form.motherName
                    }
                    onChange={change}
                    placeholder="Enter Mother Name"
                  />
                </Field>

                <Field label="Mother Name (Bn)">
                  <TextInput
                    name="motherNameBn"
                    value={
                      form.motherNameBn
                    }
                    onChange={change}
                  />
                </Field>

                <Field label="Mother Mobile Number">
                  <TextInput
                    name="motherPhone"
                    value={
                      form.motherPhone
                    }
                    onChange={change}
                  />
                </Field>

                <Field label="Mother's NID">
                  <TextInput
                    name="motherNid"
                    value={form.motherNid}
                    onChange={change}
                  />
                </Field>

                <Field label="Mother's DOB">
                  <TextInput
                    type="date"
                    name="motherDob"
                    value={form.motherDob}
                    onChange={change}
                  />
                </Field>

                <Field label="Mother Profession">
                  <Select
                    name="motherProfession"
                    value={
                      form.motherProfession
                    }
                    onChange={change}
                    options={professions}
                    placeholder="Select Profession"
                  />
                </Field>
              </div>
            </div>

            <div className="student-create-columns student-parent-extra">
              <div>
                <Field label="Guardian Name">
                  <TextInput
                    name="guardianName"
                    value={
                      form.guardianName
                    }
                    onChange={change}
                    placeholder="Enter Guardian Name"
                  />
                </Field>

                <Field label="Guardian Contact Number">
                  <TextInput
                    name="guardianPhone"
                    value={
                      form.guardianPhone
                    }
                    onChange={change}
                  />
                </Field>
              </div>

              <div>
                <Field label="Guardian Relation">
                  <TextInput
                    name="guardianRelation"
                    value={
                      form.guardianRelation
                    }
                    onChange={change}
                  />
                </Field>
              </div>
            </div>
          </fieldset>


          {/* Addresses */}

          <div className="student-create-columns">
            <fieldset className="student-fieldset">
              <legend>
                Living Address
              </legend>

              <AddressFields
                prefix=""
                form={form}
                change={change}
              />
            </fieldset>


            <fieldset className="student-fieldset">
              <legend>
                Permanent Address
              </legend>

              <label className="same-address-check">
                <input
                  type="checkbox"
                  checked={sameAddress}
                  onChange={(event) =>
                    handleAddressCopy(
                      event.target
                        .checked
                    )
                  }
                />

                Same as Living Address
              </label>

              <AddressFields
                prefix="permanent"
                form={form}
                change={change}
              />
            </fieldset>
          </div>


          {/* Class Information */}

          <fieldset className="student-fieldset">
            <legend>
              Class Information
            </legend>

            <div className="student-create-columns">
              <div>
                <Field label="Category">
                  <Select
                    name="category"
                    value={form.category}
                    onChange={change}
                    options={categories}
                    placeholder="Select Student Category"
                  />
                </Field>

                <Field label="Session Year">
                  <Select
                    name="session"
                    value={form.session}
                    onChange={change}
                    options={sessions}
                  />
                </Field>

                <Field label="Shift">
                  <Select
                    name="shift"
                    value={form.shift}
                    onChange={change}
                    options={shifts}
                    placeholder="Select Shift"
                  />
                </Field>

                <Field label="Class">
                  <Select
                    name="className"
                    value={
                      form.className
                    }
                    onChange={change}
                    options={classes}
                    placeholder="Select Class"
                  />
                </Field>

                <Field label="Section">
                  <Select
                    name="section"
                    value={form.section}
                    onChange={change}
                    options={sections}
                    placeholder="Select Section"
                  />
                </Field>

                <Field label="Group">
                  <Select
                    name="group"
                    value={form.group}
                    onChange={change}
                    options={groups}
                    placeholder="Select Group"
                  />
                </Field>

                <Field label="Roll">
                  <TextInput
                    name="roll"
                    value={form.roll}
                    onChange={change}
                    placeholder="Enter Roll Number"
                  />
                </Field>

                <Field label="Version">
                  <Select
                    name="version"
                    value={form.version}
                    onChange={change}
                    options={[
                      "Bangla",
                      "English",
                    ]}
                  />
                </Field>

                <Field label="Register No">
                  <TextInput
                    name="registrationNo"
                    value={
                      form.registrationNo
                    }
                    onChange={change}
                  />
                </Field>

                <Field label="Admission Date">
                  <TextInput
                    type="date"
                    name="admissionDate"
                    value={
                      form.admissionDate
                    }
                    onChange={change}
                  />
                </Field>

                <Field label="Old/New Student">
                  <Select
                    name="oldNewStudent"
                    value={
                      form.oldNewStudent
                    }
                    onChange={change}
                    options={[
                      "New",
                      "Old",
                    ]}
                  />
                </Field>
              </div>


              <div>
                <Field label="Student Image">
                  <input
                    type="file"
                    accept="image/*"
                    className="student-input"
                  />

                  <div className="student-image-preview">
                    No image selected
                  </div>
                </Field>
              </div>
            </div>
          </fieldset>


          {/* Previous school */}

          <fieldset className="student-fieldset">
            <legend>
              Previous School Information
            </legend>

            <div className="student-create-columns">
              <div>
                <Field label="School Name">
                  <TextInput
                    name="previousSchool"
                    value={
                      form.previousSchool
                    }
                    onChange={change}
                    placeholder="Enter Previous School Name"
                  />
                </Field>

                <Field label="Class">
                  <TextInput
                    name="previousClass"
                    value={
                      form.previousClass
                    }
                    onChange={change}
                    placeholder="Enter Previous Class"
                  />
                </Field>
              </div>

              <div>
                <Field label="Roll">
                  <TextInput
                    name="previousRoll"
                    value={
                      form.previousRoll
                    }
                    onChange={change}
                    placeholder="Enter Previous Roll"
                  />
                </Field>
              </div>
            </div>
          </fieldset>


          <div className="student-form-footer">
            <button
              type="submit"
              className="student-btn student-btn-success"
            >
              <Plus size={15} />
              Submit
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}


function AddressFields({
  prefix,
  form,
  change,
}) {
  const property = (name) =>
    prefix
      ? `${prefix}${name
          .charAt(0)
          .toUpperCase()}${name.slice(1)}`
      : name;

  return (
    <>
      <Field
        label="Division"
        required
      >
        <Select
          name={property("division")}
          value={
            form[property("division")]
          }
          onChange={change}
          options={[
            "Khulna",
            "Dhaka",
            "Rajshahi",
            "Chattogram",
          ]}
          placeholder="Select Division"
        />
      </Field>

      <Field
        label="District"
        required
      >
        <Select
          name={property("district")}
          value={
            form[property("district")]
          }
          onChange={change}
          options={districts}
          placeholder="Select District"
        />
      </Field>

      <Field
        label="Upazila"
        required
      >
        <Select
          name={property("upazila")}
          value={
            form[property("upazila")]
          }
          onChange={change}
          options={upazilas}
          placeholder="Select Upazila"
        />
      </Field>

      <Field label="Municipality / Union">
        <TextInput
          name={property(
            "municipality"
          )}
          value={
            form[
              property(
                "municipality"
              )
            ]
          }
          onChange={change}
          placeholder="Enter Municipality/Union Name"
        />
      </Field>

      <Field
        label="Post Office"
        required
      >
        <TextInput
          name={property("postOffice")}
          value={
            form[property("postOffice")]
          }
          onChange={change}
          placeholder="Enter Post Office"
        />
      </Field>

      <Field
        label="Postal Code"
        required
      >
        <TextInput
          name={property("postalCode")}
          value={
            form[property("postalCode")]
          }
          onChange={change}
          placeholder="Enter Postal Code"
        />
      </Field>

      <Field label="Ward No">
        <TextInput
          name={property("ward")}
          value={
            form[property("ward")]
          }
          onChange={change}
        />
      </Field>

      <Field
        label="Address"
        required
      >
        <TextInput
          name={property("address")}
          value={
            form[property("address")]
          }
          onChange={change}
          placeholder="Enter Address"
        />
      </Field>
    </>
  );
}


/* =========================================================
   WAIVER STUDENT
========================================================= */

export function WaiverStudent() {
  const { form, change } =
    useSearchForm();

  const [month, setMonth] =
    useState("September");

  const submit = (event) => {
    event.preventDefault();

    console.log({
      ...form,
      month,
    });
  };

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Waiver Student Search"
        action={<CreateStudentButton />}
      >
        <form onSubmit={submit}>
          <SearchLayout>
            <Field label="Session Year">
              <Select
                name="session"
                value={form.session}
                onChange={change}
                options={sessions}
              />
            </Field>

            <Field label="School Shift">
              <Select
                name="shift"
                value={form.shift}
                onChange={change}
                options={shifts}
                placeholder="Select Shift"
              />
            </Field>

            <Field label="Class">
              <Select
                name="className"
                value={form.className}
                onChange={change}
                options={classes}
                placeholder="Select class"
              />
            </Field>

            <Field label="Section">
              <Select
                name="section"
                value={form.section}
                onChange={change}
                options={sections}
                placeholder="Select Section"
              />
            </Field>

            <Field label="Groups">
              <Select
                name="group"
                value={form.group}
                onChange={change}
                options={groups}
                placeholder="Select Groups"
              />
            </Field>

            <Field label="Roll">
              <TextInput
                name="roll"
                value={form.roll}
                onChange={change}
                placeholder="Roll No"
              />
            </Field>

            <Field label="Month">
              <Select
                value={month}
                onChange={(event) =>
                  setMonth(
                    event.target.value
                  )
                }
                options={months}
              />
            </Field>

            <Field label="Student ID">
              <TextInput
                name="studentId"
                value={
                  form.studentId
                }
                onChange={change}
                placeholder="Enter Student ID"
              />
            </Field>
          </SearchLayout>

          <div className="student-action-row">
            <SearchButton />

            <button
              type="button"
              className="student-btn student-btn-purple"
            >
              <Printer size={14} />
              Print
            </button>

            <button
              type="button"
              className="student-btn student-btn-muted"
            >
              PDF
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Waiver Student">
        <div className="student-empty">
          Search to view waiver
          students.
        </div>
      </Panel>
    </div>
  );
}


/* =========================================================
   STUDENT LIST
========================================================= */

export function StudentList() {
  const { form, change } =
    useSearchForm();

  const [religion, setReligion] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [design, setDesign] =
    useState(
      "Serial, Roll, Student ID, Student Name, Photo, Gender"
    );

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel title="Student Search">
        <form
          onSubmit={(event) =>
            event.preventDefault()
          }
        >
          <SearchLayout>
            <Field label="Session Year">
              <Select
                name="session"
                value={form.session}
                onChange={change}
                options={sessions}
              />
            </Field>

            <Field label="School Shift">
              <Select
                name="shift"
                value={form.shift}
                onChange={change}
                options={shifts}
                placeholder="Select Shift"
              />
            </Field>

            <Field label="Class">
              <Select
                name="className"
                value={form.className}
                onChange={change}
                options={classes}
                placeholder="Select class"
              />
            </Field>

            <Field label="Section">
              <Select
                name="section"
                value={form.section}
                onChange={change}
                options={sections}
                placeholder="Select Section"
              />
            </Field>

            <Field label="Group">
              <Select
                name="group"
                value={form.group}
                onChange={change}
                options={groups}
                placeholder="Select Group"
              />
            </Field>

            <Field label="Design">
              <select
                className="student-input"
                value={design}
                onChange={(event) =>
                  setDesign(
                    event.target.value
                  )
                }
              >
                <option>
                  Serial, Roll, Student ID, Student Name, Photo, Gender
                </option>

                <option>
                  Roll, Name, Class, Section
                </option>

                <option>
                  Full Student Information
                </option>
              </select>
            </Field>

            <Field label="Student ID">
              <TextInput
                name="studentId"
                value={
                  form.studentId
                }
                onChange={change}
                placeholder="Student ID"
              />
            </Field>

            <Field label="Gender">
              <Select
                value={gender}
                onChange={(event) =>
                  setGender(
                    event.target.value
                  )
                }
                options={genders}
                placeholder="Select Gender"
              />
            </Field>

            <Field label="Religion">
              <Select
                value={religion}
                onChange={(event) =>
                  setReligion(
                    event.target.value
                  )
                }
                options={religions}
                placeholder="Select Religion"
              />
            </Field>
          </SearchLayout>

          <div className="student-action-row">
            <button
              type="button"
              className="student-btn student-btn-muted"
            >
              Custom Format
            </button>

            <SearchButton />

            <button
              type="button"
              className="student-btn student-btn-success"
            >
              <Printer size={14} />
              Print
            </button>

            <button
              type="button"
              className="student-btn student-btn-purple"
            >
              <Download size={14} />
              Download PDF
            </button>

            <button
              type="button"
              className="student-btn student-btn-blue"
            >
              CV Print
            </button>

            <button
              type="button"
              className="student-btn student-btn-muted"
            >
              <FileSpreadsheet
                size={14}
              />

              Download Excel
            </button>
          </div>
        </form>
      </Panel>


      <Panel title="Student List">
        <div className="student-action-row student-list-actions">
          <CreateStudentButton />

          <button className="student-btn student-btn-secondary">
            Download Form
          </button>

          <button className="student-btn student-btn-secondary">
            Excel System
          </button>

          <button className="student-btn student-btn-secondary">
            Student Transfer
          </button>
        </div>

        <h2 className="student-batch-heading">
          EXAM BATCH HSC 2026
        </h2>

        <div className="student-batch-grid">
          {demoStudentBatches.map(
            (batch) => (
              <article
                key={batch.id}
                className="student-batch-card"
              >
                <h3>
                  {batch.title}
                </h3>

                <strong>
                  Total: {batch.total}
                  {" | "}
                  Male: {batch.male}
                  {" | "}
                  Female:{" "}
                  {batch.female}
                </strong>
              </article>
            )
          )}
        </div>
      </Panel>
    </div>
  );
}


/* =========================================================
   QUICK ENTRY
========================================================= */

export function StudentQuickEntry() {
  const { form, change } =
    useSearchForm();

  const [studentIdFormat, setIdFormat] =
    useState("");

  const [number, setNumber] =
    useState("");

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Student Quick Entry"
        action={
          <Link
            to="/dashboard/user-management/student/student-list"
            className="student-btn student-btn-secondary"
          >
            Back to Student List
          </Link>
        }
      >
        <SearchLayout>
          <Field label="Session Year">
            <Select
              name="session"
              value={form.session}
              onChange={change}
              options={sessions}
            />
          </Field>

          <Field label="School Shift">
            <Select
              name="shift"
              value={form.shift}
              onChange={change}
              options={shifts}
              placeholder="Select Shift"
            />
          </Field>

          <Field label="Class">
            <Select
              name="className"
              value={form.className}
              onChange={change}
              options={classes}
              placeholder="Select class"
            />
          </Field>

          <Field label="Section">
            <Select
              name="section"
              value={form.section}
              onChange={change}
              options={sections}
              placeholder="Select Section"
            />
          </Field>

          <Field label="Group">
            <Select
              name="group"
              value={form.group}
              onChange={change}
              options={groups}
              placeholder="Select Group"
            />
          </Field>

          <Field label="Category">
            <Select
              name="category"
              value={form.category}
              onChange={change}
              options={categories}
              placeholder="Select Category"
            />
          </Field>

          <Field label="Student ID Format">
            <Select
              value={studentIdFormat}
              onChange={(event) =>
                setIdFormat(
                  event.target.value
                )
              }
              options={[
                "Auto ID",
                "Custom ID",
              ]}
              placeholder="Select Student ID"
            />
          </Field>

          <Field label="Student Number">
            <TextInput
              value={number}
              onChange={(event) =>
                setNumber(
                  event.target.value
                )
              }
            />
          </Field>
        </SearchLayout>

        <div className="student-action-row">
          <button className="student-btn student-btn-purple">
            <Plus size={15} />
            Add Student
          </button>
        </div>
      </Panel>
    </div>
  );
}


/* =========================================================
   QUICK EXCEL ENTRY
========================================================= */

export function StudentQuickExcelEntry() {
  const { form, change } =
    useSearchForm();

  const [idFormat, setIdFormat] =
    useState("");

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Student Quick Excell Entry"
        action={<CreateStudentButton />}
      >
        <SearchLayout>
          <Field label="Session Year">
            <Select
              name="session"
              value={form.session}
              onChange={change}
              options={sessions}
            />
          </Field>

          <Field label="School Shift">
            <Select
              name="shift"
              value={form.shift}
              onChange={change}
              options={shifts}
              placeholder="Select Shift"
            />
          </Field>

          <Field label="Class">
            <Select
              name="className"
              value={form.className}
              onChange={change}
              options={classes}
              placeholder="Select class"
            />
          </Field>

          <Field label="Section">
            <Select
              name="section"
              value={form.section}
              onChange={change}
              options={sections}
              placeholder="Select Section"
            />
          </Field>

          <Field label="Group">
            <Select
              name="group"
              value={form.group}
              onChange={change}
              options={groups}
              placeholder="Select Group"
            />
          </Field>

          <Field label="Category">
            <Select
              name="category"
              value={form.category}
              onChange={change}
              options={categories}
              placeholder="Select Category"
            />
          </Field>

          <Field label="Student ID Format">
            <Select
              value={idFormat}
              onChange={(event) =>
                setIdFormat(
                  event.target.value
                )
              }
              options={[
                "Auto ID",
                "Custom ID",
              ]}
              placeholder="Student ID Format"
            />
          </Field>
        </SearchLayout>


        <ExcelTools
          twoDownloads
        />
      </Panel>
    </div>
  );
}


/* =========================================================
   QUICK UPDATE
========================================================= */

export function StudentQuickUpdate() {
  return (
    <StandardStudentSearch
      title="Student Quick Update"
      category
      roll
    />
  );
}


/* =========================================================
   ADMISSION UPDATE
========================================================= */

export function StudentAdmissionUpdate() {
  return (
    <StandardStudentSearch
      title="Student Admission Information Update"
      category
      roll
    />
  );
}


/* =========================================================
   SUBJECT ASSIGN
========================================================= */

export function StudentSubjectAssign() {
  return (
    <StandardStudentSearch
      title="Student Search"
    />
  );
}


/* =========================================================
   TRANSFER
========================================================= */

export function StudentTransfer() {
  const { form, change } =
    useSearchForm();

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Student Transfer From"
        action={<CreateStudentButton />}
      >
        <form
          onSubmit={(event) =>
            event.preventDefault()
          }
        >
          <SearchLayout>
            <Field label="Session Year">
              <Select
                name="session"
                value={form.session}
                onChange={change}
                options={sessions}
              />
            </Field>

            <Field label="School Shift">
              <Select
                name="shift"
                value={form.shift}
                onChange={change}
                options={shifts}
                placeholder="Select Shift"
              />
            </Field>

            <Field label="Class">
              <Select
                name="className"
                value={form.className}
                onChange={change}
                options={classes}
                placeholder="Select class"
              />
            </Field>

            <Field label="Section">
              <Select
                name="section"
                value={form.section}
                onChange={change}
                options={sections}
                placeholder="Select Section"
              />
            </Field>

            <Field label="Group">
              <Select
                name="group"
                value={form.group}
                onChange={change}
                options={groups}
                placeholder="Select Group"
              />
            </Field>

            <Field label="Student Category">
              <Select
                name="category"
                value={form.category}
                onChange={change}
                options={categories}
                placeholder="Select Category"
              />
            </Field>

            <Field label="Student ID">
              <TextInput
                name="studentId"
                value={
                  form.studentId
                }
                onChange={change}
                placeholder="Student ID"
              />
            </Field>
          </SearchLayout>

          <div className="student-action-row">
            <SearchButton />
          </div>
        </form>
      </Panel>
    </div>
  );
}


/* =========================================================
   RFID
========================================================= */

export function StudentRFID() {
  return (
    <StandardStudentSearch
      title="Student RFID Card Entry"
      category
      roll
    />
  );
}


/* =========================================================
   INFO EXCEL UPDATE
========================================================= */

export function StudentInfoExcelUpdate() {
  const { form, change } =
    useSearchForm();

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Student Quick Update"
        action={<CreateStudentButton />}
      >
        <SearchLayout>
          <Field label="Session Year">
            <Select
              name="session"
              value={form.session}
              onChange={change}
              options={sessions}
            />
          </Field>

          <Field label="School Shift">
            <Select
              name="shift"
              value={form.shift}
              onChange={change}
              options={shifts}
              placeholder="Select Shift"
            />
          </Field>

          <Field label="Class">
            <Select
              name="className"
              value={form.className}
              onChange={change}
              options={classes}
              placeholder="Select class"
            />
          </Field>

          <Field label="Section">
            <Select
              name="section"
              value={form.section}
              onChange={change}
              options={sections}
              placeholder="Select Section"
            />
          </Field>

          <Field label="Group">
            <Select
              name="group"
              value={form.group}
              onChange={change}
              options={groups}
              placeholder="Select Group"
            />
          </Field>

          <Field label="Roll">
            <TextInput
              name="roll"
              value={form.roll}
              onChange={change}
              placeholder="Enter roll"
            />
          </Field>

          <Field label="Category">
            <Select
              name="category"
              value={form.category}
              onChange={change}
              options={categories}
            />
          </Field>
        </SearchLayout>

        <ExcelTools />
      </Panel>
    </div>
  );
}


/* =========================================================
   DETAILS EXCEL ENTRY
========================================================= */

export function StudentDetailsExcelEntry() {
  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title="Student Dynamic Excell Entry"
        action={<CreateStudentButton />}
      >
        <div className="student-warning">
          ***Check before upload your
          excel file has the same
          columns as the excel setup.
        </div>

        <div className="student-config-row">
          <span>
            Setup Excel File:
          </span>

          <button
            type="button"
            className="student-btn student-btn-muted student-wide-button"
          >
            Set Excel Config
          </button>
        </div>

        <ExcelTools />

        <p className="student-help-text">
          ***Download Student Excel
          Format. Fill up with student
          information and upload this
          file to quick data entry.
        </p>
      </Panel>
    </div>
  );
}


/* =========================================================
   STANDARD SEARCH
========================================================= */

function StandardStudentSearch({
  title,
  category = false,
  roll = false,
}) {
  const { form, change } =
    useSearchForm();

  return (
    <div className="student-admin-page">
      <UserManagementNav />
      <Panel
        title={title}
        action={<CreateStudentButton />}
      >
        <form
          onSubmit={(event) =>
            event.preventDefault()
          }
        >
          <SearchLayout>
            <Field label="Session Year">
              <Select
                name="session"
                value={form.session}
                onChange={change}
                options={sessions}
              />
            </Field>

            <Field label="School Shift">
              <Select
                name="shift"
                value={form.shift}
                onChange={change}
                options={shifts}
                placeholder="Select Shift"
              />
            </Field>

            <Field label="Class">
              <Select
                name="className"
                value={form.className}
                onChange={change}
                options={classes}
                placeholder="Select class"
              />
            </Field>

            <Field label="Section">
              <Select
                name="section"
                value={form.section}
                onChange={change}
                options={sections}
                placeholder="Select Section"
              />
            </Field>

            <Field label="Group">
              <Select
                name="group"
                value={form.group}
                onChange={change}
                options={groups}
                placeholder="Select Group"
              />
            </Field>

            {roll && (
              <Field label="Roll">
                <TextInput
                  name="roll"
                  value={form.roll}
                  onChange={change}
                  placeholder="Enter roll"
                />
              </Field>
            )}

            {category && (
              <Field label="Category">
                <Select
                  name="category"
                  value={
                    form.category
                  }
                  onChange={change}
                  options={categories}
                  placeholder="Select Category"
                />
              </Field>
            )}
          </SearchLayout>

          <div className="student-action-row">
            <SearchButton />
          </div>
        </form>
      </Panel>
    </div>
  );
}


/* =========================================================
   EXCEL TOOLS
========================================================= */

function ExcelTools({
  twoDownloads = false,
}) {
  return (
    <div className="excel-tools-grid">
      <div>
        <label className="excel-upload-button">
          <Upload size={16} />

          Upload Excel Format

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
          />
        </label>

        <div className="excel-file-placeholder" />
      </div>

      <div className="excel-download-stack">
        <button
          type="button"
          className="student-btn student-btn-purple student-wide-button"
        >
          <Download size={15} />

          {twoDownloads
            ? "Student Auto ID Excel Format"
            : "Download Excel Format"}
        </button>

        {twoDownloads && (
          <button
            type="button"
            className="student-btn student-btn-purple student-wide-button"
          >
            <Download size={15} />

            Student Custom ID Excel
            Format
          </button>
        )}
      </div>
    </div>
  );
}
