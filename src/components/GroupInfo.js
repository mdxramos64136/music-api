function GroupInfo({ details }) {
  console.log(details.name);
  return (
    <li className="group-info">
      <h3 id="name">{details?.name}</h3>
      {/* <div className="begin-year">
        <label>Begin Year: </label>
        <p>{details?.["life-span"]?.begin || "-"}</p>
      </div> */}
      <div className="info-country">
        <label>Country:</label>
        <p>{details?.area?.name || ""}</p>
      </div>
      <div className="founded">
        <label>Founded:</label>
        <p>{details?.["life-span"]?.begin || "-"}</p>
      </div>
      <div className="activity">
        {details?.["life-span"]?.ended && (
          <>
            <label>Ceased Activity:</label>
            <p>
              {new Date(details?.["life-span"]?.end).toLocaleDateString(
                "pt-BR"
              )}
            </p>
          </>
        )}

        {details?.["life-span"]?.ended || (
          <>
            <label>Active:</label>
            <p>{details?.["life-span"]?.ended || "Yes"}</p>
          </>
        )}
      </div>
    </li>
  );
}

export default GroupInfo;
