import AlbumList from "./AlbumList";
import About from "./About";
import ImageCarousel from "./ImageCarousel";
import { useEffect, useState } from "react";

function GroupInfo({ details, selected, albums, coverArt, about, content }) {
  //console.log(coverArt);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (!selected) return;

    const selectedEntry = (content || []).find((a) => a.id === selected);
    const name = selectedEntry?.name || details?.name;
    const type = selectedEntry?.type || details?.type;
    const title = type === "Group" ? `${name} (band)` : name;
    if (!title) return;

    fetch(
      `http://localhost:4000/api/wiki/images?title=${encodeURIComponent(
        title
      )}&lang=en`
    )
      .then((res) => res.json())
      .then((data) => setImages(data.images || []))
      .catch(console.error);
  }, [selected]);

  return (
    <div className="group-info-container">
      <ImageCarousel images={images} title={details?.name} />
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
                {new Date(details?.["life-span"]?.begin).getFullYear() || "-"}
              </p>
            </div>
            <div className="activity">
              {details?.["life-span"]?.ended && (
                <>
                  <label>Ceased Activity:</label>
                  <p>
                    {new Date(details?.["life-span"]?.end).toLocaleDateString(
                      "pt-BR"
                    )}
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
  );
}

export default GroupInfo;
