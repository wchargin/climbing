import { useEffect, useState } from "react";
import * as Client from "react-dom/client";

import App from "./app";

import ClimbingDataStore from "./store";
import StoreContext from "./store/context";
import * as globalStore from "./store/global";

function Root({ initialStore, children }) {
  const [storeCtx, setStoreCtx] = useState({
    store: initialStore,
    loaded: false,
  });
  useEffect(() => {
    function listener(store) {
      setStoreCtx({ store, loaded: true });
    }
    globalStore.addListener(listener);
    return () => globalStore.removeListener(listener);
  }, []);
  return (
    <StoreContext.Provider value={storeCtx}>{children}</StoreContext.Provider>
  );
}

function main() {
  const root = document.getElementById("root");
  if (root == null) throw new Error("Couldn't find DOM node for React root");
  const path = document.body.dataset.path;
  if (path == null) throw new Error("No application path specified");

  const initialStore = new ClimbingDataStore();
  const app = (
    <Root initialStore={initialStore}>
      <App path={path} />
    </Root>
  );
  Client.hydrateRoot(root, app);
}

main();
