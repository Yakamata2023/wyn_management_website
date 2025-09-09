export default async function handler(req, res) {
  try {
    const { player = "jacob" } = req.query;
    const KV_URL = process.env.KV_REST_API_URL;
    const KV_TOKEN = process.env.KV_REST_API_TOKEN;

    const key = player === 'oscar' ? 'stats:oscar' : 'stats:jacob';

    // 1) Try KV cache first
    if (KV_URL && KV_TOKEN) {
      const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
        headers: { 'Authorization': `Bearer ${KV_TOKEN}` }
      });
      if (r.ok) {
        const jr = await r.json().catch(() => ({}));
        const raw = jr?.result;
        if (typeof raw === 'string' && raw.length) {
          try { return res.status(200).json({ ok: true, source: 'kv', player, data: JSON.parse(raw) }); }
          catch { return res.status(200).json({ ok: true, source: 'kv', player, data: raw }); }
        }
      }
    }

    // 2) Fallback: call live refresh endpoint
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'localhost';
    const base = `${proto}://${host}`;
    const live = await fetch(`${base}/api/gemini-refresh?player=${encodeURIComponent(player)}`);
    const liveJson = await live.json().catch(() => ({}));

    return res.status(200).json({ ok: true, source: 'live', player, ...(liveJson || {}) });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
