const { Server } = require('socket.io');
const { findSessionByToken } = require('./models/sessions');

function ioAttach(server) {
  const io = new Server(server, {
    cors: { origin: true, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('authentication required'));
    findSessionByToken(token, (err, session) => {
      if (err || !session) return next(new Error('invalid session'));
      if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
        return next(new Error('session expired'));
      }
      socket.userId = session.userId;
      next();
    });
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('send-message', ({ conversationId, content }) => {
      io.to(`conversation:${conversationId}`).emit('message', { conversationId, senderId: socket.userId, content, createdAt: new Date().toISOString() });
    });

    socket.on('join-conversation', ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('disconnect', () => {
      socket.leave(`user:${socket.userId}`);
    });
  });
}

module.exports = { ioAttach };