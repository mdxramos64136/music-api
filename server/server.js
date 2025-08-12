import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// Busca crua no MusicBrainz: /api/artist?q=<texto>&limit=&offset=
app.get("/api/artist", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "q is required" });

    const limit = Number(req.query.limit || 25);
    const offset = Number(req.query.offset || 0);

    const url = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(
      q
    )}&limit=${limit}&offset=${offset}&fmt=json`;

    const r = await fetch(url, {
      headers: { "User-Agent": "MyMusicApp/1.0 (marceldramos@gmail.com)" },
    });

    if (!r.ok) return res.status(r.status).json({ error: "MusicBrainz error" });

    const data = await r.json(); // { count, offset, artists: [...] }
    res.json(data); // devolve cru para o front controlar
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.listen(4000, () => console.log("Proxy on http://localhost:4000"));
