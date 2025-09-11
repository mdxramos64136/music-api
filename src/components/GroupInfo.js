import AlbumList from "./AlbumList";
import About from "./About";
import ImageCarousel from "./ImageCarousel";
import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import { Helmet } from "@dr.pogodin/react-helmet";

function GroupInfo({ details, selected, albums, coverArt, about, content }) {
  //console.log(coverArt);
  const [images, setImages] = useState([]);

  // For React-Helmet (dr.pogodin)
  const title = details?.name ? `${details.name} – Info Music` : "Info Music";
  const desc = details?.name
    ? `${details.name} on Info Music: photos, bio, years active, country of origin, and discography with cover art.`
    : "Info Music: search bands and artists. Photos, bios, discography and cover art.";
  const image =
    images?.[0]?.url || "https://info-music-mr.onrender.com//og-fallback.jpg";
  const canonical = selected
    ? `https://info-music-mr.onrender.com/artist/${selected}`
    : "https://info-music-mr.onrender.com/";

  useEffect(() => {
    if (!selected) return;

    const selectedEntry = (content || []).find((a) => a.id === selected);
    const name = details?.name || selectedEntry?.name;
    const type = details?.type || selectedEntry?.type;
    const title = type === "Group" ? `${name} (band)` : name;
    if (!title) return;

    fetch(
      `${API_BASE}/api/wiki/images?title=${encodeURIComponent(title)}&lang=en`
    )
      .then((res) => res.json())
      .then((data) => setImages(data.images || []))
      .catch(console.error);
  }, [selected]);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />

        {/* Open Graph / Twitter */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={image} />
      </Helmet>
      {selected && (
        <div className="group-info-container">
          {selected && <ImageCarousel images={images} title={details?.name} />}
          <li className="group-info">
            {selected && (
              <>
                <h3 id="name">{details?.name}</h3>

                <div className="info-country">
                  <label>Country:</label>
                  <p>{details?.area?.name || ""}</p>
                </div>
                <div className="founded">
                  <label>Founded:</label>
                  <p>
                    {new Date(details?.["life-span"]?.begin).getFullYear() ||
                      "-"}
                  </p>
                </div>
                <div className="activity">
                  {details?.["life-span"]?.ended && (
                    <>
                      <label>Ceased Activity:</label>
                      <p>
                        {new Date(
                          details?.["life-span"]?.end
                        ).toLocaleDateString("pt-BR")}
                      </p>
                    </>
                  )}

                  {details?.["life-span"]?.ended || (
                    <>
                      <label>Active:</label>
                      <p>{details?.["life-span"]?.ended || "Yes"}</p>
                    </>
                  )}
                  <About about={about} content={content} selected={selected} />
                  <AlbumList
                    albums={albums}
                    selected={selected}
                    coverArt={coverArt}
                  />
                </div>
              </>
            )}
          </li>
        </div>
      )}
    </>
  );
}

export default GroupInfo;
