// Two.js setup
const canvas = document.getElementById('traffic-canvas');
const two = new Two({
    width: 800,
    height: 600,
    domElement: canvas
});

// Simulation state
let isRunning = false;
let car;

// Node data
const nodes = [
    { x: 100, y: 100 },
    { x: 700, y: 100 },
    { x: 400, y: 500 }
];

// Car class
class Car {
    constructor(x, y, color = '#3498db', speed = 2) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.targetNodeIndex = 1; // Start by moving towards the second node
        this.isFinished = false;

        // Two.js representation
        this.width = 50;
        this.height = 25;
        this.body = two.makeRoundedRectangle(0, 0, this.width, this.height, 5);
        this.body.fill = color;
        this.body.stroke = '#2c3e50';
        this.body.linewidth = 2;

        this.group = two.makeGroup(this.body);
        this.group.translation.set(this.x, this.y);
    }

    update() {
        if (!isRunning || this.isFinished) return;

        const targetNode = nodes[this.targetNodeIndex];
        const dx = targetNode.x - this.x;
        const dy = targetNode.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            // Reached the node
            this.x = targetNode.x;
            this.y = targetNode.y;
            this.targetNodeIndex++;

            if (this.targetNodeIndex >= nodes.length) {
                // Reached the final node
                this.isFinished = true;
                console.log('Car has reached the destination.');
                pauseSimulation(); // Stop the animation
            }
        } else {
            // Move towards the node
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;
            this.group.rotation = angle;
        }

        this.group.translation.set(this.x, this.y);
    }
}

// Draw the scene
function drawScene() {
    // Draw path
    const path = new Two.Path(
        nodes.map(node => new Two.Anchor(node.x, node.y)),
        false, // open path
        true   // curved
    );
    path.stroke = '#7f8c8d';
    path.linewidth = 4;
    path.dashes = [10, 10];
    path.noFill();
    two.add(path);

    // Draw nodes
    nodes.forEach((node, i) => {
        const circle = two.makeCircle(node.x, node.y, 10);
        circle.fill = '#2c3e50';
        const text = new Two.Text(i, node.x, node.y);
        text.fill = '#fff';
        text.size = 12;
        two.add(circle, text);
    });
}

// Initialize the car
function init() {
    if (car) {
        car.group.remove();
    }
    const startNode = nodes[0];
    car = new Car(startNode.x, startNode.y);
}


// Animation loop
two.bind('update', function() {
    if (car) {
        car.update();
    }
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

// Initial setup
drawScene();
init();
two.update(); // Initial render
