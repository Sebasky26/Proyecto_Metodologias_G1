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