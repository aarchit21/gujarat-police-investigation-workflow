const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'docs');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer((request, response) => {
  const pathname = decodeURI(new URL(request.url, 'http://localhost').pathname);
  const file = path.resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  response.setHeader('Content-Type', `${types[path.extname(file)] || 'application/octet-stream'}; charset=utf-8`);
  fs.createReadStream(file).on('error', () => { response.writeHead(404).end(); }).pipe(response);
});
server.listen(8766, '127.0.0.1', () => console.log('Preview at http://127.0.0.1:8766/'));
