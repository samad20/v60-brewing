# V60 Coffee Brewing Guide

An Angular Material app that walks you through a V60 pour-over recipe — hot or cold, with English and Arabic (RTL) support.

## Development

```bash
npm install
npm start
```

The dev server runs on `http://localhost:4200/` with hot reload.

## Production build

```bash
npm run build
```

Output goes to `dist/v60-app/browser/`.

## Deploy with Docker

The repo ships a multi-stage `Dockerfile` (Node build → nginx serve) and an `nginx.conf` that includes SPA fallback so client-side routes resolve correctly. The container listens on **port 80**.

Build the image:

```bash
docker build -t v60-brewing .
```

Run it, mapping host port 80 to the container:

```bash
docker run -d --name v60-brewing -p 80:80 v60-brewing
```

Open `http://localhost/`. To use a different host port, change the left side of `-p`, e.g. `-p 8080:80` and browse `http://localhost:8080/`.

## Deploy with Docker Compose

A `docker-compose.yml` is included. It builds the image from the local `Dockerfile` and exposes port 80.

Start the stack:

```bash
docker compose up -d
```

Rebuild after code changes:

```bash
docker compose up -d --build
```

View logs:

```bash
docker compose logs -f
```

Stop and remove the container:

```bash
docker compose down
```

## License

Released under the [MIT License](LICENSE).
