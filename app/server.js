import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import cookieParser from "cookie-parser";
import authenticateRoute from "./routers/auth.js";
import productRoute from "./routers/product.js";
import chatRoute from "./routers/chat.js";
import { Server } from "socket.io";
import http from "http";

// Create mongodb session store
// const MongoDBStore = require('connect-mongodb-session')(session);
import MongoDBStore from "connect-mongodb-session";
import mediaRoute from "./routers/media.js";
import userModel from "./models/userModel.js";
import cartRoute from "./routers/cart.js";
import dashBoard from "./routers/dashboard.js";
import { config } from "./config/config.js";

//  constance
const MONGODB_URI = config.mongodbUri;

const app = express();
const server = http.createServer(app);
//tạo server socket
const io = new Server(server, {
  cors: {
    origin: [config.crossDomainAdmin, config.crossDomainClient], // domain 
  },
});
//gán vào global
global.socket = io;

const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: [config.crossDomainAdmin, config.crossDomainClient],
    credentials: true,
    exposedHeaders: 'Set-Cookie'
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

const mongodbStore = MongoDBStore(session);
const store = new mongodbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const sessionMiddleware = session({
  secret: process.env.SECRET,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: 'none',
    secure: true,
  },
  resave: true,
  store,
});

// add middleware session
app.use((req, res, next) => sessionMiddleware(req, res, next));
io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

app.use(async (req, res, next) => {
  if (req.session?.userId) {
    const user = await userModel.findById(req.session.userId);
    req.user = user;
  }
  next();
});

// init socket
io.on("connection", (socket) => {
  console.log(socket.id);
  console.log(io.engine.clientsCount)
});

//init web routes
app.use(authenticateRoute);
app.use(productRoute);
app.use(cartRoute);
app.use(chatRoute);
app.use(dashBoard)
mediaRoute(app);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).send(err.message);
});

// Database connect
mongoose
  .connect(MONGODB_URI)
  .then((result) => console.log("Database connect success"))
  .catch((err) => console.log("Database connect fail"));

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

