import { createContext, useContext, useRef } from "react";

const TelescrollContext = createContext({
  provideScroll: () => {},
  requestScroll: () => {},
});

export function TelescrollProvider({ children }) {
  const requested = useRef(null);

  function provideScroll(key) {
    return (el) => {
      if (requested.current === key) {
        el.scrollIntoView();
        requested.current = null;
      }
    };
  }

  function requestScroll(key) {
    if (typeof key !== "string") throw new Error("Invalid scroll key: " + key);
    requested.current = key;
    // TODO: When/how can we unregister a scroll that isn't triggered?
  }

  return (
    <TelescrollContext.Provider value={{ provideScroll, requestScroll }}>
      {children}
    </TelescrollContext.Provider>
  );
}

export function useTelescroll() {
  return useContext(TelescrollContext);
}
