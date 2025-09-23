// Two.js setup
const canvas = document.getElementById('traffic-canvas');
const two = new Two({
    width: 800,
    height: 600,
    domElement: canvas
});

// Editor state
let currentTool = 'place-node'; // 'place-node' or 'create-road'
let nodes = [];
let roads = [];
let selectedNode = null;

// DOM elements
const placeNodeBtn = document.getElementById('place-node-btn');
const createRoadBtn = document.getElementById('create-road-btn');

// --- Tool selection ---
function setActiveTool(tool) {
    currentTool = tool;
    placeNodeBtn.classList.toggle('active', tool === 'place-node');
    createRoadBtn.classList.toggle('active', tool === 'create-road');
    console.log(`Tool changed to: ${tool}`);
}

placeNodeBtn.addEventListener('click', () => setActiveTool('place-node'));
createRoadBtn.addEventListener('click', () => setActiveTool('create-road'));

// --- Canvas interaction ---
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'place-node') {
        addNode(x, y);
    } else if (currentTool === 'create-road') {
        handleRoadCreation(x, y);
    }
});

// --- Core logic ---
function addNode(x, y) {
    const newNode = { x, y, id: nodes.length };
    nodes.push(newNode);
    draw();
}

function handleRoadCreation(x, y) {
    const clickedNode = findNodeAt(x, y);
    if (!clickedNode) {
        // Clicked on empty space, reset selection
        selectedNode = null;
        draw(); // Redraw to clear selection highlight
        return;
    }

    if (!selectedNode) {
        // This is the first node selected for the road
        selectedNode = clickedNode;
        draw(); // Highlight selected node
    } else {
        // This is the second node, create the road
        if (selectedNode.id !== clickedNode.id) {
            addRoad(selectedNode, clickedNode);
        }
        selectedNode = null; // Reset for next road
        draw();
    }
}

function addRoad(node1, node2) {
    // Avoid duplicate roads
    const roadExists = roads.some(road =>
        (road.from === node1.id && road.to === node2.id) ||
        (road.from === node2.id && road.to === node1.id)
    );

    if (!roadExists) {
        roads.push({ from: node1.id, to: node2.id });
    }
}

function findNodeAt(x, y, tolerance = 10) {
    for (const node of nodes) {
        const dx = node.x - x;
        const dy = node.y - y;
        if (Math.sqrt(dx * dx + dy * dy) < tolerance) {
            return node;
        }
    }
    return null;
}

// --- Drawing ---
function draw() {
    two.clear();

    // Draw roads
    roads.forEach(road => {
        const nodeFrom = nodes[road.from];
        const nodeTo = nodes[road.to];
        const line = two.makeLine(nodeFrom.x, nodeFrom.y, nodeTo.x, nodeTo.y);
        line.stroke = '#7f8c8d';
        line.linewidth = 4;
    });

    // Draw nodes
    nodes.forEach(node => {
        const circle = two.makeCircle(node.x, node.y, 10);

        if (selectedNode && selectedNode.id === node.id) {
            circle.fill = '#e67e22'; // Highlight color for selected node
        } else {
            circle.fill = '#2c3e50';
        }
    });

    two.update();
}

// --- Initial setup ---
function init() {
    setActiveTool('place-node');
    draw();
}

init();
