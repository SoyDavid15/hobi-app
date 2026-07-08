import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;
const LOGIN_ATTEMPTS_KEY = '@hobi-login-attempts';
const LAST_ATTEMPT_KEY = '@hobi-last-attempt';

export function isRateLimited(): boolean {
  try {
    const attemptsStr = AsyncStorage.getItemSync(LOGIN_ATTEMPTS_KEY);
    const lastAttemptStr = AsyncStorage.getItemSync(LAST_ATTEMPT_KEY);
    const attempts = parseInt(attemptsStr || '0', 10);
    const lastAttempt = parseInt(lastAttemptStr || '0', 10);
    if (attempts >= MAX_ATTEMPTS && Date.now() - lastAttempt < LOCKOUT_MS) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function recordFailedAttempt(): Promise<void> {
  const attemptsStr = await AsyncStorage.getItem(LOGIN_ATTEMPTS_KEY);
  const attempts = parseInt(attemptsStr || '0', 10) + 1;
  await AsyncStorage.multiSet([
    [LOGIN_ATTEMPTS_KEY, String(attempts)],
    [LAST_ATTEMPT_KEY, String(Date.now())],
  ]);
}

export async function resetAttempts(): Promise<void> {
  await AsyncStorage.multiRemove([LOGIN_ATTEMPTS_KEY, LAST_ATTEMPT_KEY]);
}

export async function remainingLockoutMs(): Promise<number> {
  const attemptsStr = await AsyncStorage.getItem(LOGIN_ATTEMPTS_KEY);
  const lastAttemptStr = await AsyncStorage.getItem(LAST_ATTEMPT_KEY);
  const attempts = parseInt(attemptsStr || '0', 10);
  const lastAttempt = parseInt(lastAttemptStr || '0', 10);
  if (attempts < MAX_ATTEMPTS) return 0;
  const elapsed = Date.now() - lastAttempt;
  return Math.max(0, LOCKOUT_MS - elapsed);
}