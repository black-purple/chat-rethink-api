import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { authRouter } from './routes/routes.env.js';
import { verifyJWT } from './middleware/verifyToken.js';
dotenv.config();

const app = express();
app.use(express.json());


const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

io.on("connection", (socket) => {
    console.log(socket.id)
});



app.use("/api/auth", authRouter);
app.use("/api/app", verifyJWT, authRouter);


const port = process.env.SERVER_PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}`));