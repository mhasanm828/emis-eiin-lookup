// GET /api/ein?eiin=100875
// Teacher list by EIIN. Proxies the original public lookup API
// (emis-eiin-lookup-gbbs-projects.vercel.app) — same data, no auth.
// The original app stays the data source; this route only re-exposes it
// so the combined app has one origin for both calls.
const UPSTREAM = 'https://emis-eiin-lookup-gbbs-projects.vercel.app/api/ein';

module.exports = async (req, res) => {
  const eiin = String((req.query && req.query.eiin) || '').trim();
  if (!/^\d{6}$/.test(eiin)) {
    res.status(400).json({ ok: false, error: '৬ সংখ্যার EIIN দিন।' });
    return;
  }
  try {
    const r = await fetch(UPSTREAM + '?eiin=' + encodeURIComponent(eiin), {
      headers: { accept: 'application/json' },
    });
    const j = await r.json();
    res.setHeader(
      'Cache-Control',
      's-maxage=3600, stale-while-revalidate=86400'
    );
    res.status(r.status).json(j);
  } catch (e) {
    res
      .status(502)
      .json({ ok: false, error: 'মূল সার্ভারের সাথে সংযোগ করা যায়নি।' });
  }
};
