const KEY_STORE_DATA = "climbingStoreData";
const KEY_LISTENERS = "climbingStoreDataListeners";

export function get() {
  return window[KEY_STORE_DATA];
}

export function set(storeData) {
  window[KEY_STORE_DATA] = storeData;
  const listeners = window[KEY_LISTENERS];
  if (listeners != null) {
    for (const listener of listeners) {
      listener(storeData);
    }
  }
}

export function addListener(listener) {
  if (window[KEY_LISTENERS] == null) window[KEY_LISTENERS] = [];
  window[KEY_LISTENERS].push(listener);
  const storeData = window[KEY_STORE_DATA];
  if (storeData != null) listener(storeData);
}

export function removeListener(listener) {
  if (window[KEY_LISTENERS] == null) window[KEY_LISTENERS] = [];
  const listeners = window[KEY_LISTENERS];
  const idx = listeners.indexOf(listener);
  if (idx === -1) return false;
  listeners.splice(idx, 1);
  return true;
}
