const KEY_STORE = "climbingDataStore";
const KEY_LISTENERS = "climbingDataStoreListeners";

export function get() {
  return window[KEY_STORE];
}

export function set(store) {
  window[KEY_STORE] = store;
  const listeners = window[KEY_LISTENERS];
  if (listeners != null) {
    for (const listener of listeners) {
      listener(store);
    }
  }
}

export function addListener(listener) {
  if (window[KEY_LISTENERS] == null) window[KEY_LISTENERS] = [];
  window[KEY_LISTENERS].push(listener);
  const store = window[KEY_STORE];
  if (store != null) listener(store);
}

export function removeListener(listener) {
  if (window[KEY_LISTENERS] == null) window[KEY_LISTENERS] = [];
  const listeners = window[KEY_LISTENERS];
  const idx = listeners.indexOf(listener);
  if (idx === -1) return false;
  listeners.splice(idx, 1);
  return true;
}
