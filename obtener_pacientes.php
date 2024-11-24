<?php
include 'conexion.php'; // Asegúrate de que este archivo esté configurado correctamente para la conexión

$query = "SELECT id, nombre FROM paciente";
$resultado = $conexion->query($query);

$pacientes = array();
while ($fila = $resultado->fetch_assoc()) {
    $pacientes[] = $fila;
}

echo json_encode($pacientes); // Devolver los datos en formato JSON
$conexion->close();
?>
