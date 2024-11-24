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