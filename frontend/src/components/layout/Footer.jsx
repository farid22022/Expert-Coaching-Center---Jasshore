import { Link } from "react-router-dom";
import { institution } from "../../data/site.js";
import { useTheme } from "../../theme/ThemeProvider.jsx";
import Reveal from "../common/Reveal.jsx";

const cols = [
  ["Institution", [["History", "/about/history"], ["Teachers", "/about/teachers"], ["Contact", "/contact"]]],
  ["Quick Links", [["Student List", "/academic/students"], ["Class Routine", "/academic/class-routine"], ["Exam Routine", "/academic/exam-routine"]]],
  ["Admission", [["Online Admission", "/admission/online"], ["Applicant's Form", "/admission/applicant"]]],
  ["Important", [["Notices", "/notices"], ["News", "/news"], ["Events", "/events"], ["Gallery", "/gallery/photos"], ["Stories", "/stories"]]],
];

export default function Footer() {
  const { siteInfo } = useTheme();
  return (
    <footer className="border-t border-emerald-900 bg-emerald-950 text-emerald-50">
      <Reveal className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:px-8">
        <div className="grid gap-4">
          <Link className="flex items-center gap-3" to="/">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white p-1 shadow-sm">
              <img
                src={siteInfo?.logo || "/jasshoreExpert.png"}
                alt={`${institution.name} logo`}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="text-lg font-black leading-tight">
              {institution.name}
            </span>
          </Link>

          <div className="grid gap-1 text-sm font-semibold text-emerald-100/80">
            <p>{institution.address}</p>
            <p>{institution.phone}</p>
            <p>{institution.email}</p>
          </div>
        </div>

        {cols.map(([title, links]) => (
          <div className="grid content-start gap-2" key={title}>
            <h3 className="mb-1 text-sm font-black uppercase tracking-wide text-white">
              {title}
            </h3>
            {links.map(([label, path]) => (
              <Link
                className="text-sm font-semibold text-emerald-100/75 transition-colors hover:text-white"
                key={path + label}
                to={path}
              >
                {label}
              </Link>
            ))}
          </div>
        ))}
      </Reveal>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs font-semibold text-emerald-100/65">
        © {new Date().getFullYear()} {institution.name}. All rights reserved.
        <p className="mt-2">Animated icons designed by Magnific from Flaticon: <a className="underline" href="https://www.flaticon.com/free-animated-icon/book_8722462" target="_blank" rel="noreferrer">Study</a> · <a className="underline" href="https://www.flaticon.com/free-animated-icon/student_10302965" target="_blank" rel="noreferrer">Student</a> · <a className="underline" href="https://www.flaticon.com/free-animated-icon/teach_10302940" target="_blank" rel="noreferrer">Teacher</a>.</p>
      </div>
    </footer>
  );
}
