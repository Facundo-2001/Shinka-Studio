import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css'; // Importamos los estilos del módulo
import Boton from '../../components/boton/Boton.jsx'; // Importamos el componente Boton

// Este es un componente "tonto" (dumb/presentational).
// Solo se encarga de mostrar la UI y delegar los eventos a su componente padre.
const MostrarSesion = ({
    usuario,
    email,
    password,
    mensaje,
    onEmailChange,
    onPasswordChange,
    onSubmit,
    onLogout
}) => {
    // Si el usuario ya inició sesión, muestra sus datos y el botón de logout.
    if (usuario) {
        return (
            <div className={`${styles.container} ${styles.welcomeContainer}`}>
                <h2>¡Bienvenido, {usuario.nombre}!</h2>
                <p><strong>ID:</strong> {usuario.id}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Rol:</strong> {usuario.rol}</p>
                <Boton onClick={onLogout}>Cerrar Sesión</Boton>
            </div>
        );
    }

    // Si no hay usuario, muestra el formulario de inicio de sesión.
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Iniciar Sesión</h2>
            <form onSubmit={onSubmit} noValidate className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="login-email" className={styles.label}>Correo Electrónico:</label>
                    <input type="email" id="login-email" value={email} onChange={onEmailChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="login-password" className={styles.label}>Contraseña:</label>
                    <input type="password" id="login-password" value={password} onChange={onPasswordChange} className={styles.input} />
                </div>
                <Boton type="submit">Ingresar</Boton>
            </form>

            {/* Área para mostrar mensajes de error o informativos */}
            {/* En este formulario, el mensaje siempre es de error */}
            {mensaje && <p className={`${styles.message} ${styles.messageError}`}>{mensaje}</p>}

            {/* Enlace para ir a la página de creación de cuenta */}
            <p className={styles.redirectLink}>
                ¿No tenés cuenta? <Link to="/crear-cuenta">Crear cuenta</Link>
            </p>
        </div>
    );
};

export default MostrarSesion;