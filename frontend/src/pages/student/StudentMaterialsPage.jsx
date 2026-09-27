import { useEffect, useState } from "react";

import api, { getApiErrorMessage } from "../../services/api.js";
import SafeHtml from "../../components/common/SafeHtml.jsx";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

export default function StudentMaterialsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/assessments/student/assessments/materials/")
      .then((response) => {
        const data = response.data?.data || response.data || [];
        setItems(Array.isArray(data) ? data : data.results || []);
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load study materials.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalPage title="Study Materials">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => <article key={item.id} className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm"><h2 className="font-black text-slate-950">{item.title}</h2>{item.description ? <SafeHtml html={item.description} className="mt-1 text-sm font-semibold text-slate-500" /> : <p className="mt-1 text-sm font-semibold text-slate-500">{item.material_type}</p>}{item.url && <a className="btn btn-outline btn-sm mt-4 border-emerald-700 text-emerald-800" href={item.url} target="_blank" rel="noreferrer">Open material</a>}</article>)}
          {!items.length && <p className="rounded-xl border border-dashed border-emerald-200 bg-white p-8 text-center font-semibold text-slate-500">No study materials have been published yet.</p>}
        </div>
      )}
    </PortalPage>
  );
}
