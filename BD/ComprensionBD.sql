-- Crear la tabla PACIENTE
CREATE TABLE PACIENTE (
    id VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    edad INT NOT NULL,
    diagnostico VARCHAR(250) NOT NULL
);

-- Crear la tabla JUEGO
CREATE TABLE JUEGO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    errores INT NOT NULL,
    tiempo TIME NOT NULL,
    paciente_id VARCHAR(10),
    FOREIGN KEY (paciente_id) REFERENCES PACIENTE(id)
);
