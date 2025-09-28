# History

## 2025-09-25

- Merged the road editor with the traffic simulation, allowing users to create custom road layouts.
- Introduced two modes: 'editor' for drawing roads and 'simulation' for running traffic.
- Users can now place nodes and connect them to form a road network before starting the simulation.

## 2025-09-17

- Added collision check for cars.
- Cars now stop if they are too close to the vehicle in front and proceed when there is enough space.
- The minimum gap between cars is set to 10 pixels.

## 2025-09-16

- Migrated the drawing from HTML5 Canvas to Two.js framework.
- Updated `main.js` to use Two.js for rendering.
- Included Two.js library from a CDN in `index.html`.
- The simulation now uses Two.js for animation and drawing, which provides a more structured way to handle graphical objects.
