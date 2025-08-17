import { ScaleLoader } from "react-spinners";
function Spinner() {
  return (
    <div>
      <ScaleLoader
        color="#808080"
        loading={true}
        height={30}
        width={3}
        speedMultiplier={2}
      />
    </div>
  );
}

export default Spinner;
