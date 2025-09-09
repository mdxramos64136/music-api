import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());

//////////// Deezer - manys pics for carousel ////////////
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

///////////////////// MusicBrainz - Main pic /////////////////////
// GET /api/artist/:id/photo
app.get("/api/artist/:id/photo", async (req, res) => {
  try {
    const id = (req.params.id || "").trim();
    if (!id) return res.status(400).json({ error: "Missing id" });

    // 1. Busca o artista com relations (wikidata)
    const mbUrl = `https://musicbrainz.org/ws/2/artist/${encodeURIComponent(
      id
    )}?fmt=json&inc=url-rels`;
    const r = await fetch(mbUrl, {
      headers: { "User-Agent": "InfoBand/1.0 (marceldramos@gmail.com)" },
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: "MusicBrainz error" });
    }

    const data = await r.json();

    // 2. Procura relação do tipo "wikidata"
    const wikidataRel = data.relations?.find(
      (rel) => (rel.type || "").toLowerCase() === "wikidata"
    );
    const wikidataUrl = wikidataRel?.url?.resource;
    if (!wikidataUrl) {
      return res.json({ id, name: data.name, photoUrl: null });
    }

    // 3. Extrai QID do wikidata (ex: Q10795)
    const qid = wikidataUrl.split("/").pop();

    // 4. Busca dados no Wikidata
    const wdUrl = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
    const wdResp = await fetch(wdUrl);
    if (!wdResp.ok) {
      return res
        .status(wdResp.status)
        .json({ error: "Wikidata fetch error", qid });
    }
    const wdData = await wdResp.json();
    const entity = wdData.entities[qid];

    // 5. Procura propriedade P18 (image)
    const p18 = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if (!p18) {
      return res.json({ id, name: data.name, photoUrl: null });
    }

    // 6. Monta URL do Wikimedia Commons
    const commonsUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
      p18
    )}`;

    return res.json({
      id,
      name: data.name,
      photoUrl: commonsUrl,
    });
  } catch (err) {
    console.error("artist photo error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

//////////// MusicBrainz - General Info ////////////
app.get("/api/artist", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "q is required" });

    const limit = Number(req.query.limit || 10);
    const offset = Number(req.query.offset || 0);

    // * is a wild car and acceptes both uppercase and lowercase
    const url = `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(
      q
    )}* &limit=${limit}&offset=${offset}&fmt=json`;

    const r = await fetch(url, {
      headers: { "User-Agent": "MyMusicApp/1.0 (marceldramos@gmail.com)" },
    });

    if (!r.ok) return res.status(r.status).json({ error: "MusicBrainz error" });

    const data = await r.json(); // { count, offset, artists: [...] }
    res.json(data);
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

//////////// BIO - LastFM API ////////////
app.get("/api/lastfm/about", async (req, res) => {
  try {
    const artist = (req.query.artist || "").trim();
    if (!artist) return res.status(400).json({ error: "artist is required" });

    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist=${encodeURIComponent(
      artist
    )}&autocorrect=1&api_key=${process.env.LASTFM_API_KEY}&format=json`;

    const resLastfm = await fetch(url, {
      headers: { "User-Agent": "InfoBand/1.0 (marceldramos@gmail.com)" },
    });

    if (!resLastfm.ok) {
      return res.status(resLastfm.status).json({ error: "lastfm error" });
    }

    const data = await resLastfm.json();
    const a = data.artist || {};

    const bioHtml = a.bio?.content || "";
    const sentences = bioHtml
      .replace(/<a[^>]*>.*?<\/a>/gi, "")
      .replace(/<[^>]+>/g, "") // remove tags
      .split(/(?<=\.)\s+/) // brake the phrases
      .filter(Boolean);

    //How many sentences?
    const paragraphs = sentences.slice(0, 10);

    return res.json({
      source: "lastfm",
      title: a.name || artist,
      bio: paragraphs,
      pageUrl: a.url || null,
    });
  } catch (err) {
    console.error("lastfm/about error:", err);
    return res.status(500).json({ error: "server error" });
  }
});

//////////// Wikipedia API - Images////////////
app.get("/api/wiki/images", async (req, res) => {
  try {
    const rawTitle = (req.query.title || "").trim();
    const lang = (req.query.lang || "en").trim();
    if (!rawTitle) return res.status(400).json({ error: "title is required" });

    const userAgent = { "User-Agent": "InfoBand/1.0 (marceldramos@gmail.com)" };
    const encodedTitle = encodeURIComponent(rawTitle);

    const mediaUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/media-list/${encodedTitle}`;

    const mediaResp = await fetch(mediaUrl, { headers: userAgent });
    if (!mediaResp.ok) {
      return res
        .status(mediaResp.status)
        .json({ error: "wikipedia media error" });
    }

    const mediaData = await mediaResp.json();

    const images = (mediaData.items || [])
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
      .slice(0, 5);

    return res.json({
      source: "wikipedia",
      title: rawTitle,
      images,
    });
  } catch (err) {
    console.error("wiki/images error:", err);
    return res
      .status(500)
      .json({ error: "server error", details: String(err) });
  }
});
//////////////////////////////////////////////
app.listen(4000, "0.0.0.0", () =>
  console.log("Server running on http://0.0.0.0:4000")
);
