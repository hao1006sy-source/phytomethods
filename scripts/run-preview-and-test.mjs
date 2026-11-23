import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const port = 4399;
const basePrefix = '/phytomethods';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url?.split('?')[0] || '/');
  if (urlPath.startsWith(basePrefix)) {
    urlPath = urlPath.slice(basePrefix.length) || '/';
  }

  let filePath = path.join(distDir, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, '404.html');
  }

  if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

await new Promise((resolve) => {
  server.listen(port, '127.0.0.1', () => {
    console.log(`Static server running at http://127.0.0.1:${port}${basePrefix}/`);
    resolve(true);
  });
});

process.env.PORT = String(port);
process.env.PHYTOMETHODS_PREVIEW_BASE = `http://127.0.0.1:${port}${basePrefix}`;

try {
  console.log('Running browser visual inspection...');
  await import('./browser-test-paper-v3.mjs');
  console.log('Test completed successfully!');
} catch (err) {
  console.error('Test execution error:', err);
  process.exitCode = 1;
} finally {
  server.close(() => {
    console.log('Server stopped.');
  });
}
