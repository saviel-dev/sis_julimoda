import { describe, it, expect, vi } from 'vitest';
import { IniciarSesion } from '@/aplicacion/casos-uso/iniciar-sesion';
import type { RepositorioAutenticacion } from '@/dominio/puertos/repositorio-autenticacion';
import type { Sesion } from '@/dominio/entidades/sesion';

/**
 * Crea un doble del repositorio de autenticación para las pruebas.
 * Permite configurar la respuesta esperada de iniciarSesion.
 */
function crearDobleRepositorio(respuesta: Sesion): RepositorioAutenticacion {
  return {
    iniciarSesion: vi.fn().mockResolvedValue(respuesta),
  };
}

/**
 * Crea un doble que simula un fallo de autenticación.
 */
function crearDobleRepositorioConError(error: Error): RepositorioAutenticacion {
  return {
    iniciarSesion: vi.fn().mockRejectedValue(error),
  };
}

const SESION_EJEMPLO: Sesion = {
  token: 'token-de-prueba-123',
  usuario: {
    id: '1',
    correo: 'usuario@ejemplo.com',
    nombre: 'Usuario Ejemplo',
  },
};

describe('IniciarSesion', () => {
  it('retorna una sesión cuando las credenciales son válidas', async () => {
    const repositorio = crearDobleRepositorio(SESION_EJEMPLO);
    const casoUso = new IniciarSesion(repositorio);

    const sesion = await casoUso.ejecutar('usuario@ejemplo.com', 'contrasena123');

    expect(sesion).toEqual(SESION_EJEMPLO);
    expect(repositorio.iniciarSesion).toHaveBeenCalledWith(
      'usuario@ejemplo.com',
      'contrasena123'
    );
  });

  it('delega al repositorio con el identificador normalizado', async () => {
    const repositorio = crearDobleRepositorio(SESION_EJEMPLO);
    const casoUso = new IniciarSesion(repositorio);

    await casoUso.ejecutar('  Usuario@Ejemplo.COM  ', 'contrasena123');

    /** El objeto de valor Correo normaliza a minúsculas y sin espacios */
    expect(repositorio.iniciarSesion).toHaveBeenCalledWith(
      'usuario@ejemplo.com',
      'contrasena123'
    );
  });

  it('lanza error de validación si el identificador está vacío', async () => {
    const repositorio = crearDobleRepositorio(SESION_EJEMPLO);
    const casoUso = new IniciarSesion(repositorio);

    await expect(casoUso.ejecutar('', 'contrasena123')).rejects.toThrow(
      'El usuario o correo electrónico es obligatorio.'
    );

    /** No debe llamar al repositorio si la validación falla */
    expect(repositorio.iniciarSesion).not.toHaveBeenCalled();
  });

  it('lanza error de validación si la contraseña es muy corta', async () => {
    const repositorio = crearDobleRepositorio(SESION_EJEMPLO);
    const casoUso = new IniciarSesion(repositorio);

    await expect(casoUso.ejecutar('usuario@ejemplo.com', '1234')).rejects.toThrow(
      'La contraseña debe tener al menos 8 caracteres.'
    );

    expect(repositorio.iniciarSesion).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio al fallar la autenticación', async () => {
    const errorEsperado = new Error('Credenciales inválidas');
    const repositorio = crearDobleRepositorioConError(errorEsperado);
    const casoUso = new IniciarSesion(repositorio);

    await expect(casoUso.ejecutar('usuario@ejemplo.com', 'contrasena123')).rejects.toThrow(
      'Credenciales inválidas'
    );
  });

  it('acepta un nombre de usuario como identificador', async () => {
    const repositorio = crearDobleRepositorio(SESION_EJEMPLO);
    const casoUso = new IniciarSesion(repositorio);

    await casoUso.ejecutar('juanperez', 'contrasena123');

    expect(repositorio.iniciarSesion).toHaveBeenCalledWith(
      'juanperez',
      'contrasena123'
    );
  });
});
