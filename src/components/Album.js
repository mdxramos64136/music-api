import pic_placeholder from "../assets/pic_placeholder.png";
function Album({ album, selected, coverArt }) {
  const src = coverArt?.[album.id] ?? pic_placeholder;
  return (
    <div className="album">
      {selected && (
        <>
          <img src={src} alt="album art" loading="lazy" />
          <div className="album-detail">
            <h4>{album.title}</h4>
            <p>
              {new Date(album["first-release-date"]).toLocaleDateString(
                "pt-BR"
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Album;
