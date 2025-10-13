async function safeFetch(input: RequestInfo, init?: RequestInit) {
  const r = await fetch(input, init)
  if (!r.ok) {
    let msg = `HTTP_${r.status}`
    try {
      const j = await r.json()
      msg = j?.code || msg
    } catch {}
    throw new Error(msg)
  }
  return r
}

export { safeFetch }
