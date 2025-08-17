import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

//Deezer: just for pics

app.get("/api/photos/artist", async (req, res) => {
  try {
    const artistName = (req.query.name || req.query.q || "").trim();
    if (!artistName) {
      return res
        .status(400)
        .json({ error: "Missing name (or 'q') query param" });
    }

    //search
    const deezerSearchUrl = `https://api.deezer.com/search/artist?q=${encodeURIComponent(
      artistName
    )}`;

    const deezerResponse = await fetch(deezerSearchUrl);
    if (!deezerResponse.ok) {
      return res
        .status(deezerResponse.status)
        .json({ error: "Deezer search error" });
    }

    const deezerSearchResult = await deezerResponse.json();

    //normalize only what it's need
    const artistsWithPhotos = (deezerSearchResult.data || []).map((artist) => ({
      deezerId: artist.id,
      name: artist.name,
      photoUrl:
        artist.picture_xl ||
        artist.picture_big ||
        artist.picture_medium ||
        artist.picture_small ||
        artist.picture ||
        null,
      deezerLink: artist.link,
    }));

    return res.json({
      total: deezerSearchResult.total ?? artistsWithPhotos.length,
      artists: artistsWithPhotos,
    });
  } catch (err) {
    console.error("photos/artist error:", err);
    return res.status(500).json({ err: "Photos endpoint error" });
  }
});

// MusicBrainz:
app.get("/api/artist", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "q is required" });

    const limit = Number(req.query.limit || 10);
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
