import React, { useState } from 'react';
import MostrarCrearCuenta from './MostrarCrearCuenta.jsx'; // Importamos el componente de presentación

// Este es ahora el componente "inteligente" (smart/container).
// Mantiene el estado y la lógica para crear una cuenta.
const CrearCuenta = () => {
    // Estados para los campos del formulario
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
 
    // Estado para mostrar mensajes al usuario (éxito o error)
    const [mensaje, setMensaje] = useState('');
    const [tipoMensaje, setTipoMensaje] = useState(''); // 'exito' o 'error'

    const handleSubmit = async (e) => {
        // 1. Prevenir el comportamiento por defecto del formulario (recargar la página)
        e.preventDefault();
        setMensaje(''); // Limpiar mensajes previos al enviar

        // 2. Validar que los campos no estén vacíos (validación básica en el frontend)
        if (!nombre || !email || !password) {
            setMensaje('Todos los campos son obligatorios.');
            setTipoMensaje('error');
            return;
        }

        try {
            // 3. Enviar la solicitud POST a la API de PHP
            const apiUrl = `${import.meta.env.VITE_API_URL}/CrearCuenta.php`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            // 4. Manejar la respuesta del servidor
            if (response.status === 201) { // 201 Creado
                setMensaje(data.message);
                setTipoMensaje('exito');
                // Limpiar el formulario en caso de éxito
                setNombre('');
                setEmail('');
                setPassword('');
            } else {
                // Mostrar el mensaje de error del servidor (ej: email duplicado, datos incompletos)
                setMensaje(data.message || 'Ocurrió un error inesperado.');
                setTipoMensaje('error');
            }
        } catch (error) {
            // 5. Manejar errores de red o conexión
            console.error('Error de conexión:', error);
            setMensaje('No se pudo conectar con el servidor. Inténtalo más tarde.');
            setTipoMensaje('error');
        }
    };

    // Renderiza el componente de presentación, pasándole todos los estados
    // y los manejadores de eventos como props.
    return (
        <MostrarCrearCuenta
            nombre={nombre}
            email={email}
            password={password}
            mensaje={mensaje}
            tipoMensaje={tipoMensaje}
            onNombreChange={(e) => setNombre(e.target.value)}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleSubmit}
        />
    );
};

export default CrearCuenta;