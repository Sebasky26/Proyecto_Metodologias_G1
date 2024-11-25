document.addEventListener("DOMContentLoaded", function () {
    initializeGame(); // Inicializa el tablero y temporizador
});

const canvas = document.getElementById("tablero");
const ctx = canvas.getContext("2d");
const cellSize = 50;
const rows = 5;
const cols = 10;

let selectedColor = "";
let drawTriangleMode = false;
let textInputMode = false;
let incorrectAttempts = 0;
let completedInstructions = 0;
let startTime;

// Posiciones estáticas de elementos
const starPosition = { row: 1, col: 6 };
const blackPosition = { row: 3, col: 0 };
const numberPositions = {
    15: { row: 4, col: 1 },
    50: { row: 2, col: 3 },
    21: { row: 2, col: 9 },
    48: { row: 4, col: 5 }
};

const instructions = [
    { text: "Colorea de rojo la casilla que está encima de la estrella.", color: "#FF0000", check: checkAboveStar },
    { text: "Colorea de café la casilla que está a la derecha de la que tiene el número 15.", color: "#8B4513", check: checkRightOfNumber(15) },
    { text: "Escribe la primera letra de tu nombre encima de la casilla negra.", textInput: true, check: checkAboveBlack },
    { text: "Colorea de verde la casilla derecha al lado del número 50.", color: "#008000", check: checkSidesOfNumber(50) },
    { text: "Colorea de rosado la casilla de la primera fila y cuarta columna.", color: "#FFC0CB", check: checkFirstRowFourthCol },
    { text: "Colorea de amarillo la casilla encima de la que tiene el número 21.", color: "#FFFF00", check: checkAboveAndBelowOfNumber(21) },
    { text: "Colorea de morado la casilla que está debajo de la negra.", color: "#800080", check: checkBelowBlack },
    { text: "Escribe el número de hijos que tienes en la cuarta fila y octava columna.", textInput: true, check: checkFourthRowEighthCol },
    { text: "Colorea de celeste la casilla encima de la que tiene el número igual a la multiplicación 16 x 3.", color: "#ADD8E6", check: checkAboveMultiplication },
    { text: "Dibuja un triángulo en la casilla que está al lado izquierdo de 48.", drawTriangle: true, check: checkLeftOfNumber(48) },
    { text: "Escribe la séptima letra del abecedario en la segunda fila y segunda columna.", textInput: true, check: checkSecondRowSecondCol }
];

// Inicializa el juego: dibuja tablero, carga instrucciones y temporizador
function initializeGame() {
    drawBoard();
    displayInstructions();
    startTimer();
}

// Dibuja el tablero y los elementos estáticos
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
}

// Muestra las instrucciones
function displayInstructions() {
    const instructionContainer = document.getElementById("instruction");
    instructions.forEach((instruction, index) => {
        const instructionElement = document.createElement("p");
        instructionElement.id = `instruction-${index}`;
        instructionElement.innerText = instruction.text;
        instructionContainer.appendChild(instructionElement);
    });
}

// Dibuja elementos en el tablero
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
        ctx.fillRect(x, y, cellSize, cellSize);
    }
}

// Dibuja una estrella
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
    ctx.closePath();
    ctx.fill();
}

// Configura interacción: seleccionar color, triángulo o texto
function setColor(color) {
    selectedColor = color;
    drawTriangleMode = false;
    textInputMode = false;
}

function drawTriangle() {
    drawTriangleMode = true;
    selectedColor = "";
    textInputMode = false;
}

function enableTextInput() {
    textInputMode = true;
    selectedColor = "";
    drawTriangleMode = false;
}

