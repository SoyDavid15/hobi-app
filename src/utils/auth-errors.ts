import type { AuthError } from '@supabase/supabase-js';

export function getFriendlyAuthError(error: AuthError): string {
  const code = error.code || error.message || '';
  const message = error.message || '';

  if (
    code === 'invalid_credentials' ||
    message === 'Invalid login credentials'
  ) {
    return 'Credenciales inválidas. Verifica tu email y contraseña.';
  }
  if (
    code === 'email_not_confirmed' ||
    message === 'Email not confirmed'
  ) {
    return 'Debes confirmar tu correo antes de iniciar sesión.';
  }
  if (code === 'user_not_found') {
    return 'Credenciales inválidas. Verifica tu email y contraseña.';
  }
  if (code === 'weak_password' || message === 'Password should be at least 6 characters.') {
    return 'La contraseña no cumple los requisitos mínimos.';
  }
  if (
    code === 'over_request_rate_limit' ||
    message === 'For security purposes, you can only request this after 30 seconds.'
  ) {
    return 'Demasiados intentos. Inténtalo más tarde.';
  }
  if (
    code === 'email_exists' ||
    code === 'user_already_registered' ||
    message === 'User already registered'
  ) {
    return 'Ya existe una cuenta con este correo.';
  }
  if (code === 'signup_disabled') {
    return 'El registro de nuevas cuentas no está disponible.';
  }
  if (message === 'Password should be at least 6 characters long.') {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }

  return 'Se produjo un error. Inténtalo de nuevo.';
}

export function getFriendlySignupError(error: AuthError): string {
  const code = error.code || error.message || '';
  const message = error.message || '';

  if (
    code === 'email_exists' ||
    code === 'user_already_registered' ||
    message === 'User already registered'
  ) {
    return 'Ya existe una cuenta con este correo. Inicia sesión.';
  }
  if (code === 'weak_password') {
    return 'La contraseña no cumple los requisitos mínimos.';
  }
  if (
    code === 'over_request_rate_limit' ||
    message === 'For security purposes, you can only request this after 30 seconds.'
  ) {
    return 'Demasiados intentos. Inténtalo más tarde.';
  }

  return getFriendlyAuthError(error);
}
