import Album from "./Album";

function AlbumList({ albums, selected, coverArt }) {
  return (
    <div>
      {albums.map((album) => {
        return (
          <Album
            key={album.id}
            album={album}
            selected={selected}
            coverArt={coverArt}
          />
        );
      })}
    </div>
  );
}

export default AlbumList;
