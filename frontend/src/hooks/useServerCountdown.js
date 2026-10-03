import { useEffect, useMemo, useRef, useState } from "react";

export const APP_TIME_ZONE = import.meta.env.VITE_APP_TIME_ZONE || "Asia/Dhaka";

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: APP_TIME_ZONE, day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
export const formatAppDateTime = (value) => (value ? dateTimeFormat.format(new Date(value)) : "");

/**
 * Countdown to `targetIso` that does not trust the device clock.
 * `serverTime` (ISO, from the API response that carried `targetIso`) gives a clock offset:
 * offset = serverTime - Date.now() at the moment the data arrived. The remaining time is then
 * target - (Date.now() + offset), so a wrong device clock or timezone cannot skew it, and a
 * page refresh re-derives the same value from the authoritative timestamps.
 * `onZero` fires once when the countdown reaches 0 - callers must re-ask the backend rather than
 * treating that as authorization.
 */
export function useServerCountdown(targetIso, serverTime, onZero) {
  const offset = useMemo(() => (serverTime ? Date.parse(serverTime) - Date.now() : 0), [serverTime]);
  const target = targetIso ? Date.parse(targetIso) : null;
  const [now, setNow] = useState(() => Date.now() + offset);
  const firedFor = useRef(null);
  const onZeroRef = useRef(onZero);
  onZeroRef.current = onZero;

  useEffect(() => {
    setNow(Date.now() + offset);
    const timer = window.setInterval(() => setNow(Date.now() + offset), 1000);
    return () => window.clearInterval(timer);
  }, [offset]);

  const remainingMs = target === null ? null : Math.max(0, target - now);

  useEffect(() => {
    if (target === null || remainingMs > 0) return;
    const key = `${target}:${serverTime}`;
    if (firedFor.current === key) return;
    firedFor.current = key;
    onZeroRef.current?.();
  }, [remainingMs, target, serverTime]);

  const total = remainingMs === null ? 0 : Math.floor(remainingMs / 1000);
  return {
    remainingMs,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
