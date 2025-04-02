// zIndexManager.js
let currentZIndex = 1000; // Lower base z-index
export const getNextZIndex = () => ++currentZIndex;
