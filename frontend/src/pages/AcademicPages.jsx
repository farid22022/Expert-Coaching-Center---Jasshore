import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import { students, routines, examRoutine, holidays } from "../data/mockData.js";

const containerClass = "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8";
const inputClass = "input input-bordered w-full";
const buttonClass = "btn bg-emerald-700 text-white hover:bg-emerald-800";

function FilterInput({ value, setValue, placeholder = "Search" }) {
  return (
    <input
      className={inputClass}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
    />
  );
}

export function StudentsPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () =>
      students.filter((s) =>
        Object.values(s).join(" ").toLowerCase().includes(q.toLowerCase())
      ),
    [q]
  );

  return (
    <>
      <SEO title="Student List" />
      <PageHeader
        title="Student List"
        eyebrow="Academic"
        description="Search public mock student records without exposing private information."
      />
      <section>
        <div className={containerClass}>
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:flex-row">
            <FilterInput
              value={q}
              setValue={setQ}
              placeholder="Search by name, ID, class, section"
            />
            <button className="btn btn-outline" type="button" onClick={() => setQ("")}>
              Reset
            </button>
          </div>
          <Table
            cols={["Student ID", "Name", "Class", "Section", "Roll", "Session", "Shift"]}
            rows={filtered.map((s) => [
              s.id,
              s.name,
              s.className,
              s.section,
              s.roll,
              s.session,
              s.shift,
            ])}
          />
        </div>
      </section>
    </>
  );
}

export function ClassRoutinePage() {
  return (
    <Routine
      title="Class Routine"
      data={routines}
      cols={["Day", "Period", "Start", "End", "Subject", "Teacher", "Room"]}
      map={(r) => [r.day, r.period, r.start, r.end, r.subject, r.teacher, r.room]}
    />
  );
}

export function ExamRoutinePage() {
  return (
    <Routine
      title="Exam Routine"
      data={examRoutine}
      cols={["Exam", "Class", "Subject", "Date", "Start", "End", "Room"]}
      map={(r) => [r.exam, r.className, r.subject, r.date, r.start, r.end, r.room]}
    />
  );
}

function Routine({ title, data, cols, map }) {
  const [q, setQ] = useState("");
  const filtered = data.filter((r) =>
    Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <SEO title={title} />
      <PageHeader
        title={title}
        eyebrow="Academic"
        description="Filter by session, shift, class, section, subject, or teacher."
      />
      <section className="printable">
        <div className={containerClass}>
          <div className="no-print mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:flex-row">
            <FilterInput value={q} setValue={setQ} placeholder="Filter routine" />
            <button className={buttonClass} type="button" onClick={() => window.print()}>
              Print
            </button>
          </div>
          <Table cols={cols} rows={filtered.map(map)} />
        </div>
      </section>
    </>
  );
}

export function RulesPage() {
  const rules = [
    "Attend classes on time and maintain at least 80% attendance.",
    "Bring required books, copies, and class materials.",
    "Respect teachers, staff, classmates, and campus property.",
    "Follow examination rules and avoid unfair means.",
    "Wear clean and appropriate uniform during class days.",
  ];

  return (
    <>
      <SEO title="Rules & Regulations" />
      <PageHeader title="Rules & Regulations" eyebrow="Academic" />
      <section>
        <div className={`${containerClass} grid gap-3`}>
          {rules.map((r, i) => (
            <div className="collapse collapse-arrow border border-emerald-100 bg-white shadow-sm" key={r}>
              <input type="radio" name="academic-rules" defaultChecked={i === 0} />
              <div className="collapse-title font-black text-emerald-950">Rule {i + 1}</div>
              <div className="collapse-content text-slate-600">
                <p>{r}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function UniformPage() {
  const cards = [
    ["Boys Uniform", "Clean shirt, trousers, shoes, and institution-approved accessories."],
    ["Girls Uniform", "Modest institution-approved dress, shoes, and seasonal requirements."],
    ["Seasonal", "Winter sweater or jacket may be worn according to weather and notice."],
  ];

  return (
    <>
      <SEO title="Uniform Details" />
      <PageHeader title="Uniform Details" eyebrow="Academic" />
      <section>
        <div className={`${containerClass} grid gap-5 md:grid-cols-3`}>
          {cards.map(([title, body]) => (
            <article className="card border border-emerald-100 bg-base-100 shadow-sm" key={title}>
              <div className="card-body">
                <h3 className="card-title text-emerald-950">{title}</h3>
                <p className="leading-7 text-slate-600">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function HolidaysPage() {
  return (
    <>
      <SEO title="List of Holidays" />
      <PageHeader title="List of Holidays" eyebrow="Academic" />
      <section>
        <div className={containerClass}>
          <Table
            cols={["Date", "Day", "Holiday", "Description"]}
            rows={holidays.map((h) => [h.date, h.day, h.title, h.description])}
          />
        </div>
      </section>
    </>
  );
}

export function Table({ cols, rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <table className="table table-zebra">
        <thead>
          <tr className="bg-emerald-950 text-white">
            {cols.map((c) => (
              <th className="text-sm font-black text-white" key={c}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td className="font-medium text-slate-700" key={j}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td className="py-8 text-center text-slate-500" colSpan={cols.length}>
                No records available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
