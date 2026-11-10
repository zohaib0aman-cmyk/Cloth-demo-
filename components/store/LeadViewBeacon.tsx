"use client";

import { useEffect } from "react";

const STORAGE_KEY = "zyn_view_reported";
const DELAY_MS = 8000; // link-preview bots and accidental taps don't stay this long

/** Reports one "demo viewed" per browser session, after the page has been open for a few seconds. */
export function LeadViewBeacon() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {}
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      fetch("/api/lead-view", { method: "POST", keepalive: true }).catch(() => {});
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, []);
  return null;
}
