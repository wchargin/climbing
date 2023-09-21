import { useEffect } from "react";

import matchPath from "./paths";
import { useRouter } from "./router";
import { useStore } from "./store/context";

function App() {
  const { path } = useRouter();
  const { store } = useStore();

  const match = matchPath(path, store);
  if (match == null) {
    throw new Error("Unknown path: " + path);
  }
  useEffect(() => {
    document.title = match.title;
  }, [match.title]);

  return match.render();
}

export default App;
