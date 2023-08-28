import { createContext, useContext, useEffect, useState } from "react";

const HydratedContext = createContext(false);

export function HydratedProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return (
    <HydratedContext.Provider value={hydrated}>
      {children}
    </HydratedContext.Provider>
  );
}

export function useHydrated() {
  return useContext(HydratedContext);
}
