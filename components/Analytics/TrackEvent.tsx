"use client";
import { useEffect } from "react";
import { trackEvent } from "./AnalyticsConsent";
export default function TrackEvent({name,parameters}:{name:string;parameters?:Record<string,string|number>}){useEffect(()=>{trackEvent(name,parameters)},[name,parameters]);return null}
