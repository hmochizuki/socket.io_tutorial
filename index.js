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

const users = [];

io.on('connection', (socket) => {
  socket.on('chat message', ({ msg, nickname }) => {
    socket.broadcast.emit('chat message', { msg, nickname });
  });

  socket.on('typing', (nickname) => {
    const name = nickname || 'anonymous';
    socket.broadcast.emit('info', `${name} is typing...`);
  });

  socket.on('disconnect', () => {
    const index = users.findIndex((u) => u.id === socket.id);
    io.emit('leave', socket.id);
    if (users[index]) {
      io.emit('info', `${users[index].nickname}が離脱しました`);
      users.splice(index, 1);
    }
  });

  socket.on('nickname', (nickname) => {
    socket.emit('info', `ニックネームが${nickname}に設定されました`);
  });

  socket.on('join', (nickname) => {
    const user = {
      id: socket.id,
      nickname,
    };
    users.push(user);
    socket.broadcast.emit('info', `${nickname}が参加しました`);
    socket.emit('users', users);
    socket.broadcast.emit('join', user);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
