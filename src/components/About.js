function About({ wikiAbout, wikiError, isWikiLoading }) {
  if (isWikiLoading) return <p>Carregando resumo…</p>;
  if (wikiError) return <p style={{ color: "crimson" }}>Erro: {wikiError}</p>;
  if (!wikiAbout) return null; // nada a mostrar ainda
  return (
    <div>
      <img
        src={wikiAbout.thumbnail}
        alt={wikiAbout.title}
        style={{ width: 140, float: "right", borderRadius: 8, marginLeft: 12 }}
        onError={(e) => (e.currentTarget.style.display = "none")}
      />
      <p>
        <a href={wikiAbout.pageUrl} target="_blank" rel="noreferrer">
          Saiba mais na Wikipedia
        </a>
      </p>

      <div
        className="history-gallery"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 8,
          clear: "both",
          marginTop: 12,
        }}>
        {wikiAbout?.extract && <p>{wikiAbout.extract}</p>}
        {wikiAbout.images.slice(0, 12).map((img, i) => (
          <img
            key={i}
            src={img.thumbnail || img.url}
            alt={img.title || wikiAbout.title}
            style={{
              width: "100%",
              aspectRatio: "1/1",
              objectFit: "cover",
              borderRadius: 8,
            }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ))}
      </div>
    </div>
  );
}

export default About;
