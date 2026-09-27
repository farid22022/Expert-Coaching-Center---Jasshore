export function TeacherCard({ teacher }) {
  return (
    <article className="card overflow-hidden border border-emerald-100 bg-paper shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <figure className="bg-emerald-50">
        <img
          src={teacher.image}
          alt={teacher.name}
          className="h-56 w-full object-cover"
          loading="lazy"
        />
      </figure>

      <div className="card-body gap-2">
        <h3 className="card-title text-ink">{teacher.name}</h3>
        <div className="flex flex-wrap gap-1.5">
          <p className="badge badge-success badge-outline font-bold">
            {teacher.designation}
          </p>
          {teacher.badge && (
            <p className="badge border-none bg-amber-50 font-bold text-amber-800">
              {teacher.badge}
            </p>
          )}
        </div>
        <p className="font-semibold text-muted">{teacher.subject}</p>
        <small className="text-sm leading-6 text-muted">{teacher.bio}</small>
      </div>
    </article>
  );
}

export function InfoCard({ title, children, icon }) {
  return (
    <article className="card border border-emerald-100 bg-paper shadow-sm">
      <div className="card-body">
        <div className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>
        <h3 className="card-title text-ink">{title}</h3>
        <div className="text-sm leading-6 text-muted">{children}</div>
      </div>
    </article>
  );
}
