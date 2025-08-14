import { useEffect, useState } from "react";

// function convertToEmoji(countryCode) {
//   const codePoints = countryCode
//     .toUpperCase()
//     .split("")
//     .map((char) => 127397 + char.charCodeAt());
//   return String.fromCodePoint(...codePoints);
// }

function Group({ content }) {
  const [artistPhotoUrl, setArtistPhotoUrl] = useState(null);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");

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
            {`${content.country} `} {content?.area?.name || ""}
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
