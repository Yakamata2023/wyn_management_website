export default async function handler(req, res) {
  try {
    const { player = "jacob" } = req.query;
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(200).json({
        ok: true,
        note: "GEMINI_API_KEY not set; returning placeholders.",
        player,
        data: player === "jacob" ? {
          competitions: {
            accq_2025: { apps: 2, goals: null, assists: null },
            achq_2025: { apps: 1, goals: null, assists: null },
            mys1_2022: { apps: 2, goals: null, assists: null },
            mysp_2021: { apps: 2, goals: null, assists: null },
            myc1_2021: { apps: 1, goals: null, assists: null },
            isr1_2016: { apps: 6, goals: null, assists: null },
            isr2_misc: { apps: 22, goals: null, assists: null }
          }
        } : {
          competitions: {
            season: { apps: null, goals: null, assists: null, minutes: null }
          }
        }
      });
    }

    // Minimal fetch + summarize pipeline using Gemini REST API
    const sources = [];
    if (player === "jacob") {
      sources.push("https://www.transfermarkt.com/jacob-njoku/leistungsdaten/spieler/452336/saison//plus/1");
      sources.push("https://www.transfermarkt.com/jacob-njoku/leistungsdaten/spieler/452336");
    }

    const pages = await Promise.allSettled(
      sources.map(async (url) => ({ url, html: await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } }).then(r => r.text()) }))
    );

    // Truncate to avoid token limits
    const combined = pages
      .filter(p => p.status === "fulfilled")
      .map(p => `URL: ${p.value.url}\n\n${p.value.html.substring(0, 20000)}`)
      .join("\n\n====\n\n");

    const prompt = `You are a data extraction agent. From the provided HTML snippets (Transfermarkt pages), extract structured football statistics for ${player} with keys:\n{
      "competitions": {
        "accq_2025": {"apps": number, "goals": number|null, "assists": number|null},
        "achq_2025": {"apps": number, "goals": number|null, "assists": number|null},
        "mys1_2022": {"apps": number, "goals": number|null, "assists": number|null},
        "mysp_2021": {"apps": number, "goals": number|null, "assists": number|null},
        "myc1_2021": {"apps": number, "goals": number|null, "assists": number|null},
        "isr1_2016": {"apps": number, "goals": number|null, "assists": number|null},
        "isr2_misc": {"apps": number, "goals": number|null, "assists": number|null}
      }
    }\nReturn strictly valid JSON.`;

    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [ { text: prompt } ] },
            { role: "user", parts: [ { text: combined || "No HTML captured." } ] }
          ]
        })
      }
    );

    const json = await resp.json();
    const textOut = json?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    let data;
    try { data = JSON.parse(textOut); } catch { data = { note: "Model did not return pure JSON", raw: textOut }; }
    return res.status(200).json({ ok: true, player, data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
