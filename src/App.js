import { useEffect, useState } from "react";
import Logo from "./components/Logo";
import GroupList from "./components/GroupList";
import GroupInfo from "./components/GroupInfo";
import Spinner from "./components/Spinner";
import Header from "./components/Header";

const BASE_URL = "http://localhost:4000/api/artist";

function App() {
  //States
  const [content, setContent] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [details, setDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selected, setSelected] = useState(null); //MBDI

  const [albums, setAlbums] = useState([]);
  const [members, setMembers] = useState([]);
  const [coverArt, setCoverArt] = useState({}); // opcional

  //////////// General ////////////
  function guessWikiTitle(name, type) {
    const n = (name || "").trim();
    if (!n) return "";

    return type === "Group" ? `${n} (band)` : n;
  }

  //////////// useEffect's ////////////
  useEffect(
    function () {
      if (!query.trim() || query.length < 3) return;
      const controller = new AbortController();

      async function getContent() {
        setIsLoading(true);
        setError("");
        try {
          const res = await fetch(
            `${BASE_URL}?q=${encodeURIComponent(query)}&limit=3`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error(`Something went wrong:${res.status}`);

          const data = await res.json();
          setContent(data.artists ?? []);

          setSelected(null);
        } catch (err) {
          if (err.message !== "AbortError") setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      getContent();
      return () => controller.abort();
    },
    [query]
  );

  //////////// Details ////////////
  useEffect(
    function () {
      if (!selected) return;
      const controller = new AbortController();

      async function getDetails() {
        try {
          setIsLoadingDetails(true);
          setError("");
          const res = await fetch(`${BASE_URL}/${selected}`, {
            signal: controller.signal,
          });

          if (!res.ok) throw new Error(`Something went wrong:${res.status}`);

          const dataDetails = await res.json();
          setDetails(dataDetails);

          console.log("Details: ", dataDetails);
        } catch (err) {
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoadingDetails(false);
        }
      }
      getDetails();
      return () => controller.abort();
    },
    [selected]
  );
  //////////// Albuns ////////////
  useEffect(() => {
    if (!selected) return;

    fetch(
      `http://localhost:4000/api/artist/${selected}/release-groups?type=album&limit=30`
    )
      .then((res) => res.json())
      .then((data) => setAlbums(data["release-groups"] || []))
      .catch(console.error);
  }, [selected]);

  //////////// Members ////////////
  useEffect(() => {
    if (!selected) return;
    // 2) membros (relações)
    fetch(`http://localhost:4000/api/artist/${selected}/members`)
      .then((r) => r.json())
      .then((data) => setMembers(data.relations || []))
      .catch(console.error);
  }, [selected]);

  //////////// Art Cover - Cover Art Archive////////////
  useEffect(() => {
    async function loadCovers() {
      const entries = await Promise.all(
        albums.map(async (rg) => {
          const res = await fetch(
            `http://localhost:4000/api/cover/release-group/${rg.id}`
          );
          const data = await res.json();
          const thumb =
            data.front?.thumbnails?.small || data.front?.image || null;
          return [rg.id, thumb];
        })
      );
      setCoverArt(Object.fromEntries(entries));
    }
    if (albums.length) loadCovers();
  }, [albums]);

  function onSelected(id) {
    setSelected(id === selected ? null : id);
  }

  ////////////////////////////////////////////
  return (
    <div className="app">
      <Header query={query} setQuery={setQuery} />
      <main className="main">
        {query ? (
          <section className="columns">
            {isLoading ? (
              <div className="group-info details-loading">
                <Spinner />
              </div>
            ) : (
              <GroupList
                content={content}
                selected={selected}
                onSelected={onSelected}></GroupList>
            )}
            {isLoadingDetails ? (
              <div className="group-info details-loading">
                <Spinner />
              </div>
            ) : (
              <GroupInfo
                details={details}
                selected={selected}
                albums={albums}
                coverArt={coverArt}
                content={content}
              />
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}

export default App;
