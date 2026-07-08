import type { DailyChallenge } from '@/hooks/user-progress';

export const CHALLENGE_MAX_LENGTH = 500;

const VALID_CATEGORIES = [
  'Musica',
  'Lectura',
  'Cine_y_Television',
  'Videojuegos',
  'Comida',
  'Deporte',
  'Salir',
  'Arte',
] as const;

export function getChallengeText(
  challenge: DailyChallenge | null,
): string {
  if (!challenge) return 'Cargando reto...';

  if (challenge.categoria_fija) {
    const value = challenge[challenge.categoria_fija as keyof DailyChallenge];
    if (typeof value === 'string' && value.length > 0) return value;
  }

  for (const cat of VALID_CATEGORIES) {
    const value = challenge[cat];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return 'No hay retos disponibles';
}

export function sanitizeChallengeText(text: string): string {
  return text
    .replace(/[\r\n]/g, ' ')
    .slice(0, CHALLENGE_MAX_LENGTH)
    .trim();
}

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

export function isAllowedMimeType(mimeType: string): boolean {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}