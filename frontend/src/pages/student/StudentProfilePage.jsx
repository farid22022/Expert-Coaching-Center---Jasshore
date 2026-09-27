import { useEffect, useState } from "react";
import { GraduationCap, Mail, Phone, UserRound } from "lucide-react";

import api, { API_BASE_URL, getApiErrorMessage } from "../../services/api.js";
import { notifyError, notifySuccess } from "../../services/alerts.js";
import { LoadingOrError, PortalPage } from "./studentPortalShared.jsx";

const photoUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  return `${API_BASE_URL.replace(/\/api\/v1$/, "")}${value}`;
};

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/courses/student/dashboard/me/")
      .then((response) => {
        const data = response.data?.data || response.data;
        setProfile(data);
        setPhone(data.phone || "");
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError, "Unable to load your profile.")))
      .finally(() => setLoading(false));
  }, []);

  const savePhone = async () => {
    setSaving(true);
    try {
      const response = await api.patch("/courses/student/dashboard/me/", { phone });
      const data = response.data?.data || response.data;
      setProfile(data);
      notifySuccess("Profile updated successfully.");
    } catch (requestError) {
      notifyError(getApiErrorMessage(requestError, "Could not update your profile."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalPage title="My Profile">
      <LoadingOrError loading={loading} error={error} />
      {!loading && !error && profile && (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <section className="rounded-xl border border-emerald-100 bg-white p-6 text-center shadow-sm">
            {profile.photo ? (
              <img src={photoUrl(profile.photo)} alt={profile.full_name} className="mx-auto h-24 w-24 rounded-full object-cover" />
            ) : (
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-700 text-3xl font-black text-white">
                {(profile.full_name || "S").charAt(0).toUpperCase()}
              </div>
            )}
            <h2 className="mt-4 text-xl font-black text-slate-950">{profile.full_name}</h2>
            <p className="mt-1 font-semibold text-emerald-700">Student ID: {profile.student_id}</p>
            <span className="badge badge-success badge-outline mt-3">{profile.status || "active"}</span>
          </section>

          <div className="space-y-5">
            <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
              <h3 className="font-black text-slate-950">Contact information</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <p className="flex items-center gap-2 font-semibold text-slate-600"><Mail size={16} className="text-emerald-700" /> {profile.email || "Not set"}</p>
                <label className="flex items-center gap-2 font-semibold text-slate-600">
                  <Phone size={16} className="text-emerald-700" />
                  <input className="input input-bordered input-sm w-full" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" />
                </label>
              </div>
              <button type="button" className="btn btn-success btn-sm mt-4 text-white" disabled={saving || phone === (profile.phone || "")} onClick={savePhone}>
                {saving ? "Saving..." : "Save phone number"}
              </button>
            </section>

            <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
              <h3 className="flex items-center gap-2 font-black text-slate-950"><GraduationCap size={18} className="text-emerald-700" /> Academic information</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded bg-emerald-50 p-3"><p className="text-xs font-black uppercase text-emerald-700">Class</p><p className="font-bold text-slate-800">{profile.academic_class || "Not assigned"}</p></div>
                <div className="rounded bg-emerald-50 p-3"><p className="text-xs font-black uppercase text-emerald-700">Group</p><p className="font-bold text-slate-800">{profile.group || "Not assigned"}</p></div>
              </div>
            </section>

            <section className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
              <h3 className="flex items-center gap-2 font-black text-slate-950"><UserRound size={18} className="text-emerald-700" /> Active enrollments</h3>
              {profile.active_enrollments?.length ? (
                <ul className="mt-3 space-y-2">
                  {profile.active_enrollments.map((enrollment) => (
                    <li key={enrollment.id} className="rounded bg-emerald-50 px-3 py-2 font-bold text-slate-800">{enrollment.course}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 font-semibold text-slate-500">Your approved courses will appear here.</p>
              )}
            </section>
          </div>
        </div>
      )}
    </PortalPage>
  );
}
