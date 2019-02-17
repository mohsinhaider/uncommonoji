/*
    File: server.js
    Description: Server entry point
    Author: @mohsinhaider
*/

let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');
let routes = require('./routes');
let config = require("./config");
// let cors = require('cors');

// Serve up an Express application with http module
let app = express();
app.server = http.createServer(app);

// Configure middleware to use body-parser for express POST
app.use(bodyParser.json({ limit: config.bodyParser.bodyLimit }));
// app.use(cors());

// Handle /api with Router in /routes
app.use('/api', routes);

app.server.listen(config.express.port);
console.log(`[Animoji Server] Server accepting requests on port ${config.express.port}`);

module.exports = app;