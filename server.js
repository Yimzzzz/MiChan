const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const threadRoutes = require('./routes/threads');
const replyRoutes = require('./routes/replies');
const notificationRoutes = require('./routes/notifications');
const statsRoutes = require('./routes/stats');
const chatRoutes = require('./routes/chat');
const eventRoutes = require('./routes/events');
const reportRoutes = require('./routes/reports');
const uploadRoutes = require('./routes/uploads');
const errorHandler = require('./middleware/errorHandler');
const { ioAttach } = require('./socket');
require('./database');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/threads', replyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(errorHandler);

ioAttach(server);

server.listen(port, () => {
  console.log(`MiChan server listening on http://localhost:${port}`);
});
