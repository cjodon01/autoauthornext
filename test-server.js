const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<h1>Test Server Working</h1><p>Basic Node.js server is running!</p>');
});

const port = 3002;
server.listen(port, '0.0.0.0', () => {
  console.log(`Test server running at http://localhost:${port}`);
  console.log(`Test server running at http://0.0.0.0:${port}`);
});