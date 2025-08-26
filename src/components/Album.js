import { useEffect, useState } from "react";
import pic_placeholder from "../assets/pic_placeholder.png";
import Spinner from "./Spinner";

function Album({ album, selected, coverArt }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const url = coverArt?.[album.id];

  // reset the states whenever url ou albums change
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [url, album.id]);

  const showSpinner = url === undefined || (typeof url === "string" && !loaded);
  const showPlaceholder = url === null || failed;

  return (
    <div className="album">
      <div className="thumb">
        {showSpinner && (
          <div className="thumb-overlay">
            <Spinner />
          </div>
        )}

        {url && !failed && (
          <img
            src={url}
            alt={`${album.title} cover`}
            className={`album-img ${loaded && !failed ? "is-loaded" : ""}`}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setFailed(true);
              setLoaded(true); // Spinner disaperar
            }}
          />
        )}

        {showPlaceholder && (
          <img
            src={pic_placeholder}
            alt="no cover"
            className="album-img is-loaded"
          />
        )}
      </div>

      <div className="album-detail">
        <h4 className="album-title">{album.title}</h4>
        <p>
          {new Date(album["first-release-date"]).toLocaleDateString("pt-BR")}
        </p>
      </div>
    </div>
  );
}

export default Album;
