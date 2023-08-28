import { createContext, useContext } from "react";

import ClimbingDataStore from ".";

const ClimbingDataStoreContext = createContext({
  store: new ClimbingDataStore(),
  loaded: false,
});

export default ClimbingDataStoreContext;

export function useStore() {
  return useContext(ClimbingDataStoreContext);
}
