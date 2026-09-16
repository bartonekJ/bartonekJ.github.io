// Local preview only. Run from any directory: node experiments/hero-atom/serve.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml',
  '.ttf':'font/ttf', '.woff2':'font/woff2', '.webp':'image/webp', '.png':'image/png' };
http.createServer((request, response) => {
  let filename;
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    filename = path.resolve(root, '.' + pathname.replace(/\\/g, '/'));
    if (!filename.startsWith(root + path.sep) && filename !== root) throw new Error();
    if (fs.statSync(filename).isDirectory()) filename = path.join(filename, 'index.html');
  } catch { response.writeHead(404); response.end('Not found'); return; }
  fs.readFile(filename, (error, data) => {
    if (error) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type':types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    response.end(data);
  });
}).listen(4173, '127.0.0.1', () => console.log('Hero prototype: http://127.0.0.1:4173/experiments/hero-atom/'));
