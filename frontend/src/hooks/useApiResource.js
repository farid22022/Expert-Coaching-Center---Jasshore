import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage, unwrapResults } from "../services/api.js";

export function useApiResource(resourceApi, params, options = {}) {
  const { enabled = true } = options;
  const fallback = options.fallback || [];
  const [data, setData] = useState(() => fallback);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError("");
    try {
      const response = await resourceApi.list(params);
      setData(unwrapResults(response));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      setData(fallback);
    } finally {
      setLoading(false);
    }
  }, [enabled, params, resourceApi]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load, setData };
}
