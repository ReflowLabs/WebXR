// import { useEffect } from "react";
import useSocket from "../hooks/useSocket";
import Dude from "./Dude";
import Gui from "./Gui";
import Snowballs from "./Snowballs";

const StateManager = () => {
  const [state, setState] = useSocket();

  if (!state.ready) {
    return null;
  }

  return (
    <>
      <Gui state={state} />
      <Snowballs update={setState} />
      <Dude state={state} />
    </>
  );
};
export default StateManager;
