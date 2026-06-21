#!/bin/bash
# Carga el esquema + datos en orden. Postgres ejecuta este script una sola vez,
# al inicializar un volumen de datos vacio (docker-entrypoint-initdb.d).
set -e

for f in drop create constraints procedures reports insert trigger; do
  echo ">> cargando ${f}.sql"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "/sql/${f}.sql"
done

echo ">> base de datos inicializada"
