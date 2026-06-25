import React from 'react';
import styles from './Login.module.css'; // Importamos los estilos del módulo
import Boton from '../../components/boton/Boton.jsx'; // Importamos el componente Boton

// Este es un componente "tonto" (dumb/presentational).
// Solo se encarga de renderizar el formulario y delegar los eventos
// a su componente padre a través de las props.
const MostrarCrearCuenta = ({
    nombre,
    email,
    password,
    mensaje,
    tipoMensaje,
    onNombreChange,
    onEmailChange,
    onPasswordChange,
    onSubmit
}) => {
    // Determina la clase del mensaje según el tipo
    const messageClass = tipoMensaje === 'error' ? styles.messageError : styles.messageSuccess;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Crear Nueva Cuenta</h2>
            <form onSubmit={onSubmit} noValidate className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="nombre" className={styles.label}>Nombre:</label>
                    <input type="text" id="nombre" value={nombre} onChange={onNombreChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>Correo Electrónico:</label>
                    <input type="email" id="email" value={email} onChange={onEmailChange} className={styles.input} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password" className={styles.label}>Contraseña:</label>
                    <input type="password" id="password" value={password} onChange={onPasswordChange} className={styles.input} />
                </div>
                <Boton type="submit">Crear Cuenta</Boton>
            </form>

            {/* Área para mostrar mensajes de éxito o error */}
            {mensaje && <p className={`${styles.message} ${messageClass}`}>{mensaje}</p>}
        </div>
    );
};

export default MostrarCrearCuenta;