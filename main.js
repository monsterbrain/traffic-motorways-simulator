// Two.js setup
const canvas = document.getElementById('traffic-canvas');
const two = new Two({
    width: 800,
    height: 600,
    domElement: canvas
});

// --- STATE MANAGEMENT ---
let currentMode = 'editor'; // 'editor' or 'simulation'
let isRunning = false;
let cars = [];
let nodes = [];
let roads = [];
let routes = [];
let currentRoute = [];
const routeColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
let selectedNode = null;
let currentTool = 'place-node';
let fps = 0;

// --- DOM ELEMENTS ---
const editorTools = document.getElementById('editor-tools');
const simControls = document.getElementById('simulation-controls');
const startSimContainer = document.getElementById('start-simulation-container');
const startSimBtn = document.getElementById('start-simulation-btn');
const placeNodeBtn = document.getElementById('place-node-btn');
const createRoadBtn = document.getElementById('create-road-btn');
const createRouteBtn = document.getElementById('create-route-btn');
const endRouteBtn = document.getElementById('end-route-btn');
const modeStatus = document.getElementById('mode-status');

// --- EDITOR LOGIC (from road-editor.js) ---
function setActiveTool(tool) {
    currentTool = tool;
    placeNodeBtn.classList.toggle('active', tool === 'place-node');
    createRoadBtn.classList.toggle('active', tool === 'create-road');
    createRouteBtn.classList.toggle('active', tool === 'create-route');

    // Show/hide End Route button
    endRouteBtn.style.display = tool === 'create-route' ? 'inline-block' : 'none';

    // If switching away from route creation, clear the current route
    if (tool !== 'create-route' && currentRoute.length > 0) {
        currentRoute = [];
        drawEditor();
    }
}

placeNodeBtn.addEventListener('click', () => setActiveTool('place-node'));
createRoadBtn.addEventListener('click', () => setActiveTool('create-road'));
createRouteBtn.addEventListener('click', () => {
    setActiveTool('create-route');
    currentRoute = []; // Start a new route
    drawEditor();
});
endRouteBtn.addEventListener('click', () => {
    if (currentRoute.length > 1) {
        routes.push([...currentRoute]); // Save a copy of the route
    }
    currentRoute = []; // Reset for the next one
    // Optionally, switch back to a default tool
    // setActiveTool('place-node');
    drawEditor();
});


canvas.addEventListener('click', (e) => {
    if (currentMode !== 'editor') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'place-node') {
        addNode(x, y);
    } else if (currentTool === 'create-road') {
        handleRoadCreation(x, y);
    } else if (currentTool === 'create-route') {
        handleRouteCreation(x, y);
    }
});

function handleRouteCreation(x, y) {
    const clickedNode = findNodeAt(x, y);
    if (!clickedNode) return;

    if (currentRoute.length === 0) {
        // Start a new route
        currentRoute.push(clickedNode.id);
    } else {
        const lastNodeId = currentRoute[currentRoute.length - 1];
        const lastNode = nodes[lastNodeId];

        // Check if the clicked node is connected to the last node in the route
        // And if it's not already in the current route
        if (lastNode.connections.includes(clickedNode.id) && !currentRoute.includes(clickedNode.id)) {
            currentRoute.push(clickedNode.id);
        }
    }
    drawEditor();
}

function addNode(x, y) {
    const newNode = { x, y, id: nodes.length, connections: [] };
    nodes.push(newNode);
    drawEditor();
}

function handleRoadCreation(x, y) {
    const clickedNode = findNodeAt(x, y);
    if (!clickedNode) {
        selectedNode = null;
        drawEditor();
        return;
    }

    if (!selectedNode) {
        selectedNode = clickedNode;
        drawEditor();
    } else {
        if (selectedNode.id !== clickedNode.id) {
            addRoad(selectedNode, clickedNode);
        }
        selectedNode = null;
        drawEditor();
    }
}

function addRoad(node1, node2) {
    const roadExists = roads.some(road =>
        (road.from === node1.id && road.to === node2.id) ||
        (road.from === node2.id && road.to === node1.id)
    );

    if (!roadExists) {
        roads.push({ from: node1.id, to: node2.id });
        // Update connections in nodes
        nodes[node1.id].connections.push(node2.id);
        nodes[node2.id].connections.push(node1.id);
    }
}

function findNodeAt(x, y, tolerance = 15) {
    for (const node of nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < tolerance) {
            return node;
        }
    }
    return null;
}

function drawEditor() {
    two.clear();

    // Draw roads
    roads.forEach(road => {
        const nodeFrom = nodes[road.from];
        const nodeTo = nodes[road.to];
        const line = two.makeLine(nodeFrom.x, nodeFrom.y, nodeTo.x, nodeTo.y);
        line.stroke = '#7f8c8d';
        line.linewidth = 8;
    });

    // Draw existing routes
    routes.forEach((route, index) => {
        const color = routeColors[index % routeColors.length];
        for (let i = 0; i < route.length - 1; i++) {
            const nodeFrom = nodes[route[i]];
            const nodeTo = nodes[route[i+1]];
            const line = two.makeLine(nodeFrom.x, nodeFrom.y, nodeTo.x, nodeTo.y);
            line.stroke = color;
            line.linewidth = 5;
            line.opacity = 0.7;
        }
    });

    // Draw current route being created
    if (currentTool === 'create-route' && currentRoute.length > 0) {
        const color = routeColors[routes.length % routeColors.length];
        for (let i = 0; i < currentRoute.length - 1; i++) {
            const nodeFrom = nodes[currentRoute[i]];
            const nodeTo = nodes[currentRoute[i+1]];
            const line = two.makeLine(nodeFrom.x, nodeFrom.y, nodeTo.x, nodeTo.y);
            line.stroke = color;
            line.linewidth = 6;
        }
    }

    // Draw nodes
    const lastNodeInRoute = currentRoute.length > 0 ? nodes[currentRoute[currentRoute.length - 1]] : null;

    nodes.forEach(node => {
        const circle = two.makeCircle(node.x, node.y, 10);

        if (currentTool === 'create-route') {
            if (currentRoute.includes(node.id)) {
                circle.fill = routeColors[routes.length % routeColors.length]; // Color for nodes in current route
            } else if (lastNodeInRoute && lastNodeInRoute.connections.includes(node.id)) {
                circle.fill = '#2ecc71'; // Green for selectable next nodes
            } else if (lastNodeInRoute) {
                circle.fill = '#e74c3c'; // Red for non-selectable nodes
            } else {
                 circle.fill = '#2c3e50'; // Default color if route hasn't started
            }
        } else if (selectedNode && selectedNode.id === node.id) {
            circle.fill = '#e67e22'; // Orange for selected node in road creation
        } else {
            circle.fill = '#2c3e50'; // Default node color
        }
    });

    two.update();
}

