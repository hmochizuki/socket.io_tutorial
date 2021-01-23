const express = require('express');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  const content = fs.readFileSync(`${__dirname}/public/index.html`, 'utf8');

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(content));
  res.send(content);
});

io.on('connection', (socket) => {
  io.emit('info', '新しいユーザーが参加しました');

  socket.on('chat message', ({ msg, nickname }) => {
    socket.broadcast.emit('chat message', { msg, nickname });
  });

  socket.on('typing', (nickname) => {
    const name = nickname || 'anonymous';
    socket.broadcast.emit('info', `${name} is typing...`);
  });

  socket.on('disconnect', () => {
    io.emit('info', 'ユーザーが離脱しました');
  });

  socket.on('nickname', (nickname) => {
    socket.emit('info', `ニックネームが${nickname}に設定されました`);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
