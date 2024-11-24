<?php
$host = "localhost";
$usuario = "root"; // Usuario por defecto de XAMPP
$contrasena = ""; // Sin contraseña por defecto
$base_de_datos = "ComprensionDB";
$puerto = 3307; 

$conexion = new mysqli($host, $usuario, $contrasena, $base_de_datos, $puerto);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
?>
