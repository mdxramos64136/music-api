import { useEffect, useState } from "react";

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

  return (
    <li>
      {artistPhotoUrl ? (
        <img
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

      <h3 id="name">{content.name}</h3>

      <div>
        <label>Country:</label>
        <p>{content?.area?.name ? content.area.name : "-"}</p>
        <p>{content.country}</p>
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
