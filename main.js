// Two.js setup
const canvas = document.getElementById('traffic-canvas');
const two = new Two({
    width: 800,
    height: 600,
    domElement: canvas
});

// Simulation state
let isRunning = false;
let vehicles = [];
let fps = 0;

// Vehicle class
class Vehicle {
    constructor(x, y, direction, color = '#3498db', speed = 2) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.direction = direction;
        this.speed = speed;
        this.color = color;
        this.width = direction === 'down' || direction === 'up' ? 25 : 50;
        this.height = direction === 'down' || direction === 'up' ? 50 : 25;
        this.id = Math.random().toString(36).substr(2, 9);

        // Two.js representation
        this.group = new Two.Group();

        const body = two.makeRectangle(0, 0, this.width, this.height);
        body.fill = this.color;
        body.stroke = '#2c3e50';
        body.linewidth = 2;

        this.group.add(body);

        const windows = new Two.Group();
        if (this.direction === 'down' || this.direction === 'up') {
            const w1 = two.makeRectangle(0, -10, 16, 10);
            const w2 = two.makeRectangle(0, 10, 16, 10);
            windows.add(w1, w2);
        } else {
            const w1 = two.makeRectangle(-10, 0, 10, 16);
            const w2 = two.makeRectangle(10, 0, 10, 16);
            windows.add(w1, w2);
        }

        windows.fill = '#87ceeb';
        windows.stroke = '#2c3e50';
        windows.linewidth = 1;

        this.group.add(windows);
        this.group.translation.set(this.x, this.y);
        two.add(this.group);
    }
    
    update() {
        if (!isRunning) return;
        
        switch(this.direction) {
            case 'down':
                this.y += this.speed;
                if (this.y > two.height + 50) this.y = -50;
                break;
            case 'right':
                this.x += this.speed;
                if (this.x > two.width + 50) this.x = -50;
                break;
            case 'up':
                this.y -= this.speed;
                if (this.y < -50) this.y = two.height + 50;
                break;
            case 'left':
                this.x -= this.speed;
                if (this.x < -50) this.x = two.width + 50;
                break;
        }
        this.group.translation.set(this.x, this.y);
    }
    
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.group.translation.set(this.x, this.y);
    }
}

// Road drawing functions
function drawRoads() {
    // Roads
    const roads = new Two.Group();
    const verticalRoad = two.makeRectangle(400, 300, 120, 600);
    verticalRoad.fill = '#555';
    verticalRoad.stroke = '#333';
    verticalRoad.linewidth = 2;
    
    const horizontalRoad = two.makeRectangle(400, 300, 800, 120);
    horizontalRoad.fill = '#555';
    horizontalRoad.stroke = '#333';
    horizontalRoad.linewidth = 2;

    roads.add(verticalRoad, horizontalRoad);
    
    // Lane dividers
    const dividers = new Two.Group();
    const v1 = two.makeLine(400, 0, 400, 240);
    const v2 = two.makeLine(400, 360, 400, 600);
    const h1 = two.makeLine(0, 300, 340, 300);
    const h2 = two.makeLine(460, 300, 800, 300);
    
    dividers.add(v1, v2, h1, h2);
    dividers.stroke = '#fff';
    dividers.linewidth = 3;
    dividers.dashes = [15, 15];
    
    // Intersection
    const intersection = two.makeRectangle(400, 300, 120, 120);
    intersection.fill = '#666';
    intersection.stroke = '#333';
    intersection.linewidth = 2;
    
    two.add(roads, dividers, intersection);
}

// Initialize vehicles
function initVehicles() {
    vehicles.forEach(v => v.group.remove());
    vehicles = [];
    
    // 4 cars going down (blue) - left lane
    for (let i = 0; i < 4; i++) {
        vehicles.push(new Vehicle(
            370,
            -100 - (i * 100),
            'down',
            '#3498db',
            2 + Math.random() * 1.5
        ));
    }
    
    // 4 cars going right (red) - top lane  
    for (let i = t = 0; i < 4; i++) {
        vehicles.push(new Vehicle(
            -100 - (i * 100),
            270,
            'right',
            '#e74c3c',
            2 + Math.random() * 1.5
        ));
    }
}

// Animation loop
let lastTime = 0;
two.bind('update', function(frameCount, timeDelta) {
    if (!timeDelta) return;
    
    vehicles.forEach(vehicle => {
        vehicle.update();
    });

    if (frameCount % 10 === 0) {
        fps = Math.round(1000 / timeDelta);
    }
    updateStats();
});

// Control functions
function startSimulation() {
    if (!isRunning) {
        isRunning = true;
        two.play();
        console.log('Simulation started');
    }
}

function pauseSimulation() {
    isRunning = false;
    two.pause();
    console.log('Simulation paused');
}

function resetSimulation() {
    isRunning = false;
    two.pause();
    initVehicles();
    console.log('Simulation reset');
}

function addMoreCars() {
    vehicles.push(new Vehicle(370, -50, 'down', '#3498db', 2 + Math.random() * 1.5));
    vehicles.push(new Vehicle(-50, 270, 'right', '#e74c3c', 2 + Math.random() * 1.5));
    console.log(`Added more cars. Total: ${vehicles.length}`);
}

function updateStats() {
    const statsEl = document.getElementById('stats');
    statsEl.textContent = `Cars: ${vehicles.length} | Running: ${isRunning ? 'Yes' : 'No'} | FPS: ${fps}`;
}

// Initialize and start
drawRoads();
initVehicles();

// Auto start after 1 second
setTimeout(() => {
    startSimulation();
}, 1000);

console.log('Traffic simulator loaded successfully!');
