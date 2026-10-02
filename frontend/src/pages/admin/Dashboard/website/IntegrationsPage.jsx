import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Loader2, PlugZap, ShieldCheck, Trash2 } from "lucide-react";
import api, { getApiErrorMessage } from "../../../../services/api.js";
import { notifyError, notifySuccess } from "../../../../services/alerts.js";

// The API key is write-only: the backend never returns it, only a masked hint.
export default function IntegrationsPage() {
  const [status, setStatus] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/integrations/imgbb/");
      setStatus(data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load integration settings. Only administrators can open this page."));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const run = async (name, fn, success) => {
    setBusy(name);
    setError("");
    try {
      await fn();
      if (success) notifySuccess(success);
    } catch (err) {
      const message = getApiErrorMessage(err, "Request failed.");
      setError(message);
      notifyError(message);
    } finally {
      setBusy("");
    }
  };

  const save = (event) => {
    event.preventDefault();
    run("save", async () => {
      const { data } = await api.put("/integrations/imgbb/", apiKey ? { api_key: apiKey.trim() } : {});
      setStatus(data);
      setApiKey("");
      setTestResult(null);
    }, "ImgBB configuration saved.");
  };
  const toggle = () => run("toggle", async () => {
    const { data } = await api.put("/integrations/imgbb/", { enabled: !status.enabled });
    setStatus(data);
  }, status?.enabled ? "ImgBB disabled." : "ImgBB enabled.");
  const remove = () => {
    if (!window.confirm("Remove the saved ImgBB API key? Existing images keep working; new uploads stop until a key is added.")) return;
    run("remove", async () => {
      const { data } = await api.delete("/integrations/imgbb/");
      setStatus(data);
      setTestResult(null);
    }, "ImgBB API key removed.");
  };
  const test = () => run("test", async () => {
    const { data } = await api.post("/integrations/imgbb/test/", apiKey ? { api_key: apiKey.trim() } : {});
    setTestResult(data);
  });

  if (loading) return <div className="p-6 text-sm opacity-70">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4">
      <div>
        <h1 className="text-2xl font-black">Integrations</h1>
        <p className="text-sm opacity-70">Image hosting for course covers, teacher photos, notices and other images. PDFs and videos are not sent to ImgBB.</p>
      </div>
      {error && <p role="alert" className="alert alert-error text-sm">{error}</p>}
      {status && (
        <section className="rounded-lg border border-base-300 bg-base-100 p-5 text-base-content shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">Image Hosting · ImgBB</h2>
              <p className="mt-1 flex items-center gap-2 text-sm">
                {status.configured || status.env_fallback_available
                  ? <span className="inline-flex items-center gap-1 font-semibold text-success"><CheckCircle2 size={16} />Configured ✓</span>
                  : <span className="font-semibold text-warning">Not Configured</span>}
                <span className="opacity-70">· {status.enabled ? "Enabled" : "Disabled"} · uploads {status.uploads_available ? "available" : "unavailable"}</span>
              </p>
            </div>
            {status.configured && (
              <button type="button" onClick={toggle} disabled={!!busy} className={`btn btn-sm ${status.enabled ? "btn-outline" : "btn-success text-white"}`}>
                {busy === "toggle" && <Loader2 size={14} className="animate-spin" />}{status.enabled ? "Disable" : "Enable"}
              </button>
            )}
          </div>

          {!status.encryption_ready && (
            <p className="alert alert-warning mt-4 text-sm">The server encryption key (APP_CONFIG_ENCRYPTION_KEY) is not configured, so an API key cannot be saved here. {status.env_fallback_available ? "The IMGBB_API_KEY environment fallback is in use." : ""}</p>
          )}

          <form onSubmit={save} className="mt-5 space-y-3">
            <label className="form-control">
              <span className="mb-1 flex items-center gap-2 text-sm font-bold"><KeyRound size={15} />{status.configured ? "Replace API key" : "API key"}</span>
              <input
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder={status.configured ? status.masked_key : "Paste your ImgBB API key"}
                className="input input-bordered w-full"
              />
              <span className="mt-1 text-xs opacity-70">
                {status.configured ? `Current key: ${status.masked_key}. ` : ""}The key is encrypted on the server and can never be viewed again.
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button disabled={!!busy || !apiKey} className="btn btn-success text-white">
                {busy === "save" ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}Save configuration
              </button>
              <button type="button" onClick={test} disabled={!!busy || (!apiKey && !status.uploads_available)} className="btn btn-outline">
                {busy === "test" ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />}Test connection
              </button>
              {status.configured && (
                <button type="button" onClick={remove} disabled={!!busy} className="btn btn-ghost text-error"><Trash2 size={16} />Remove key</button>
              )}
            </div>
          </form>

          {testResult && (
            <p role="status" className={`mt-4 text-sm font-semibold ${testResult.ok ? "text-success" : "text-error"}`}>
              {testResult.ok ? "Connection successful." : testResult.detail}
            </p>
          )}
          <p className="mt-5 text-xs opacity-70">
            Key priority: the admin-saved key (when enabled) → the server IMGBB_API_KEY → uploads unavailable. Changing or disabling the key never alters images that are already uploaded.
          </p>
        </section>
      )}
    </div>
  );
}
