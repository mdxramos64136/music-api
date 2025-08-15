import { useEffect, useState, useMemo } from "react";

function convertToFlag(countryCode) {
  if (!countryCode || typeof countryCode !== "string") return ""; /**?? */

  let code = countryCode.trim().toUpperCase();

  if (code === "UK") code = "GB";
  if (countryCode.length !== 2) return "";

  const A = 65;
  const isAZ = (c) => {
    const x = c.charCodeAt(0);
    return x >= A && x <= A + 25; /** Pq +25? */
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

      async function getPhoto() {
        try {
          setIsPhotoLoading(true);
          setPhotoError("");

          const res = await fetch(
            `http://localhost:4000/api/photos/artist?name=${encodeURIComponent(
              content.name
            )}`,
            { signal: abortController.signal }
          );

          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          //get only the property artists from API....
          const { artists } = await res.json();
          const bestMatch = artists?.[0];
          setArtistPhotoUrl(bestMatch?.photoUrl || null);
        } catch (err) {
          if (err.name !== "AbortError") setPhotoError(String(err));
        } finally {
          setIsPhotoLoading(false);
        }
      } //getPhoto
      getPhoto();
      return () => abortController.abort();
    },
    [content.name, setIsPhotoLoading]
  );

  //////////////////////////////////////
  return (
    <li className="group-card">
      {artistPhotoUrl ? (
        <img
          className="group-img"
          src={artistPhotoUrl}
          alt={`${content.name} `}
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
        />
      ) : isPhotoLoading ? (
        <p>Loading Photo</p>
      ) : (
        photoError
      )}

      <div>
        <h3 id="name" className="group-name">
          {content.name}
        </h3>

        <div className="group-country">
          {/* <label>Country:</label> */}
          <p>
            {`${flag} `} {content?.area?.name || ""}
          </p>
        </div>
      </div>
    </li>
  );
}

export default Group;

/**REMEMBER: always use bracket notation when dealing with object
 * property names that include a hyphen. 
 * Don't forget to remove th '.', unless you want to use optional chaining ?.
 * You can also normalise the property's names:
 * const normalized = {
  ...raw,
  lifeSpan: raw['life-span']
};
 * */
