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
  io.emit('session in', '新しいユーザーが参加しました');

  socket.on('chat message', ({ msg, nickname }) => {
    io.emit('chat message', { msg, nickname });
  });

  socket.on('disconnect', () => {
    io.emit('session out', 'ユーザーが離脱しました');
  });

  socket.on('nickname', (nickname) => {
    socket.emit('nickname', `ニックネームが${nickname}に設定されました`);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
