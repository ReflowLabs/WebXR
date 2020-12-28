import useSocket from "../hooks/useSocket";

export default function Blah() {
  const [state, setState] = useSocket();

  return (
    <div>
      <button onClick={setState}>Update</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
