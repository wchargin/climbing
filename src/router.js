import { createContext, useContext, useEffect, useState } from "react";

import { pathToRoot } from "./path";

const RouterContext = createContext(null);

function Router({ initialPath, gateway, children }) {
  const [currentPath, setPath] = useState(initialPath);
  const toRoot = pathToRoot(currentPath);

  useEffect(() => {
    function onPop(e) {
      setPath(e.state ?? initialPath);
    }
    window.addEventListener("popstate", onPop);
    return () => void window.removeEventListener("popstate", onPop);
  }, []);

  function navigate(newPath) {
    if (gateway == null) throw new Error("Cannot navigate without gateway");
    history.pushState(newPath, "", gateway + newPath);
    setPath(newPath);
  }

  function href(path) {
    if (!path.startsWith("/"))
      throw new Error("Missing leading slash: " + path);
    return toRoot + path.slice(1);
  }

  return (
    <RouterContext.Provider value={{ path: currentPath, href, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}

export default Router;
