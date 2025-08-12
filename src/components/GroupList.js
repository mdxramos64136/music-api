import Group from "./Group";

function GroupList({ content }) {
  return (
    <ul className="group-list">
      {content.map((group) => (
        <Group id={content.artists.id} content={content} />
      ))}
    </ul>
  );
}

export default GroupList;

// - Country (transforma em emoji)
// - .area.name (País)
// - .begin-area.name
// - .life-span.begin (início)
// - .life-span.ended (A banda acabou?)
