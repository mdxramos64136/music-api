import express from "express";
import cors from "cors"; // <-- CORS global

const app = express();
app.use(cors());

//Group/ Artist Info
app.get("/api/artist", async (req, res) => {
  const q = req.query.q || "queen";
  const URL = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(
    q
  )}&fmt=json`;

  try {
    const mbRes = await fetch(URL, {
      headers: {
        "User-Agent": "MyMusicApp/1.0 (marceldramos@gmail.com)",
      },
    });

    const data = await mbRes.json();

    // Enablee CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: String(err) });
  }
});

app.listen(4000, () => console.log("Proxy on http://localhost:4000"));
