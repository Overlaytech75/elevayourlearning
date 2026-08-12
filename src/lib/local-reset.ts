const LOCAL_KEYS = [
  "eleva:app:v2",
  "eleva:life:v2",
  "eleva:study:v2",
  // legacy keys from earlier versions
  "sakif-os:v1",
  "eleva:life:v1",
  "atlas:study:v1",
];

/** Wipe all locally stored workspace data so the next account starts empty. */
export function clearLocalData() {
  if (typeof window === "undefined") return;
  for (const key of LOCAL_KEYS) window.localStorage.removeItem(key);
}
