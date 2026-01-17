import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure via env vars:
// BASE_PATH: where the app will be mounted (e.g. '/app'). Default: '/'
// DIST_DIR: folder with built files. Default: 'dist'
// PORT: server port. Default: 3000
const BASE_PATH = process.env.BASE_PATH || '/ljgodfront';
const DIST_DIR = process.env.DIST_DIR || 'dist';
const PORT = process.env.PORT || 21096;

const app = express();

// Log requests for debugging prefix/forwarding issues
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

if (BASE_PATH === '/') {
    console.log(path.join(__dirname, DIST_DIR, 'index.html'))
  app.use(express.static(path.join(__dirname, DIST_DIR)));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, DIST_DIR, 'index.html'));
  });
} else {
  // normalize mount path: leading slash, no trailing slash
  const mount = BASE_PATH.startsWith('/') ? BASE_PATH : '/' + BASE_PATH;
  const mountNoTrailing = mount.endsWith('/') ? mount.slice(0, -1) : mount;

  app.use(mountNoTrailing, express.static(path.join(__dirname, DIST_DIR)));
  // serve index.html for exact mount (e.g. /ljgodfront) and for nested routes
  app.get(mountNoTrailing, (req, res) => {
    res.sendFile(path.join(__dirname, DIST_DIR, 'index.html'));
  });
  app.get(`${mountNoTrailing}/`, (req, res) => {
    res.sendFile(path.join(__dirname, DIST_DIR, 'index.html'));
  });
  app.get(`${mountNoTrailing}/*`, (req, res) => {
    res.sendFile(path.join(__dirname, DIST_DIR, 'index.html'));
  });

  // Also serve at root in case the hosting strips the mount prefix before forwarding
  app.use(express.static(path.join(__dirname, DIST_DIR)));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, DIST_DIR, 'index.html'));
  });
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}, serving ${DIST_DIR} at '${BASE_PATH}'`);
});
