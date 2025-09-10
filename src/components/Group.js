import { useEffect, useState, useMemo } from "react";
import pic_placeholder from "../assets/pic_placeholder.png";
import Spinner from "./Spinner";
import { apiFetch, API_BASE } from "../lib/api";

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

function Group({ content, onSelect, isSelected }) {
  const [artistPhotoUrl, setArtistPhotoUrl] = useState(undefined);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  //const [flag, setFlag] = useState(null);

  const countryCode =
    content.country ||
    (content.area?.type === "Country"
      ? content.area?.["iso-3166-1-codes"]?.[0]
      : null);

  const flag = useMemo(() => convertToFlag(countryCode), [countryCode]);

  useEffect(() => {
    if (!content?.id) return;
    const abortController = new AbortController();
    setArtistPhotoUrl(undefined);

    async function getPhoto() {
      try {
        setIsPhotoLoading(true);
        setPhotoError("");

        // const res = await fetch(
        //   `http://192.168.2.128:4000/api/artist/${content.id}/photo`,
        //   { signal: abortController.signal }
        // );

        const res = await fetch(`${API_BASE}/api/artist/${content.id}/photo`, {
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        setArtistPhotoUrl(data.photoUrl ?? null);
        // if (data.photoUrl) {
        //   setArtistPhotoUrl(data.photoUrl);
        // } else {
        //   setArtistPhotoUrl(null);
        // }
      } catch (err) {
        if (err.name !== "AbortError") {
          setPhotoError(String(err));
        }
      } finally {
        setIsPhotoLoading(false);
      }
    }

    getPhoto();
    return () => abortController.abort();
  }, [content.id]);

  const imgSrc = artistPhotoUrl ?? pic_placeholder;

  //////////////////////////////////////
  return (
    <li
      className={`group-card ${isSelected ? "is-selected" : ""}`}
      onClick={() => onSelect()}>
      <div className="thumb">
        {artistPhotoUrl === undefined ? (
          <div className="thumb-overlay">
            <Spinner />
          </div>
        ) : (
          <img
            className="group-img"
            src={artistPhotoUrl || pic_placeholder}
            alt={content.name}
            onError={(e) => (e.currentTarget.src = pic_placeholder)}
          />
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
