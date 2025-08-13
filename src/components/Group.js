function Group({ content }) {
  return (
    <li>
      <h3 id="name">{content.name}</h3>
      <div>
        <label>Begin Year: </label>
        <p>{content?.["life-span"]?.begin}</p>
      </div>
      <div>
        <label>Country:</label>
        <p>{content?.area?.name ? content.area.name : "-"}</p>
        <p>{content.country}</p>
      </div>
      <div>
        <label>Founded:</label>
        <p>{content?.["life-span"].begin}</p>
        {content?.["life-span"].ended && (
          <>
            <label>Ceased Activity:</label>
            <p>{content?.["life-span"].end}</p>
          </>
        )}

        {content?.["life-span"].ended || (
          <>
            <label>Active:</label>
            <p>{content?.["life-span"].ended || "Yes"}</p>
          </>
        )}
      </div>
    </li>
  );
}

export default Group;

/**REMEMBER: always use bracket notation when dealing with object
 * property names that include a hyphen. 
 * Don't forget to remove th '.', unless you want to use optional chaining ?.
 * You can also normalise the property's names:
 * const normalized = {
  ...raw,
  lifeSpan: raw['life-span']
};
 * */
