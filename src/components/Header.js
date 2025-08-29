import Logo from "./Logo";

function Header({ query, setQuery }) {
  return (
    <header className="header">
      <div className="logo-title">
        <Logo />
        <h1>Info Music</h1>
      </div>
      <input
        className="input"
        type="text"
        placeholder="Type the artist or group name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </header>
  );
}

export default Header;
