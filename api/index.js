import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import conversationRoute from "./routes/conversation.route.js";
import notificatonRoute from "./routes/notification.route.js";
import messageRouter from './routes/message.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http'; // Import for creating HTTP server

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();

const app = express();

// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true
// }));
const expressServer = http.createServer(app); // Use http to create server
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  credentials: true, // Allow sending credentials
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allow these HTTP methods
};

if (process.env.NODE_ENV === "local") {
  corsOptions.origin = "http://localhost:5173"; // Local origin
} else {
  corsOptions.origin = process.env.FRONTEND_URL || "http://localhost:5173"; // Use environment variable or fallback to localhost:5173
}

app.use(cors(corsOptions));



app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use("/api/message", messageRouter);
app.use("/api/conversation", conversationRoute);
app.use("/api/notification", notificatonRoute);

// Serve static files
app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// --------------------------Socket.IO Integration------------------------------

const io = new Server(expressServer, {

  cors: {
    origin: "http://localhost:5173", // Frontend URL
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`socket connected with ${socket.id}`);

  socket.on("join_room", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send_message", (data) => {
    socket.to(data.chatId).emit("receive_message", data);
    socket.broadcast.emit(`${data.to}`, data);
  });

  socket.on("disconnect", (data) => {
    console.log(`user disconnected successfully ${socket.id}`);
  });
});

// --------------------------Deployment------------------------------
expressServer.listen(3000, () => {
  console.log('Server is running on port 3000!');
});
