"use client";
import { useEffect } from "react";
import { trackEvent } from "./AnalyticsConsent";

type Props = {
  name: string;
  parameters?: Record<string, string | number>;
  whenQuery?: { name: string; value: string };
};

export default function TrackEvent({ name, parameters, whenQuery }: Props) {
  const queryName = whenQuery?.name;
  const queryValue = whenQuery?.value;

  useEffect(() => {
    if (queryName && queryValue) {
      const query = new URLSearchParams(window.location.search);
      if (query.get(queryName) !== queryValue) return;
    }
    trackEvent(name, parameters);
  }, [name, parameters, queryName, queryValue]);

  return null;
}
