export default async function handler(req, res) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    const KV_URL = process.env.KV_REST_API_URL;
    const KV_TOKEN = process.env.KV_REST_API_TOKEN;

    // Helper to call our own endpoint with absolute URL
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost';
    const base = `${proto}://${host}`;

    const players = ['jacob', 'oscar'];
    const results = {};

    for (const p of players) {
      const r = await fetch(`${base}/api/gemini-refresh?player=${encodeURIComponent(p)}`);
      const j = await r.json().catch(() => ({}));
      results[p] = j?.data || j;
    }

    // Optionally cache to Vercel KV (Upstash Redis REST API)
    if (KV_URL && KV_TOKEN) {
      const headers = { 'Authorization': `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' };
      // Upstash REST supports /set/{key}/{value} GET as well; we'll use POST JSON form for clarity
      await Promise.all([
        fetch(`${KV_URL}/set/stats:jacob/${encodeURIComponent(JSON.stringify(results.jacob || {}))}`, { headers }),
        fetch(`${KV_URL}/set/stats:oscar/${encodeURIComponent(JSON.stringify(results.oscar || {}))}`, { headers })
      ]);
    }

    return res.status(200).json({ ok: true, cached: !!(KV_URL && KV_TOKEN), results });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
