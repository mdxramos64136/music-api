import { useEffect, useState } from "react";
import Logo from "./components/Logo";
import GroupList from "./components/GroupList";

const BASE_URL = "http://localhost:4000/api/artist";

function App() {
  const [content, setContent] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [details, setDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selected, setSelected] = useState(null); //MBDI

  useEffect(
    function () {
      if (!query.trim() || query.length < 3) return;
      const controller = new AbortController();

      async function getContent() {
        setIsLoading(true);
        setError("");
        try {
          const res = await fetch(
            `${BASE_URL}?q=${encodeURIComponent(query)}&limit=15`,
            { signal: controller.signal }
          );

          if (!res.ok) throw new Error(`Something went wrong:${res.status}`);

          const data = await res.json();
          setContent(data.artists ?? []);
          setDetails(null);
          setSelected(null);

          console.log("SEARCH RESULT:", data.artists);
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
  // useEffect(() => {
  //   if (content) console.log("RESULT:", content.artists);
  // }, [content]);

  ////////////////////////////////////////////////////////////////////
  /** useEffect for Details */
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

          console.log("Details: ", dataDetails);
        } catch (err) {
          if (err.name !== "AbortError") setError(err.message);
        } finally {
          setIsLoadingDetails(false);
        }
      }
      return () => controller.abort();
    },
    [selected]
  );

  ////////////////////////////////////////////
  return (
    <div className="App">
      <header className="header">
        <Logo />
        <input
          className="input"
          type="text"
          placeholder="Type the artist or group name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>
      <main className="main">
        <div>
          <GroupList content={content}></GroupList>
        </div>
      </main>
    </div>
  );
}

export default App;
