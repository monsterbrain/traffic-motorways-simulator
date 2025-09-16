// Canvas setup
const canvas = document.getElementById('traffic-canvas');
const ctx = canvas.getContext('2d');

// Simulation state
let isRunning = false;
let vehicles = [];
let animationId;
let lastTime = 0;
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
    }
    
    update() {
        if (!isRunning) return;
        
        switch(this.direction) {
            case 'down':
                this.y += this.speed;
                if (this.y > canvas.height + 50) {
                    this.y = -50;
                }
                break;
            case 'right':
                this.x += this.speed;
                if (this.x > canvas.width + 50) {
                    this.x = -50;
                }
                break;
            case 'up':
                this.y -= this.speed;
                if (this.y < -50) {
                    this.y = canvas.height + 50;
                }
                break;
            case 'left':
                this.x -= this.speed;
                if (this.x < -50) {
                    this.x = canvas.width + 50;
                }
                break;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw car body
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        
        ctx.fillRect(
            this.x - this.width/2, 
            this.y - this.height/2, 
            this.width, 
            this.height
        );
        ctx.strokeRect(
            this.x - this.width/2, 
            this.y - this.height/2, 
            this.width, 
            this.height
        );
        
        // Draw windows
        ctx.fillStyle = '#87ceeb';
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        
        if (this.direction === 'down' || this.direction === 'up') {
            // Vertical car - draw horizontal windows
            ctx.fillRect(this.x - 8, this.y - 15, 16, 10);
            ctx.strokeRect(this.x - 8, this.y - 15, 16, 10);
            ctx.fillRect(this.x - 8, this.y + 5, 16, 10);
            ctx.strokeRect(this.x - 8, this.y + 5, 16, 10);
        } else {
            // Horizontal car - draw vertical windows
            ctx.fillRect(this.x - 15, this.y - 8, 10, 16);
            ctx.strokeRect(this.x - 15, this.y - 8, 10, 16);
            ctx.fillRect(this.x + 5, this.y - 8, 10, 16);
            ctx.strokeRect(this.x + 5, this.y - 8, 10, 16);
        }
        
        ctx.restore();
    }
    
    reset() {
        this.x = this.startX;
        this.y = this.startY;
    }
}

// Road drawing functions
function drawRoads() {
    ctx.save();
    
    // Road color
    ctx.fillStyle = '#555';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Vertical road
    ctx.fillRect(340, 0, 120, canvas.height);
    ctx.strokeRect(340, 0, 120, canvas.height);
    
    // Horizontal road
    ctx.fillRect(0, 240, canvas.width, 120);
    ctx.strokeRect(0, 240, canvas.width, 120);
    
    // Draw lane dividers
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.setLineDash([15, 15]);
    
    // Vertical divider
    ctx.beginPath();
    ctx.moveTo(400, 0);
    ctx.lineTo(400, 240);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(400, 360);
    ctx.lineTo(400, canvas.height);
    ctx.stroke();
    
    // Horizontal divider
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(340, 300);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(460, 300);
    ctx.lineTo(canvas.width, 300);
    ctx.stroke();
    
    // Reset line dash
    ctx.setLineDash([]);
    
    // Draw intersection
    ctx.fillStyle = '#666';
    ctx.fillRect(340, 240, 120, 120);
    ctx.strokeRect(340, 240, 120, 120);
    
    ctx.restore();
}

// Initialize vehicles
function initVehicles() {
    vehicles = [];
    
    // 4 cars going down (blue) - left lane
    for (let i = 0; i < 4; i++) {
        vehicles.push(new Vehicle(
            370,  // Left lane of vertical road
            -100 - (i * 100),
            'down',
            '#3498db',
            2 + Math.random() * 1.5
        ));
    }
    
    // 4 cars going right (red) - top lane  
    for (let i = 0; i < 4; i++) {
        vehicles.push(new Vehicle(
            -100 - (i * 100),
            270,  // Top lane of horizontal road
            'right',
            '#e74c3c',
            2 + Math.random() * 1.5
        ));
    }
}

// Animation loop
function animate(currentTime) {
    if (currentTime - lastTime >= 16) { // ~60 FPS
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw roads
        drawRoads();
        
        // Update and draw vehicles
        vehicles.forEach(vehicle => {
            vehicle.update();
            vehicle.draw(ctx);
        });
        
        // Calculate FPS
        fps = Math.round(1000 / (currentTime - lastTime));
        lastTime = currentTime;
        
        // Update stats
        updateStats();
    }
    
    animationId = requestAnimationFrame(animate);
}

// Control functions
function startSimulation() {
    if (!isRunning) {
        isRunning = true;
        if (!animationId) {
            animate(0);
        }
        console.log('Simulation started');
    }
}

function pauseSimulation() {
    isRunning = false;
    console.log('Simulation paused');
}

function resetSimulation() {
    isRunning = false;
    vehicles.forEach(vehicle => vehicle.reset());
    console.log('Simulation reset');
}

function addMoreCars() {
    // Add 2 more cars in each direction
    vehicles.push(new Vehicle(370, -50, 'down', '#3498db', 2 + Math.random() * 1.5));
    vehicles.push(new Vehicle(-50, 270, 'right', '#e74c3c', 2 + Math.random() * 1.5));
    console.log(`Added more cars. Total: ${vehicles.length}`);
}

function updateStats() {
    const statsEl = document.getElementById('stats');
    statsEl.textContent = `Cars: ${vehicles.length} | Running: ${isRunning ? 'Yes' : 'No'} | FPS: ${fps}`;
}

// Initialize and start
initVehicles();
animate(0);

// Auto start after 1 second
setTimeout(() => {
    startSimulation();
}, 1000);

console.log('Traffic simulator loaded successfully!');
