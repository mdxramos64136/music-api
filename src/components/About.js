import { useEffect, useState } from "react";
import { apiFetch, API_BASE } from "../lib/api";

function About({ selected, content, details }) {
  const [about, setAbout] = useState(null);
  const [isAboutLoading, setIsAboutLoading] = useState(false);
  const [aboutError, setAboutError] = useState("");

  //////////// BIO (Last.fm)////////////
  useEffect(() => {
    if (!selected) {
      setAbout(null);
      setAboutError("");
      setIsAboutLoading(false);
      return;
    }

    const selectedEntry = (content || []).find((a) => a.id === selected);
    const name = selectedEntry?.name || details?.name;
    if (!name) return;

    const ctrl = new AbortController();

    async function getAbout() {
      try {
        setIsAboutLoading(true);
        setAboutError("");
        setAbout(null);

        // const res = await fetch(
        //   `http://192.168.2.128:4000/api/lastfm/about?artist=${encodeURIComponent(
        //     name
        //   )}`,
        //   { signal: ctrl.signal }
        // );

        const res = await fetch(
          `${API_BASE}/api/lastfm/about?artist=${encodeURIComponent(name)}`,
          { signal: ctrl.signal }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json(); // { title, extract, pageUrl, thumbnail, images }
        setAbout(data);
      } catch (err) {
        if (err.name !== "AbortError") setAboutError(String(err));
      } finally {
        setIsAboutLoading(false);
      }
    }

    getAbout();
    return () => ctrl.abort();
  }, [selected, content, details]);

  if (!about) return null; // nada a mostrar ainda
  return (
    <div>
      <div className="about">
        {Array.isArray(about.bio) ? (
          about.bio.map((p, i) => <p key={i}>{p}</p>)
        ) : (
          <p>{about.bio}</p>
        )}

        {/* Learn More */}
        <div className="learn-more">
          <p>
            <a href={about.pageUrl} target="_blank" rel="noreferrer">
              Learn More...
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
