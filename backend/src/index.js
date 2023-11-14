"use strict"        // We activate strict mode.

import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors"

// -- Routes import -- //
import tests from "./routes/tests.js"
import main from "./routes/main.js"
import auth from "./routes/auth.js"
import user from "./routes/user.js"

// -- Models import -- //
import UserModel from "./model/UserModel.js";
import sequelize from "./common/tools/postgres.js";

dotenv.config()

const origins = ["http://localhost:8000", "http://localhost:5173","https://localhost:8000","https://localhost:5173"]      // A list of accepted origins.
const app = express();
const server = createServer(app);
const port = process.env.NODE_SERVER_PORT;
const corsMiddleware = cors(
    {
        origin: origins,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        preflightContinue: false,
        optionsSuccessStatus: 200,
    })

// Adding CORS.
app.use(corsMiddleware)
app.use(express.json())                                     // Adding support for JSON data format.
app.use(express.urlencoded({ extended: true }))

// -- Routes Import -- //
// Import my routes into the different paths.
app.use('/', main);
app.use('/tests', tests);
app.use('/auth', auth);
app.use('/user', user);
console.log(`[INFO] - Done mounting paths.`);


// -- Models import -- //
await UserModel.sync({ alter: true });           // We allow the insertion of new columns.
console.log(`[INFO] - Done Initializing models.`);

// -- Starting Server listener -- //
server.listen(port, () => console.log(`[INFO] - Server launched on port ${port}. Awaiting requests...`));