// --- SIMULATION LOGIC (from main.js) ---

class Car {
    constructor(startNode) {
        this.currentNode = startNode;
        this.targetNode = this.findNextTarget();

        this.x = this.currentNode.x;
        this.y = this.currentNode.y;
        this.speed = 2 + Math.random() * 1.5;
        this.id = Math.random().toString(36).substr(2, 9);

        // Visual representation
        this.width = 15;
        this.height = 30;
        this.group = new Two.Group();
        const body = two.makeRoundedRectangle(0, 0, this.width, this.height, 4);
        body.fill = Math.random() > 0.5 ? '#3498db' : '#e74c3c';
        body.stroke = '#2c3e50';
        body.linewidth = 1;
        this.group.add(body);

        this.group.translation.set(this.x, this.y);
        two.add(this.group);
    }

    findNextTarget() {
        const connections = this.currentNode.connections;
        if (connections.length === 0) return null;

        // Find a random connected node that is not the one we just came from
        const lastNodeId = this.targetNode ? this.targetNode.id : -1;
        let possibleTargets = connections.filter(id => id !== lastNodeId);
        if (possibleTargets.length === 0) {
            possibleTargets = connections; // If no other option, allow going back
        }

        const nextNodeId = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
        return nodes[nextNodeId];
    }

    update() {
        if (!isRunning || !this.targetNode) return;

        const dx = this.targetNode.x - this.x;
        const dy = this.targetNode.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.speed) {
            // Arrived at target node
            this.x = this.targetNode.x;
            this.y = this.targetNode.y;
            this.currentNode = this.targetNode;
            this.targetNode = this.findNextTarget();
            return;
        }

        // Move towards target
        const angle = Math.atan2(dy, dx);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;

        this.group.translation.set(this.x, this.y);
        this.group.rotation = angle + Math.PI / 2; // Align car with direction of travel
    }
    
    destroy() {
        two.remove(this.group);
    }
}

function initCars() {
    cars.forEach(car => car.destroy());
    cars = [];
    
    if (nodes.length < 2) return;

    // Add 5 cars at random starting nodes
    for (let i = 0; i < 5; i++) {
        const startNode = nodes[Math.floor(Math.random() * nodes.length)];
        if (startNode.connections.length > 0) {
            cars.push(new Car(startNode));
        }
    }
}

// --- ANIMATION LOOP ---
let lastTime = 0;
two.bind('update', function(frameCount, timeDelta) {
    if (currentMode === 'simulation') {
        if (!timeDelta) return;

        cars.forEach(car => car.update());

        if (frameCount % 10 === 0) {
            fps = Math.round(1000 / timeDelta);
        }
    }
    updateStats();
});

// --- UI & MODE SWITCHING ---
startSimBtn.addEventListener('click', () => {
    if (nodes.length < 2 || roads.length < 1) {
        alert("Please create at least two nodes and one road before starting the simulation.");
        return;
    }
    switchToSimulationMode();
});

function switchToSimulationMode() {
    currentMode = 'simulation';
    editorTools.style.display = 'none';
    startSimContainer.style.display = 'none';
    simControls.style.display = 'block';
    modeStatus.textContent = 'Simulation';

    initCars();
    startSimulation(); // Autostart
}

function switchToEditorMode() {
    currentMode = 'editor';
    editorTools.style.display = 'block';
    startSimContainer.style.display = 'block';
    simControls.style.display = 'none';
    modeStatus.textContent = 'Editor';

    pauseSimulation();
    cars.forEach(c => c.destroy());
    cars = [];

    setActiveTool('place-node');
    drawEditor(); // Redraw editor layout
}

// --- SIMULATION CONTROLS ---
function startSimulation() {
    if (!isRunning) {
        isRunning = true;
        two.play();
    }
}

function pauseSimulation() {
    isRunning = false;
    two.pause();
}

function resetSimulation() {
    // In the new flow, reset takes you back to the editor
    switchToEditorMode();
}

function addMoreCars() {
    if (currentMode !== 'simulation' || nodes.length < 1) return;

    const startNode = nodes[Math.floor(Math.random() * nodes.length)];
    if (startNode.connections.length > 0) {
        cars.push(new Car(startNode));
    }
}

function updateStats() {
    const statsEl = document.getElementById('stats');
    statsEl.textContent = `Cars: ${cars.length} | Running: ${isRunning ? 'Yes' : 'No'} | FPS: ${fps} | Nodes: ${nodes.length} | Roads: ${roads.length}`;
}

// --- INITIALIZATION ---
function init() {
    switchToEditorMode();
    two.play(); // Start the animation loop
}

init();