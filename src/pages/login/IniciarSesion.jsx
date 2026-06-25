import React, { useState } from 'react';
import MostrarSesion from './MostrarSesion.jsx'; // 1. Importamos el componente de presentación

// Este es un componente "inteligente" (smart/container).
// Se encarga de la lógica: manejar el estado, las llamadas a la API y los eventos.
const IniciarSesion = () => {
    // Estados para los campos del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Estado para el usuario que ha iniciado sesión (la fuente de la verdad)
    const [usuario, setUsuario] = useState(null);

    // Estado para mostrar mensajes al usuario (errores, éxito, etc.)
    const [mensaje, setMensaje] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje(''); // Limpiar mensaje previo

        if (!email || !password) {
            setMensaje('Se requiere email y contraseña.');
            return;
        }

        try {
            const response = await fetch('http://localhost/api-shinka/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            // Si la respuesta es exitosa (status 200 OK)
            if (response.ok) {
                // Usamos el spread operator para crear una copia del objeto usuario
                // y guardarlo en el estado.
                setUsuario({ ...data.usuario });
                
                // Limpiar formulario
                setEmail('');
                setPassword('');
            } else {
                // Si hay un error (ej. 401 Credenciales inválidas), mostramos el mensaje
                setMensaje(data.message || 'Ocurrió un error.');
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            setMensaje('No se pudo conectar con el servidor.');
        }
    };

    // Función para simular el cierre de sesión
    const handleLogout = () => {
        setUsuario(null);
        setMensaje('Has cerrado la sesión.');
    };

    // 3. Renderiza el componente de presentación y le pasa todos los estados y manejadores como props.
    return (
        <MostrarSesion
            usuario={usuario}
            email={email}
            password={password}
            mensaje={mensaje}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onSubmit={handleSubmit}
            onLogout={handleLogout}
        />
    );
};

export default IniciarSesion;