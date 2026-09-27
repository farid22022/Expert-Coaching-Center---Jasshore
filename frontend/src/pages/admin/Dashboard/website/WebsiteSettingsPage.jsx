import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../../services/api.js";
import { organizationApi } from "../../../../services/resourceApi.js";
import { applyBrandColors, applyFontSettings, DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, FONT_FAMILY_OPTIONS, FONT_SCALE_OPTIONS, cacheSiteInfo } from "../../../../theme/ThemeRuntime.js";
import { useTheme } from "../../../../theme/ThemeProvider.jsx";

export default function WebsiteSettingsPage() {
  const { t } = useTranslation("admin");
  const { mode } = useTheme();
  const [org, setOrg] = useState(null);
  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT_COLOR);
  const [fontFamily, setFontFamily] = useState("");
  const [fontScale, setFontScale] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    organizationApi
      .list()
      .then((payload) => {
        const rows = Array.isArray(payload) ? payload : payload?.results || [];
        const record = rows[0] || null;
        setOrg(record);
        if (record?.theme_primary_color) setPrimaryColor(record.theme_primary_color);
        if (record?.theme_accent_color) setAccentColor(record.theme_accent_color);
        setFontFamily(record?.theme_font_family || "");
        setFontScale(record?.theme_font_scale || "");
      })
      .catch((error) => setNotice(getApiErrorMessage(error, "Unable to load website settings.")))
      .finally(() => setLoading(false));
  }, []);

  const save = async (event) => {
    event.preventDefault();
    if (!org) return;
    setSaving(true);
    setNotice("");
    try {
      const payload = { theme_primary_color: primaryColor, theme_accent_color: accentColor, theme_font_family: fontFamily, theme_font_scale: fontScale };
      const requestPayload = logo instanceof File
        ? (() => {
            const data = new FormData();
            Object.entries(payload).forEach(([key, value]) => data.append(key, value));
            data.append("logo", logo);
            return data;
          })()
        : payload;
      const updated = await organizationApi.update(org.id, requestPayload);
      setOrg(updated);
      setLogo(null);
      applyBrandColors(updated.theme_primary_color, updated.theme_accent_color, mode);
      applyFontSettings(updated.theme_font_family, updated.theme_font_scale);
      cacheSiteInfo(updated);
      setNotice(t("websiteSettingsPage.savedSuccessfully"));
    } catch (error) {
      setNotice(getApiErrorMessage(error, "Unable to save website settings."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-[calc(100vh-60px)] bg-soft p-3"><p className="text-slate-500">Loading...</p></div>;

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft p-3">
      <section className="mt-5 overflow-hidden rounded-md border border-base-300 bg-paper shadow-sm">
        <header className="bg-deep-green px-5 py-3 text-white">
          <h1 className="text-lg font-black">{t("websiteSettingsPage.title")}</h1>
        </header>
        <div className="space-y-5 p-5">
          <form onSubmit={save} className="grid max-w-2xl gap-4 rounded-md border border-slate-200 bg-soft p-4">
            <label>
              <span className="mb-1 block text-sm font-bold text-slate-700">{t("websiteSettingsPage.logo")}</span>
              {org?.logo && <img src={org.logo} alt="Current logo" className="mb-2 h-14 w-auto rounded border border-slate-200 bg-paper p-1" />}
              <input type="file" accept="image/*" onChange={(event) => setLogo(event.target.files?.[0] || null)} className="file-input file-input-bordered file-input-sm h-9 min-h-9 w-full rounded-[3px] bg-white" />
            </label>

            <label>
              <span className="mb-1 block text-sm font-bold text-slate-700">{t("websiteSettingsPage.primaryColor")}</span>
              <div className="flex items-center gap-2">
                <input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="h-9 w-14 cursor-pointer rounded border border-base-300 bg-white p-1" />
                <input type="text" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} className="input input-bordered input-sm h-9 min-h-9 w-full rounded-[3px] bg-white" placeholder={DEFAULT_PRIMARY_COLOR} />
              </div>
            </label>

            <label>
              <span className="mb-1 block text-sm font-bold text-slate-700">{t("websiteSettingsPage.accentColor")}</span>
              <div className="flex items-center gap-2">
                <input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="h-9 w-14 cursor-pointer rounded border border-base-300 bg-white p-1" />
                <input type="text" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} className="input input-bordered input-sm h-9 min-h-9 w-full rounded-[3px] bg-white" placeholder={DEFAULT_ACCENT_COLOR} />
              </div>
            </label>

            <label>
              <span className="mb-1 block text-sm font-bold text-slate-700">Font family</span>
              <select value={fontFamily} onChange={(event) => setFontFamily(event.target.value)} className="select select-bordered select-sm h-9 min-h-9 w-full rounded-[3px] bg-white">
                {FONT_FAMILY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <p className="mt-1 text-xs font-semibold text-slate-500" style={{ fontFamily: (FONT_FAMILY_OPTIONS.find((option) => option.value === fontFamily) || FONT_FAMILY_OPTIONS[0]).stack }}>
                Preview: The quick brown fox jumps over the lazy dog.
              </p>
            </label>

            <label>
              <span className="mb-1 block text-sm font-bold text-slate-700">Font size</span>
              <select value={fontScale} onChange={(event) => setFontScale(event.target.value)} className="select select-bordered select-sm h-9 min-h-9 w-full rounded-[3px] bg-white">
                {FONT_SCALE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <p className="mt-1 text-xs font-semibold text-slate-500">Scales text across the entire website, for both public pages and portals.</p>
            </label>

            <div className="flex items-center gap-2">
              <button type="submit" disabled={saving} className="btn btn-success btn-sm text-white">{saving ? t("websiteSettingsPage.saving") : t("websiteSettingsPage.save")}</button>
            </div>
          </form>

          {notice && <div className="rounded border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">{notice}</div>}
        </div>
      </section>
    </div>
  );
}
