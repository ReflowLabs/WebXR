import { useRef, useState, useEffect } from "react";
import io from "socket.io-client";

export default function useSocket() {
  const [state, setState] = useState({});

  const socket = useRef();

  useEffect(() => {
    socket.current = io();
    socket.current.on("init", (state) => setState(state));
    socket.current.on("update", (update) => {
      setState({ ...state, ...update });
    });

    console.log("connected", socket.current);
    return () => {
      socket.current.disconnect();
    };
  }, []);

  function update(newState) {
    setState((s) => ({ ...s, ...newState }));
    console.log("setting state", newState);
    socket.current.emit("update", newState);
  }

  return [state, update];
}
