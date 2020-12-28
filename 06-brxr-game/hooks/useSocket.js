import { useState, useEffect } from "react";
import io from "socket.io-client";

// only ever one instance between hot reloads
let socket = null;

export default function useSocket() {
  const [state, setState] = useState({});

  useEffect(() => {
    if (socket == null) {
      socket = io();
      socket.on("init", (state) =>
        setState((s) => ({ ...s, ...state, ready: true }))
      );
      socket.on("update", (update) => {
        setState((s) => ({ ...s, ...update }));
      });
    }
    return () => {
      socket.disconnect();
      socket = null;
    };
  }, []);

  function update(fn) {
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
  }

  return [state, update];
}
