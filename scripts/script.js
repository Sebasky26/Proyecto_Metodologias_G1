// Evento de cambio en el menú desplegable para redirigir al tablero
document.addEventListener("DOMContentLoaded", function () {
    cargarPacientes(); // Cargar pacientes al cargar la página
    drawBoard(); // Dibujar el tablero al cargar la página
    startTimer(); // Iniciar el temporizador al cargar la página

    // Agregar evento de cambio al selector de pacientes
    const selectPaciente = document.getElementById("select-paciente");
    selectPaciente.addEventListener("change", function () {
        const pacienteId = this.value;
        if (pacienteId) {
            localStorage.setItem("pacienteId", pacienteId); // Guarda el ID del paciente en localStorage
        }
    });
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
let completedInstructions = 0
let startTime;
// Variables para el temporizador
let elapsedTime = 0;
let timerInterval;

let paintedCells = {
    left: false,
    right: false,
    above: false,
    below: false
};

// Posiciones estáticas de los elementos en el tablero
const starPosition = { row: 1, col: 6 };
const blackPosition = { row: 3, col: 0 };
const numberPositions = {
    15: { row: 4, col: 1 },
    50: { row: 2, col: 3 },
    21: { row: 2, col: 9 },
    48: { row: 4, col: 5 }
};

// Lista de instrucciones
const instructions = [
    { text: "Colorea de rojo la casilla que está encima de la estrella.", fulfilled: false, color: "#FF0000", check: checkAboveStar },
    { text: "Colorea de café la casilla que está a la derecha de la que tiene el número 15.", fulfilled: false, color: "#8B4513", check: checkRightOfNumber(15) },
    { text: "Escribe la primera letra de tu nombre encima de la casilla negra.", fulfilled: false, textInput: true, check: checkAboveBlack },
    { text: "Colorea de verde la casilla derecha al lado del número 50.", fulfilled: false, color: "#008000", check: checkSidesOfNumber(50) },
    { text: "Colorea de rosado la casilla de la primera fila y cuarta columna.", fulfilled: false, color: "#FFC0CB", check: checkFirstRowFourthCol },
    { text: "Colorea de amarillo la casilla encima de la que tiene el número 21.", fulfilled: false, color: "#FFFF00", check: checkAboveAndBelowOfNumber(21) },
    { text: "Colorea de morado la casilla que está debajo de la negra.", fulfilled: false, color: "#800080", check: checkBelowBlack },
    { text: "Escribe el número de hijos que tienes en la cuarta fila y octava columna.", fulfilled: false, textInput: true, check: checkFourthRowEighthCol },
    { text: "Colorea de celeste la casilla encima de la que tiene el número igual a la multiplicación 16 x 3.", fulfilled: false, color: "#ADD8E6", check: checkAboveMultiplication },
    { text: "Dibuja un triángulo en la casilla que está al lado izquierdo de 48.", fulfilled: false, check: checkLeftOfNumber(48) },
    { text: "Escribe la séptima letra del abecedario en la segunda fila y segunda columna.", fulfilled: false, textInput: true, check: checkSecondRowSecondCol }
];

document.addEventListener("DOMContentLoaded", function () {
    let secondsElapsed = 0;
    let domContentLoadedTime = 0;
    const timeCounter = document.getElementById('timeCounter');

    if (timeCounter) {
        // Inicia el temporizador
        const timerInterval = setInterval(() => {
            secondsElapsed++;
            const minutes = Math.floor(secondsElapsed / 60);
            const seconds = secondsElapsed % 60;
            timeCounter.textContent = `Tiempo transcurrido: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }, 1000);

        // Registra el tiempo transcurrido cuando el DOM se carga completamente
        domContentLoadedTime = secondsElapsed;

        // Función para detener el temporizador y mostrar el tiempo de carga del DOM y los intentos incorrectos
        window.showCompletionTime = function () {
            clearInterval(timerInterval);
            const totalMinutes = Math.floor(secondsElapsed / 60);
            const totalSeconds = secondsElapsed % 60;
            const domLoadedMinutes = Math.floor(domContentLoadedTime / 60);
            const domLoadedSeconds = domContentLoadedTime % 60;

            // Muestra la alerta con los intentos incorrectos
            alert(`¡Felicidades! Completaste el test en ${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}.\n` +
                `Intentos incorrectos: ${incorrectAttempts}`);
        };

    } else {
        console.error("Elemento 'timeCounter' no encontrado");
    }
});

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

// Muestra todas las instrucciones en pantalla solo una vez
function displayInstructions() {
    const instructionContainer = document.getElementById("instruction");
    instructions.forEach((instruction, index) => {
        const instructionElement = document.createElement("p");
        instructionElement.id = `instruction-${index}`;
        instructionElement.innerText = instruction.text;
        instructionContainer.appendChild(instructionElement);
    });
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

// Función para seleccionar color y modo de interacción
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

function writeOnCell(row, col, text) {
    const x = col * cellSize + cellSize / 3;
    const y = row * cellSize + cellSize / 1.5;
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(text, x, y);
}

// Función para cargar pacientes
function cargarPacientes() {
    fetch('obtener_pacientes.php')
        .then(response => response.json())
        .then(data => {
            const selectPaciente = document.getElementById("select-paciente");
            data.forEach(paciente => {
                const option = document.createElement("option");
                option.value = paciente.id;
                option.textContent = paciente.nombre;
                selectPaciente.appendChild(option);
            });
        })
        .catch(error => console.error("Error al cargar pacientes:", error));
}

function showNotification(message) {
    const notificationElement = document.createElement("div");
    notificationElement.innerText = message;
    notificationElement.className = "notification"; // Asegúrate de tener un estilo CSS para esta clase
    document.body.appendChild(notificationElement);

    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
        notificationElement.remove();
    }, 5000);
}

function checkConditions(row, col, action) {
    const currentInstruction = instructions[completedInstructions];

    if (currentInstruction && currentInstruction.check(row, col, action)) {
        currentInstruction.fulfilled = true;
        document.getElementById(`instruction-${completedInstructions}`).style.textDecoration = "line-through";
        completedInstructions++;

        document.getElementById("notification").innerText = "¡Correcto!";
    } else {
        incrementIncorrectAttempts();
        showNotification("La acción no corresponde a la instrucción actual.");
        document.getElementById("notification").innerText = "La acción no corresponde a la instrucción actual.";
    }

    if (completedInstructions === instructions.length) {
        // Llama a la ventana emergente de finalización
        showCompletionTime();
    }
}

// Función para incrementar el contador de intentos incorrectos
function incrementIncorrectAttempts(amount = 1) {
    incorrectAttempts += amount;
    if (incorrectAttempts < 0) {
        incorrectAttempts = 0;  // Evitar que el contador sea negativo
    }
    document.getElementById("attemptCounter").innerText = `Intentos incorrectos: ${incorrectAttempts}`;
    localStorage.setItem("intentos", incorrectAttempts); // Guardar en localStorage para estadísticas
}

// Funciones de revisión de condiciones para cada instrucción
function checkAboveStar(row, col, color) {
    return color === "#FF0000" && row === starPosition.row - 1 && col === starPosition.col;
}

function checkRightOfNumber(number) {
    return function (row, col, color) {
        const pos = numberPositions[number];
        return color === "#8B4513" && row === pos.row && col === pos.col + 1;
    };
}

function checkAboveBlack(row, col, text) {
    return text && row === blackPosition.row - 1 && col === blackPosition.col;
}

function checkSidesOfNumber(number) {
    return function (row, col, color) {
        const pos = numberPositions[number];
        return color === "#008000" && row === pos.row && (col === pos.col + 1);
    };
}

function checkFirstRowFourthCol(row, col, color) {
    return color === "#FFC0CB" && row === 0 && col === 3;
}

function checkAboveAndBelowOfNumber(number) {
    return function (row, col, color) {
        const pos = numberPositions[number];
        return (color === "#FFFF00" && row === pos.row - 1 && col === pos.col);
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
    return function (row, col, value) {
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
    const now = Date.now();
    const elapsedTime = Math.floor((now - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    document.getElementById("timer").textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    requestAnimationFrame(updateTimer);
}