# ============================================================
# Hobi - Scrub del historial git (Fase 1, paso final)
# ============================================================
# Ejecutar MANUALMENTE desde el directorio hobi/hobi.
# NO commitear este archivo. NO lo ejecute el asistente por usted.
#
# Requisitos:
#   - BFG Repo-Cleaner instalado (https://rtyley.github.io/bfg-repo-cleaner/)
#     brew install bfg
#     o descargar el .jar desde https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
#
# Pasos:
# ============================================================
#
# 0) Antes de nada, coordinar con cualquier otro dev: el force-push
#    reescribe el historial y obliga a todos a re-clonar.
#
# 1) Hacer una copia de seguridad del repo (por si acaso):
#    git clone --mirror https://github.com/<usuario>/<repo>.git hobi-backup.git
#
# 2) Ejecutar BFG contra secrets-to-scrub.txt:
#    bfg --replace-text secrets-to-scrub.txt hobi-backup.git
#
# 3) Limpiar objetos huérfanos:
#    cd hobi-backup.git
#    git reflog expire --expire=now --all
#    git gc --prune=now --aggressive
#
# 4) Force-push (¡coordina antes!):
#    git push origin --force --all
#    git push origin --force --tags
#
# 5) Eliminar secrets-to-scrub.txt de tu working copy una vez hecho:
#    rm secrets-to-scrub.txt
#
# 6) En el dashboard de Supabase: Settings -> API -> Rotate publishable key
#    (esto invalida la key vieja: aunque esté en el historial scrubbed,
#     si ya fue expuesta públicamente asumimos que fue scraped por bots.)
#
# 7) En el dashboard de Expo (EAS): crear las env vars en el proyecto:
#    eas env:create --environment production SUPABASE_URL https://...
#    eas env:create --environment production SUPABASE_ANON_KEY sb_publishable_...
#    Repetir para preview y development.
#
# 8) En local: crear un .env (NO commiteado, ya está en .gitignore) con:
#    SUPABASE_URL=https://<nuevo-proyecto>.supabase.co
#    SUPABASE_ANON_KEY=<nueva-key>
#
# El código en la app lee via Constants.expoConfig.extra que app.config.js
# rellena desde process.env en build/start time.
# ============================================================
