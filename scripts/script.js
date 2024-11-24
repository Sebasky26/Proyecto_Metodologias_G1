/* ========== Seccion del Tablero ==========*/

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


/* ========== Sección de Instrucciones ==========*/

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

// Función para verificar si se cumplen las condiciones de una instrucción
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

// Función para mostrar notificaciones
function showNotification(message) {
    const notificationElement = document.createElement("div");
    notificationElement.innerText = message;
    notificationElement.className = "notification"; 
    document.body.appendChild(notificationElement);

    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
        notificationElement.remove();
    }, 5000);
}

/* ========== Sección de Pacientes ==========*/

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



// Variables para el temporizador
let elapsedTime = 0;
let timerInterval;

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

/* ========== Sección para inicializar el tablero ==========*/

// Evento para cargar el tablero
document.addEventListener("DOMContentLoaded", function () {
    initializeTimer(); // Configura e inicia el temporizador
    initializePacientes(); // Configura el selector de pacientes
    initializeBoard(); // Configura y dibuja el tablero
});

// Función para inicializar el tiempo
function initializeTimer() {
    let secondsElapsed = 0;
    const timeCounter = document.getElementById('timeCounter');

    if (!timeCounter) {
        console.error("Elemento 'timeCounter' no encontrado");
        return;
    }

    const timerInterval = setInterval(() => {
        secondsElapsed++;
        const minutes = Math.floor(secondsElapsed / 60);
        const seconds = secondsElapsed % 60;
        timeCounter.textContent = `Tiempo transcurrido: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);

    window.showCompletionTime = function () {
        clearInterval(timerInterval);
        const totalMinutes = Math.floor(secondsElapsed / 60);
        const totalSeconds = secondsElapsed % 60;

        alert(`¡Felicidades! Completaste el test en ${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}.\n` +
            `Intentos incorrectos: ${incorrectAttempts}`);
    };
}

// Función para inicializar los pacientes
function initializePacientes() {
    const selectPaciente = document.getElementById("select-paciente");

    if (!selectPaciente) {
        console.error("Elemento 'select-paciente' no encontrado");
        return;
    }

    cargarPacientes(); // Llama a la función que carga los pacientes dinámicamente

    selectPaciente.addEventListener("change", function () {
        const pacienteId = this.value;
        if (pacienteId) {
            localStorage.setItem("pacienteId", pacienteId); // Guarda el ID del paciente en localStorage
        }
    });
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