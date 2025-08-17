import { useEffect, useState, useMemo } from "react";
import pic_placeholder from "../assets/pic_placeholder.png";
import Spinner from "./Spinner";

function convertToFlag(countryCode) {
  if (!countryCode || typeof countryCode !== "string") return ""; /**?? */

  let code = countryCode.trim().toUpperCase();

  if (code === "UK") code = "GB";
  if (code.length !== 2) return "";

  const A = 65;
  const isAZ = (c) => {
    const x = c.charCodeAt(0);
    return x >= A && x <= A + 25; // A = 65. Z = 90. So it checks if the letter is in this interval
  };

  if (!isAZ(code[0]) || !isAZ(code[1])) return "";

  //regional indicator =0x1F1E6 + (letra - 'A')
  const codePoints = [...code].map((ch) => 0x1f1e6 + (ch.charCodeAt(0) - A));
  return String.fromCodePoint(...codePoints);
}

function Group({ content }) {
  const [artistPhotoUrl, setArtistPhotoUrl] = useState(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  //const [flag, setFlag] = useState(null);

  const countryCode =
    content.country ||
    (content.area?.type === "Country"
      ? content.area?.["iso-3166-1-codes"]?.[0]
      : null);

  const flag = useMemo(() => convertToFlag(countryCode), [countryCode]);

  useEffect(
    function () {
      if (!content?.name) return;
      const abortController = new AbortController();

      let cancelled = false;

      async function getPhoto() {
        try {
          setIsPhotoLoading(true);
          setPhotoError("");
          setArtistPhotoUrl(null); // evita piscar imagem anterior ?????

          const res = await fetch(
            `http://localhost:4000/api/photos/artist?name=${encodeURIComponent(
              content.name
            )}`,
            { signal: abortController.signal }
          );

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          //get only the property artists from API....
          const { artists } = await res.json();
          const url = artists?.[0]?.photoUrl ?? null;

          setArtistPhotoUrl(url);
          if (!url) return;

          // Pre-Load the img outside the DOM and then updates the state
          const img = new Image();
          img.onload = () => {
            if (cancelled) return;
            setArtistPhotoUrl(url);
            setIsPhotoLoading(false);
          };
          img.onerror = () => {
            if (cancelled) return;
            setPhotoError("Failed to load the image!");
            setArtistPhotoUrl(null);
            setIsPhotoLoading(false);
          };

          img.src = url; // fires the download

          //
        } catch (err) {
          if (err.name !== "AbortError") {
            setPhotoError(String(err));
            setIsPhotoLoading(false);
          }
        }
      } //getPhoto
      getPhoto();
      return () => abortController.abort();
    },
    [content.name]
  );

  const imgSrc = artistPhotoUrl ?? pic_placeholder;

  //////////////////////////////////////
  return (
    <li className="group-card">
      <div className="thumb">
        <img
          className="group-img"
          src={artistPhotoUrl ?? pic_placeholder}
          alt={content.name}
          onLoad={() => setIsPhotoLoading(false)}
          onError={(e) => {
            e.currentTarget.src = pic_placeholder;
            setIsPhotoLoading(false);
          }}
          style={{ visibility: isPhotoLoading ? "hidden" : "visible" }}
        />
        {isPhotoLoading && (
          <div className="thumb__overlay">
            <Spinner />
          </div>
        )}
      </div>

      <div>
        <h3 id="name" className="group-name">
          {content.name}
        </h3>

        <div className="group-country">
          <p>
            {`${flag} `} {content?.area?.name || ""}
          </p>
        </div>
      </div>
    </li>
  );
}

export default Group;
