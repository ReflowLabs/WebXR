import { useState, useEffect } from "react";
import io from "socket.io-client";

// only ever one instance between hot reloads
let socket = null;

const defaultState = {
  hrx: "-0.04",
  hry: "-0.01",
  hrz: "0.00",
  lpx: "-0.15",
  lpy: "0.58",
  lpz: "-7.28",
  rpx: "0.14",
  rpy: "0.60",
  rpz: "-7.28",
};

export default function useSocket() {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    if (socket == null) {
      socket = io();
      socket.on("init", (state) => {
        console.log("intiial state", state);
        setState((s) => ({ ...s, ...state, ready: true }));
        // only subscribe to other player
        socket.on(`p${state.player}`, (update) => {
          setState((s) => ({ ...s, ...update }));
        });
      });
    }
    return () => {
      socket.disconnect();
      socket = null;
    };
  }, []);

  function update(fn) {
    (async () => {
      setState((oldState) => {
        const newState = fn(oldState);
        const filtered = Object.keys(newState).filter(
          (k) => newState[k] != oldState[k]
        );
        if (filtered.length > 0) {
          const updated = {};
          filtered.forEach((k) => {
            if (oldState[k] != newState[k]) {
              updated[k] = newState[k];
            }
          });
          socket.emit("update", updated);
          return { ...oldState, ...updated };
        } else {
          return oldState;
        }
      });
    })();
  }

  return [state, update];
}
