import express from "express";
import cors from "cors";
import "dotenv/config"; // se já usa outra forma de carregar .env, pode remover esta linha

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

//////////// MusicBrainz - General Info ////////////
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
//////////// MusicBrainz - Details ////////////
app.get("/api/artist/:id", async (req, res) => {
  try {
    const id = (req.params.id || "").trim();

    if (!id) return res.status(400).json({ error: "Missing id" });

    const url = `https://musicbrainz.org/ws/2/artist/${encodeURIComponent(
      id
    )}?fmt=json`;

    const r = await fetch(url, {
      headers: { "User-Agent": "InfoBand/1.0 (marceldramos@gmail.com)" },
    });

    if (!r.ok)
      return res.status(r.status).json({ error: "MusicBrainz details error" });

    const data = await r.json();
    return res.json(data);
  } catch (e) {
    console.error("artist details error:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

//////////// Albuns ////////////
app.get("/api/artist/:id/release-groups", async (req, res) => {
  try {
    const id = (req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id" });

    const type = (req.query.type || "album").trim(); // album | single | ep | ...
    const limit = Number(req.query.limit || 20);
    const offset = Number(req.query.offset || 0);

    const url = `https://musicbrainz.org/ws/2/release-group?artist=${encodeURIComponent(
      id
    )}&type=${encodeURIComponent(
      type
    )}&limit=${limit}&offset=${offset}&fmt=json`;

    const r = await fetch(url, {
      headers: { "User-Agent": "InfoBand/1.0 (marceldramos@gmail.com)" },
    });
    if (!r.ok)
      return res.status(r.status).json({ error: "MB release-group error" });

    const data = await r.json(); // { 'release-groups': [...] }
    res.json(data);
  } catch (e) {
    console.error("release-groups error:", e);
    res.status(500).json({ error: "server error" });
  }
});

//////////// Album Cover art: Cover Art Archive ////////////
app.get("/api/cover/release-group/:rgid", async (req, res) => {
  try {
    const rgid = (req.params.rgid || "").trim();
    if (!rgid) return res.status(400).json({ error: "Missing rgid" });

    const url = `https://coverartarchive.org/release-group/${encodeURIComponent(
      rgid
    )}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: "CAA error" });

    const data = await r.json(); // { images: [...] }

    const front = (data.images || []).find((img) => img.front);
    res.json({ front: front || null, images: data.images || [] });
  } catch (e) {
    console.error("cover (rg) error:", e);
    res.status(500).json({ error: "server error" });
  }
});

//////////// Members ////////////
app.get("/api/artist/:id/members", async (req, res) => {
  try {
    const id = (req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id" });

    const url = `https://musicbrainz.org/ws/2/artist/${encodeURIComponent(
      id
    )}?fmt=json&inc=artist-rels`;

    const r = await fetch(url, {
      headers: { "User-Agent": "InfoBand/1.0 (marceldramos@gmail.com)" },
    });
    if (!r.ok) return res.status(r.status).json({ error: "MB members error" });

    const data = await r.json();

    const rels = (data.relations || []).filter((rel) =>
      (rel.type || "").toLowerCase().includes("member")
    );
    res.json({ relations: rels });
  } catch (e) {
    console.error("members error:", e);
    res.status(500).json({ error: "server error" });
  }
});

//////////// History ////////////
// GET /api/wiki/about?title=Queen_(band)&lang=pt
app.get("/api/wiki/about", async (req, res) => {
  try {
    const rawTitle = (req.query.title || "").trim();
    const lang = (req.query.lang || "en").trim(); // "pt", "en", etc.
    if (!rawTitle) return res.status(400).json({ error: "title is required" });

    const userAgent = { "User-Agent": "InfoBand/1.0 (marceldramos@gmail.com)" };
    const encodedTitle = encodeURIComponent(rawTitle);

    // Endpoints REST oficiais do Wikimedia
    const summaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;
    const mediaUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/media-list/${encodedTitle}`;

    // Busca resumo + lista de mídias em paralelo
    const [summaryResp, mediaResp] = await Promise.all([
      fetch(summaryUrl, { headers: userAgent }),
      fetch(mediaUrl, { headers: userAgent }),
    ]);

    if (!summaryResp.ok) {
      return res
        .status(summaryResp.status)
        .json({ error: "wikipedia summary error" });
    }

    const summaryData = await summaryResp.json();
    let images = [];

    if (mediaResp.ok) {
      const mediaData = await mediaResp.json();
      // Pega apenas itens de imagem e escolhe um URL "melhor" disponível
      images = (mediaData.items || [])
        .filter((item) => item.type === "image")
        .map((item) => {
          const srcset = item.srcset || [];
          const bestFromSrcset = srcset.length
            ? srcset[srcset.length - 1]?.src
            : null;
          const original = item.original?.source || null;
          const url = bestFromSrcset || original || item.src || null;
          const thumb = item.thumbnail?.source || srcset[0]?.src || url;
          return { title: item.title || null, url, thumbnail: thumb };
        })
        .filter((img) => !!img.url)
        .slice(0, 24); // limita p/ não exagerar
    }

    return res.json({
      source: "wikipedia",
      title: summaryData.title,
      extract: summaryData.extract, // texto do resumo
      pageUrl: summaryData.content_urls?.desktop?.page || null, // link "Saiba mais"
      thumbnail: summaryData.thumbnail?.source || null,
      images,
    });
  } catch (err) {
    console.error("wiki/about error:", err);
    return res
      .status(500)
      .json({ error: "server error", details: String(err) });
  }
});

app.listen(4000, () => console.log("Proxy on http://localhost:4000"));
