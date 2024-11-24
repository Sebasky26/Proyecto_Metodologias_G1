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