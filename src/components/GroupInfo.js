import AlbumList from "./AlbumList";
import About from "./About";
//import ImageCarousel from "./ImageCarousel";
import ImageCarousel from "./ImageCarousel";
function GroupInfo({ details, selected, albums, coverArt, about, content }) {
  console.log(coverArt);
  return (
    <div className="group-info-container">
      <ImageCarousel
        images={about?.images || []}
        title={about?.title || details?.name}
      />
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
