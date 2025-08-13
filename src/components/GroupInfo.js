function GroupInfo(content) {
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

export default GroupInfo;
