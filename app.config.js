import { readFileSync } from "fs";

const appJson = JSON.parse(readFileSync("./app.json", "utf-8"));

// Inyectamos los secrets desde el entorno del build (EAS env vars)
// en lugar de commitearlos en app.json. Esto previene que la anon key
// viva en el historial git y en el bundle web estático.
//
// En EAS Build, configurar las siguientes env vars en el dashboard:
//   - SUPABASE_URL
//   - SUPABASE_ANON_KEY
//
// En local (expo start), usar un .env local NO commiteado con esas mismas vars.
const supabaseUrl = process.env.SUPABASE_URL || appJson.expo.extra?.supabaseUrl;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || appJson.expo.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[app.config.js] SUPABASE_URL o SUPABASE_ANON_KEY no están definidas en el entorno. " +
      "Defínelas en EAS Environment Variables (para builds) o en un .env local (para desarrollo)."
  );
}

export default {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...appJson.expo.extra,
      supabaseUrl,
      supabaseAnonKey,
    },
  },
};
