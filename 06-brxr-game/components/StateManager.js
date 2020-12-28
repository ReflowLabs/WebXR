// import { useEffect } from "react";
import useSocket from "../hooks/useSocket";
import Dude from "./Dude";
// import Gui from "./Gui";
import Snowballs from "./Snowballs";

const StateManager = () => {
  const [state, setState] = useSocket();

  // useEffect(() => {
  //   setInterval(() => {
  //     setState((s) => ({
  //       hry: parseFloat(parseFloat(s.hry || 0) + 0.01).toFixed(3),
  //     }));
  //   }, 300);
  // }, []);

  if (!state.ready) {
    return null;
  }
  return (
    <>
      {/* <Gui state={state} /> */}
      <Snowballs update={setState} />
      <Dude state={state} />
    </>
  );
};
export default StateManager;
