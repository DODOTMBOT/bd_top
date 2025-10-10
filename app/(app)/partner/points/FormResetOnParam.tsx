"use client";

import { useEffect } from "react";

export default function FormResetOnParam({ formId, dep }: { formId: string; dep: string }) {
  useEffect(() => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    // native reset
    try { form.reset(); } catch {}
    // hard clear just in case
    const inputs = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
    inputs.forEach((el) => { try { el.value = ""; } catch {} });
  }, [formId, dep]);
  return null;
}


