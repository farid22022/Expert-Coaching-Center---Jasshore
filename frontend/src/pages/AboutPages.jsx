import PageHeader from "../components/common/PageHeader.jsx";
import SEO from "../components/common/SEO.jsx";
import { TeacherCard } from "../components/common/Cards.jsx";
import { institution } from "../data/site.js";
import { people, teachers } from "../data/mockData.js";

const containerClass = "mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8";

const text = {
  history: [
    "History",
    `EXPERT COACHING CENTER was established in ${institution.established} at ${institution.address}. The center focuses on regular classes, assessment reports, guardian communication, and student discipline.`,
  ],
  "institution-details": [
    "Institution Details",
    `Name: ${institution.name}. Address: ${institution.address}. Phone: ${institution.phone}. Email: ${institution.email}. Year of Establishment: ${institution.established}.`,
  ],
  committee: [
    "Committee Members",
    "A public committee listing with academic advisors, guardian representatives, and management members can be connected to the backend later.",
  ],
  staff: [
    "Staff List",
    "Office assistants, support staff, and academic coordinators help maintain daily operations and student services.",
  ],
};

export function AboutText({ type }) {
  const [title, body] = text[type] || ["About", "Institution information."];

  return (
    <>
      <SEO title={title} />
      <PageHeader title={title} eyebrow="About" description={body} />
      <section>
        <div className={containerClass}>
          <div className="prose max-w-none rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p>{body}</p>
            <ol>
              <li>Transparent academic planning</li>
              <li>Regular guardian communication</li>
              <li>Student-focused coaching environment</li>
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}

export function ProfilePage({ type }) {
  const person = people[type];

  return (
    <>
      <SEO title={person.position} />
      <PageHeader title={person.position} eyebrow="Management" description={person.message} />
      <section>
        <div className={containerClass}>
          <div className="card border border-emerald-100 bg-base-100 shadow-sm lg:card-side">
            <figure className="bg-emerald-50 p-6">
              <img
                src={`https://placehold.co/260x300/e8f2ee/173d33?text=${encodeURIComponent(person.name)}`}
                alt={person.name}
                className="rounded-xl"
                loading="lazy"
                width="260"
                height="300"
              />
            </figure>

            <div className="card-body">
              <h2 className="card-title text-3xl text-emerald-950">{person.name}</h2>
              <p className="badge badge-success badge-outline font-bold">{person.position}</p>
              <p className="leading-7 text-slate-600">{person.message}</p>
              <p className="leading-7 text-slate-600">
                Educational background and detailed biography are represented as
                public placeholder content until connected with verified
                institutional records.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function TeachersPage() {
  return (
    <>
      <SEO title="Teachers" />
      <PageHeader
        title="Teachers"
        eyebrow="About"
        description="Complete public teacher directory."
      />
      <section>
        <div className={ `${containerClass} grid gap-5 sm:grid-cols-2 lg:grid-cols-3`}>
          {teachers.map((t) => (
            <TeacherCard key={t.id} teacher={t} />
          ))}
        </div>
      </section>
    </>
  );
}
