function About({ wikiAbout, wikiError, isWikiLoading }) {
  //if (isWikiLoading) return <p>Carregando resumo…</p>;
  //if (wikiError) return <p style={{ color: "crimson" }}>Erro: {wikiError}</p>;
  if (!wikiAbout) return null; // nada a mostrar ainda
  return (
    <div>
      <div className="about">
        {wikiAbout?.extract && <p>{wikiAbout.extract}</p>}

        {/* Learn More */}
        <div className="learn-more">
          <p>
            <a href={wikiAbout.pageUrl} target="_blank" rel="noreferrer">
              Learn More...
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
