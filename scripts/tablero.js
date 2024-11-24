// Variables y constantes para el tablero
const canvas = document.getElementById("tablero");
const ctx = canvas.getContext("2d");
const cellSize = 50;
const rows = 5;
const cols = 10;

let selectedColor = "";
let drawTriangleMode = false;
let textInputMode = false;
let incorrectAttempts = 0;
let completedInstructions = 0
let startTime;

// Posiciones estáticas de los elementos en el tablero
const starPosition = { row: 1, col: 6 };
const blackPosition = { row: 3, col: 0 };
const numberPositions = {
    15: { row: 4, col: 1 },
    50: { row: 2, col: 3 },
    21: { row: 2, col: 9 },
    48: { row: 4, col: 5 }
};

let paintedCells = {
    left: false,
    right: false,
    above: false,
    below: false
};

// Funcion para dibujar el tablero y sus elementos
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja los elementos estáticos
    drawElement(starPosition.row, starPosition.col, { type: 'star' });
    drawElement(blackPosition.row, blackPosition.col, { type: 'black' });

    Object.entries(numberPositions).forEach(([number, position]) => {
        drawElement(position.row, position.col, { type: 'number', value: Number(number) });
    });

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }

    // Solo mostrar instrucciones si no se han cargado previamente
    if (!document.getElementById("instruction").hasChildNodes()) {
        displayInstructions();
    }
}

// Funciones para dibujar los elementos en el tablero
function drawElement(row, col, element) {
    const x = col * cellSize;
    const y = row * cellSize;

    ctx.font = "24px Arial";
    ctx.fillStyle = "black";

    if (element.type === 'number') {
        ctx.fillText(element.value, x + cellSize / 4, y + cellSize / 1.5);
    } else if (element.type === 'star') {
        drawStar(x + cellSize / 2, y + cellSize / 2, 5, 15, 6);
    } else if (element.type === 'black') {
        ctx.fillStyle = "black";
        ctx.fillRect(x, y, cellSize, cellSize);
    }
}

// Función para dibujar una estrella
function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

// Funciones para seleccionar color y modo de interacción

// Función para seleccionar un color
function setColor(color) {
    selectedColor = color;
    drawTriangleMode = false;
    textInputMode = false;
}

// Función para activar el modo de dibujar triángulos
function drawTriangle() {
    drawTriangleMode = true;
    selectedColor = "";
    textInputMode = false;
}

// Función para activar el modo de escribir texto
function enableTextInput() {
    textInputMode = true;
    selectedColor = "";
    drawTriangleMode = false;
}

// Evento de clic en el tablero
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (selectedColor) {
        colorCell(row, col, selectedColor);
        checkConditions(row, col, selectedColor);
    } else if (drawTriangleMode) {
        drawTriangleInCell(row, col);
        checkConditions(row, col, "triangle");
    } else if (textInputMode) {
        const text = prompt("Escribe el texto que deseas agregar:");
        if (text) {
            writeOnCell(row, col, text);
            checkConditions(row, col, text);
        }
    }
});

// Funciones auxiliares para dibujar en las celdas
function colorCell(row, col, color) {
    const x = col * cellSize;
    const y = row * cellSize;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, cellSize, cellSize);
    ctx.strokeRect(x, y, cellSize, cellSize);

    // Si el color es blanco y el contador de intentos incorrectos es mayor que cero, restar un intento
    if (color === "#FFFFFF" && incorrectAttempts > 0) {
        incrementIncorrectAttempts(-1);  // Restar un intento
    }
}

// Función para dibujar un triángulo en una celda
function drawTriangleInCell(row, col) {
    const x = col * cellSize;
    const y = row * cellSize;

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(x + cellSize / 2, y + cellSize / 4);
    ctx.lineTo(x + cellSize / 4, y + 3 * cellSize / 4);
    ctx.lineTo(x + 3 * cellSize / 4, y + 3 * cellSize / 4);
    ctx.closePath();
    ctx.fill();
}

// Función para escribir texto en una celda
function writeOnCell(row, col, text) {
    const x = col * cellSize + cellSize / 3;
    const y = row * cellSize + cellSize / 1.5;
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(text, x, y);
}

// Función para inicializar el tablero
function initializeBoard() {
    const canvas = document.getElementById("tablero");

    if (!canvas) {
        console.error("Canvas 'tablero' no encontrado");
        return;
    }

    drawBoard(); // Dibuja el tablero
    startTimer(); // Inicia el temporizador del tablero (si es diferente del general)
}