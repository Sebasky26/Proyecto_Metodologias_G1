<?php
include 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = $_POST['nombre'];
    $edad = $_POST['edad'];
    $diagnostico = $_POST['diagnostico'];
    $id = $_POST['id'];

    $query = "INSERT INTO paciente (nombre, edad, id, diagnostico) VALUES ('$nombre', $edad, '$id', '$diagnostico')";
    if ($conexion->query($query) === TRUE) {
        header("Location: index.html");
    } else {
        echo "Error: " . $query . "<br>" . $conexion->error;
    }
}

$conexion->close();
?>
