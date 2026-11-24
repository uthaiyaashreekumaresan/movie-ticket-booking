import http from 'node:http';

const server = http.createServer((req, res) => {
  const isApi = req.url.startsWith('/api');
  const targetPort = isApi ? 4000 : 5173;

  const options = {
    hostname: '127.0.0.1',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${targetPort}` }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Forwarding to ${targetPort} error: ${err.message}` }));
  });

  req.pipe(proxyReq, { end: true });
});

server.on('upgrade', (req, socket) => {
  const proxyReq = http.request({
    hostname: '127.0.0.1',
    port: 5173,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: 'localhost:5173' }
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket) => {
    socket.write(`HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(proxyRes.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
      '\r\n\r\n');
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', () => {
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(5174, '0.0.0.0', () => {
  console.log('✓ Forwarder active: http://localhost:5174 -> http://localhost:5173 (API -> 4000)');
});
