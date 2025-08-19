import Group from "./Group";

function GroupList({ content, selected, onSelected }) {
  return (
    <ul className="group-list">
      {content.map((group) => (
        <Group
          key={group.id}
          content={group}
          onSelect={() => onSelected(group.id)}
          isSelected={selected === group.id}
        />
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
