import http from 'node:http';
import path from 'node:path';
import { serveStatic } from './utils/serveStatic.js';
const PORT = 8000

const __dirname = import.meta.dirname
// C:\Users\ASUS\Desktop\User\Java Dash
const publicPath = path.join(__dirname, 'public');
// C:\Users\ASUS\Desktop\User\Java Dash\public

const server = http.createServer(async (req, res) => {
    await serveStatic(req, res, __dirname)
})

server.listen(PORT, '127.0.0.1',() => {
    console.log(`Server is running on port ${PORT}`);
})