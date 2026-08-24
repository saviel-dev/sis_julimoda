import { describe, it, expect } from 'vitest';
import { Contrasena } from '@/dominio/objetos-valor/contrasena';

describe('Contrasena', () => {
  it('crea una contraseña válida con longitud suficiente', () => {
    const contrasena = Contrasena.crear('12345678');
    expect(contrasena.valor).toBe('12345678');
  });

  it('lanza error si la contraseña está vacía', () => {
    expect(() => Contrasena.crear('')).toThrow('La contraseña es obligatoria.');
  });

  it('lanza error si la contraseña tiene menos de 8 caracteres', () => {
    expect(() => Contrasena.crear('1234567')).toThrow(
      'La contraseña debe tener al menos 8 caracteres.'
    );
  });

  it('lanza error si la contraseña supera los 128 caracteres', () => {
    const contrasenaLarga = 'a'.repeat(129);
    expect(() => Contrasena.crear(contrasenaLarga)).toThrow(
      'La contraseña no puede superar los 128 caracteres.'
    );
  });

  it('acepta una contraseña con exactamente 8 caracteres', () => {
    const contrasena = Contrasena.crear('abcdefgh');
    expect(contrasena.valor).toBe('abcdefgh');
  });

  it('acepta una contraseña con exactamente 128 caracteres', () => {
    const valor = 'a'.repeat(128);
    const contrasena = Contrasena.crear(valor);
    expect(contrasena.valor).toBe(valor);
  });
});
