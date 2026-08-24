import { describe, it, expect } from 'vitest';
import { Correo } from '@/dominio/objetos-valor/correo';

describe('Correo', () => {
  it('crea un correo válido con formato correcto', () => {
    const correo = Correo.crear('usuario@ejemplo.com');
    expect(correo.valor).toBe('usuario@ejemplo.com');
  });

  it('convierte el correo a minúsculas', () => {
    const correo = Correo.crear('Usuario@Ejemplo.COM');
    expect(correo.valor).toBe('usuario@ejemplo.com');
  });

  it('elimina espacios en blanco al inicio y al final', () => {
    const correo = Correo.crear('  usuario@ejemplo.com  ');
    expect(correo.valor).toBe('usuario@ejemplo.com');
  });

  it('lanza error si el correo está vacío', () => {
    expect(() => Correo.crear('')).toThrow('El correo electrónico es obligatorio.');
  });

  it('lanza error si el correo solo tiene espacios', () => {
    expect(() => Correo.crear('   ')).toThrow('El correo electrónico es obligatorio.');
  });

  it('lanza error si el formato es inválido sin @', () => {
    expect(() => Correo.crear('usuarioejemplo.com')).toThrow('El formato del correo electrónico no es válido.');
  });

  it('lanza error si el formato es inválido sin dominio', () => {
    expect(() => Correo.crear('usuario@')).toThrow('El formato del correo electrónico no es válido.');
  });

  it('lanza error si el correo supera los 254 caracteres', () => {
    const correoLargo = 'a'.repeat(250) + '@b.co';
    expect(() => Correo.crear(correoLargo)).toThrow('El correo no puede superar los 254 caracteres.');
  });

  it('compara dos correos iguales correctamente', () => {
    const correo1 = Correo.crear('usuario@ejemplo.com');
    const correo2 = Correo.crear('usuario@ejemplo.com');
    expect(correo1.esIgualA(correo2)).toBe(true);
  });

  it('compara dos correos diferentes correctamente', () => {
    const correo1 = Correo.crear('usuario1@ejemplo.com');
    const correo2 = Correo.crear('usuario2@ejemplo.com');
    expect(correo1.esIgualA(correo2)).toBe(false);
  });
});
