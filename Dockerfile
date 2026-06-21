# Imagen del backend Bun con Chromium, para que jsreport pueda generar PDFs.
FROM oven/bun:latest

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       chromium ca-certificates fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

ENV CHROMIUM_PATH=/usr/bin/chromium \
    PUPPETEER_SKIP_DOWNLOAD=true

WORKDIR /home/bun/app
