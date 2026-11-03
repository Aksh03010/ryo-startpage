export {};

declare global {
  // Populated by the source loader to verify that disabled features stay unloaded.
  var __loadedSources: Set<string>;
}
