import { useState } from "react";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import { result } from "../data/mockData.js";
import { Table } from "./AcademicPages.jsx";

const containerClass = "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8";
const inputClass = "input input-bordered w-full";
const primaryButton = "btn bg-emerald-700 text-white hover:bg-emerald-800";

function SearchPanel({ onSearch, fields = ["Student ID", "Roll", "Session", "Exam"] }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-5">
      {fields.map((f) => (
        <label className="grid gap-1 text-sm font-bold text-slate-700" key={f}>
          {f}
          <input className={inputClass} placeholder={f} />
        </label>
      ))}
      <button className={`${primaryButton} self-end`} onClick={onSearch}>
        Search
      </button>
    </div>
  );
}

export function IndividualResultPage() {
  const [show, setShow] = useState(false);

  return (
    <>
      <SEO title="Individual Academic Result" />
      <PageHeader title="Individual Academic Result" eyebrow="Result" />
      <section className="printable">
        <div className={containerClass}>
          <div className="no-print">
            <SearchPanel onSearch={() => setShow(true)} />
          </div>
          {show && <ResultSheet />}
        </div>
      </section>
    </>
  );
}

export function AssessmentPage() {
  const [show, setShow] = useState(false);

  return (
    <>
      <SEO title="Assessment Reports" />
      <PageHeader title="Assessment Reports" eyebrow="Result" />
      <section>
        <div className={containerClass}>
          <SearchPanel
            onSearch={() => setShow(true)}
            fields={["Student", "Class", "Session", "Assessment"]}
          />
          {show && (
            <div className="card mt-6 border border-emerald-100 bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-emerald-950">Assessment Summary</h2>
                <Table
                  cols={["Subject", "Marks", "Grade", "Teacher Remarks"]}
                  rows={result.subjects.map((s) => [
                    s[0],
                    s[2],
                    s[3],
                    "Good progress; keep practicing.",
                  ])}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function BoardResultPage() {
  const stats = [
    ["Board", "Jashore"],
    ["Pass Rate", "96%"],
    ["GPA-5", "38"],
    ["Total", "142 Students"],
  ];

  return (
    <>
      <SEO title="Board Result" />
      <PageHeader title="Board Result" eyebrow="Result" />
      <section>
        <div className={`${containerClass} grid gap-5 sm:grid-cols-2 lg:grid-cols-4`}>
          {stats.map(([label, value]) => (
            <article className="card border border-emerald-100 bg-base-100 shadow-sm" key={label}>
              <div className="card-body">
                <h3 className="font-black text-slate-500">{label}</h3>
                <p className="text-3xl font-black text-emerald-950">{value}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function ResultSheet() {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-emerald-950">Academic Transcript</h2>
      <p className="mb-5 mt-1 font-semibold text-slate-600">
        {result.student} • ID {result.studentId} • Class {result.className} • Roll {result.roll}
      </p>
      <Table cols={["Subject", "Full Marks", "Obtained", "Grade", "GP"]} rows={result.subjects} />
      <div className="mt-5 grid gap-3 rounded-xl bg-emerald-50 p-4 font-black text-emerald-950 sm:grid-cols-3">
        <strong>Total: {result.total}</strong>
        <strong>GPA: {result.gpa} ({result.grade})</strong>
        <strong>{result.status}</strong>
      </div>
      <button className="btn no-print mt-5" onClick={() => window.print()}>
        Print Result
      </button>
    </div>
  );
}
