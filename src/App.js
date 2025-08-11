import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:4000/api";

function App() {
  const [content, setContent] = useState([]);

  useEffect(function () {
    async function fetchContent() {
      try {
        const res = await fetch(`${BASE_URL}/artist?q=queen`);

        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();

        setContent(data);

        const rows = data.artists.map((a) => ({
          name: a.name,
          type: a.type,
          country: a.country,
          disambiguation: a.disambiguation,
          id: a.id,
          score: a.score,
        }));

        console.table(rows); // fica legível no console
      } catch (e) {
        console.error("Error when fetching data", e);
      }
    }
    fetchContent();
  }, []);

  console.log(content);

  ////////////////////////////////////////////
  return (
    <div className="App">
      <p>My app</p>
    </div>
  );
}

export default App;
