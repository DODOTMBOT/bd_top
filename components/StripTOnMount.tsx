'use client';

import { useEffect } from 'react';

export default function StripTOnMount() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('t')) {
      url.searchParams.delete('t');
      const qs = url.searchParams.toString();
      const next = url.pathname + (qs ? `?${qs}` : '') + url.hash;
      window.history.replaceState({}, '', next);
    }
  }, []);
  return null;
}



