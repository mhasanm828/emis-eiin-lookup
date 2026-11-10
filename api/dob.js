// GET /api/dob?ids=00009482,00007049,...
// Date of birth for a batch of employee IDs, from the SAME public EMIS
// service the ExistingEmployeeRegistration form itself uses on Tab-out:
//   POST https://emis.gov.bd/emis/Services/HRM/Public/GetEmployeeInfo
//   {"EmpText": "<EmpId>"}  ->  {"Entity": {"Dob": "1970-02-25T00:00:00.000", ...}}
// Verified 2026-11-10 for 00009482 (1970-02-25) and 00007049 (1968-02-25).
//
// PRIVACY: the EMIS Entity also carries Nid, FatherName, MotherName —
// those are NEVER returned, logged or stored. Only EmpId -> YYYY-MM-DD.
// Response: { ok, count, found, dob: {EmpId: "YYYY-MM-DD"}, missing: [EmpId] }
const EMIS =
  'https://emis.gov.bd/emis/Services/HRM/Public/GetEmployeeInfo';

async function fetchOne(id) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const r = await fetch(EMIS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ EmpText: id }),
      });
      if (!r.ok) return null;
      const d = await r.json();
      const dob = d && d.Entity && d.Entity.Dob;
      return typeof dob === 'string' && dob.length >= 10
        ? dob.slice(0, 10)
        : null;
    } catch (e) {
      if (attempt === 2) return null;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  return null;
}

module.exports = async (req, res) => {
  const ids = String((req.query && req.query.ids) || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^\d{5,10}$/.test(s))
    .slice(0, 300);
  if (!ids.length) {
    res.status(400).json({ ok: false, error: 'কোনো এমপ্লয়ি আইডি দেওয়া হয়নি।' });
    return;
  }
  const dob = {};
  const missing = [];
  const CONCURRENCY = 10;
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const chunk = ids.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map((id) => fetchOne(id)));
    results.forEach((d, n) => {
      if (d) dob[chunk[n]] = d;
      else missing.push(chunk[n]);
    });
  }
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');
  res.json({ ok: true, count: ids.length, found: Object.keys(dob).length, dob, missing });
};