// Maneja clics en el lienzo
canvas.addEventListener("click", (event) => {
    const { row, col } = getCellFromEvent(event);

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

// Determina la celda del clic
function getCellFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { col: Math.floor(x / cellSize), row: Math.floor(y / cellSize) };
}

// Funciones auxiliares para modificar el tablero
function colorCell(row, col, color) {
    ctx.fillStyle = color;
    ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
}

function drawTriangleInCell(row, col) {
    const x = col * cellSize;
    const y = row * cellSize;
    ctx.beginPath();
    ctx.moveTo(x + cellSize / 2, y + cellSize / 4);
    ctx.lineTo(x + cellSize / 4, y + 3 * cellSize / 4);
    ctx.lineTo(x + 3 * cellSize / 4, y + 3 * cellSize / 4);
    ctx.closePath();
    ctx.fill();
}

function writeOnCell(row, col, text) {
    ctx.fillText(text, col * cellSize + cellSize / 3, row * cellSize + cellSize / 1.5);
}

// Verifica si la acción realizada cumple la condición de la instrucción actual
function checkConditions(row, col, action) {
    const currentInstruction = instructions[completedInstructions];

    if (currentInstruction && currentInstruction.check(row, col, action)) {
        currentInstruction.fulfilled = true;
        document.getElementById(`instruction-${completedInstructions}`).style.textDecoration = "line-through";
        completedInstructions++;

        showNotification("¡Correcto!");
    } else {
        incrementIncorrectAttempts();
        showNotification("La acción no corresponde a la instrucción actual.");
    }

    if (completedInstructions === instructions.length) {
        showCompletionTime();
    }
}

// Incrementa el contador de intentos incorrectos
function incrementIncorrectAttempts() {
    incorrectAttempts++;
    document.getElementById("attemptCounter").innerText = `Intentos incorrectos: ${incorrectAttempts}`;
}

// Muestra notificaciones al usuario
function showNotification(message) {
    const notificationElement = document.getElementById("notification");
    notificationElement.innerText = message;

    setTimeout(() => {
        notificationElement.innerText = "";
    }, 3000);
}

// Funciones de verificación para las instrucciones
function checkAboveStar(row, col, color) {
    return color === "#FF0000" && row === starPosition.row - 1 && col === starPosition.col;
}

function checkRightOfNumber(number) {
    return (row, col, color) => {
        const pos = numberPositions[number];
        return color === "#8B4513" && row === pos.row && col === pos.col + 1;
    };
}

function checkAboveBlack(row, col, text) {
    return text && row === blackPosition.row - 1 && col === blackPosition.col;
}

function checkSidesOfNumber(number) {
    return (row, col, color) => {
        const pos = numberPositions[number];
        return color === "#008000" && row === pos.row && col === pos.col + 1;
    };
}

function checkFirstRowFourthCol(row, col, color) {
    return color === "#FFC0CB" && row === 0 && col === 3;
}

function checkAboveAndBelowOfNumber(number) {
    return (row, col, color) => {
        const pos = numberPositions[number];
        return color === "#FFFF00" && row === pos.row - 1 && col === pos.col;
    };
}

function checkBelowBlack(row, col, color) {
    return color === "#800080" && row === blackPosition.row + 1 && col === blackPosition.col;
}

function checkFourthRowEighthCol(row, col, text) {
    return text && row === 3 && col === 7;
}

function checkAboveMultiplication(row, col, color) {
    return color === "#ADD8E6" && row === numberPositions[48].row - 1 && col === numberPositions[48].col;
}

function checkLeftOfNumber(number) {
    return (row, col, value) => {
        const pos = numberPositions[number];
        return value === "triangle" && row === pos.row && col === pos.col - 1;
    };
}

function checkSecondRowSecondCol(row, col, text) {
    return (text === "G" || text === "g") && row === 1 && col === 1;
}

// Temporizador
function startTimer() {
    startTime = Date.now();
    updateTimer();
}

function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;

    document.getElementById("timer").textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    requestAnimationFrame(updateTimer);
}

// Muestra el tiempo final y los intentos al completar el juego
function showCompletionTime() {
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;

    alert(`¡Felicidades! Completaste el test en ${minutes}:${seconds.toString().padStart(2, "0")}.\nIntentos incorrectos: ${incorrectAttempts}`);
}

