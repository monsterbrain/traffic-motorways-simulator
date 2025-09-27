# History

## 2025-09-27

- Implemented a new collision detection system using a "safe distance" line.
- Cars now stop when another vehicle is within their safe distance and resume when the path is clear.
- Added a "Debug Info" checkbox to visualize the safe distance lines for debugging.

## 2025-09-17

- Added collision check for cars.
- Cars now stop if they are too close to the vehicle in front and proceed when there is enough space.
- The minimum gap between cars is set to 10 pixels.

## 2025-09-16

- Migrated the drawing from HTML5 Canvas to Two.js framework.
- Updated `main.js` to use Two.js for rendering.
- Included Two.js library from a CDN in `index.html`.
- The simulation now uses Two.js for animation and drawing, which provides a more structured way to handle graphical objects.
