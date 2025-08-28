import musicalnotes from "../assets/musical-notes.webp";

function Logo() {
  return (
    <div>
      <img className="logo" src={musicalnotes} alt="rock logo" />
    </div>
  );
}

export default Logo;
