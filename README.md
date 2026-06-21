# Dependencias
docker - https://www.docker.com/products/docker-desktop/

# Como correr 
busca este boton en vscode
<img width="91" height="35" alt="image" src="https://github.com/user-attachments/assets/3f6ee64a-fee1-4378-94a2-8f85d9b50f82" />

le das a abrir nueva terminal y se abrira este cosito

<img width="566" height="121" alt="image" src="https://github.com/user-attachments/assets/f527f934-6cc0-46f7-a420-ef5220c743b6" />

ahi vas a escribir esto
``` docker compose up --build```
y le das a enter

> **Importante:** usa `--build` (el backend ahora se construye con una imagen propia que incluye Chromium para los PDF de jsreport). La primera vez tarda un poco mientras descarga Chromium.

si se ve asi entonces ua esta corriendo
<img width="957" height="242" alt="image" src="https://github.com/user-attachments/assets/87ba6d9f-39a1-46a9-abbd-031853488f47" />

pagina web: [localhost:3000](http://localhost:3000/)
pgadmin: http://localhost:8080/

## Base de datos

La base de datos se **carga sola** la primera vez: al crear un volumen nuevo, Postgres
ejecuta `db-init/00-load.sh`, que corre los scripts de `src/sql` en este orden:

```
drop.sql -> create.sql -> constraints.sql -> procedures.sql -> reports.sql -> insert.sql -> trigger.sql
```

No hace falta cargar nada a mano. La data persiste en el volumen `pgdata` entre `up`/`down`.

**Para reiniciar la BD desde cero** (recargar esquema + datos semilla):

``` docker compose down -v && docker compose up --build```

(El `-v` borra el volumen `pgdata`; sin `-v` la data se conserva.)
