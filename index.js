const express = require('express');
const config = require('./config');
const mongoose = require('mongoose');
const passport = require('passport');
const Admin = require('./models/admins');
const jsonwebtoken = require('jsonwebtoken');
const cors = require('cors');
const extensionRouter = require('./routes/extensionsRouter');
const adminRouter = require('./routes/adminRouter');
const { logInfo, logError } = require('./log');

const url = config.mongoUrl;
const connect = mongoose.connect(url);
connect.then((db) => {
  console.log('Successfully connected to the server')
}), (err) => { console.log(err);};

let app = express();
let server = app.listen(4000, () => {
    console.log('Listening to port 4000');
});

let io = require('socket.io')(server);
app.set('socket', io);

//Enables all cors requests
app.use(cors());

app.use(passport.initialize());

app.use('/extensions', extensionRouter);
app.use('/admin', adminRouter);


//Namespaces
let analyzerNamespace = io.of('/analyzer');
let clientNamespace = io.of('/clients');

//Middleware managing the authentication to the Analyzer namespace
//Makes sure that the source of the connection is an Analyzer

analyzerNamespace.use((socket, next) => {
  authToken = socket.handshake['headers']['auth'];
  decodedAuth = jsonwebtoken.verify(authToken, config.secretKey);
  Admin.findById(decodedAuth._id, (err, analyzer) => {
    if (err) {
      next(err, false);
    }
    else if (analyzer.analyzer) {
      next(null, analyzer);
    }
    else {
      next(new Error('Access unauthorized.'), false);
    }
  });
});


//Middleware managing the authentication to the Client namespace
//Makes sure that the source of the connection is a registered administrator

clientNamespace.use((socket, next) => {
  authToken = socket.handshake.headers['auth'];
  decodedAuth = jsonwebtoken.verify(authToken, config.secretKey);
  Admin.findById(decodedAuth._id, (err, admin) => {
    if (err) {
      next(err, false);
    }
    else if (!admin.analyzer) {
      next(null, admin);
    }
    else {
      next(new Error('Access unauthorized.'), false);
    }
  });
});

analyzerNamespace.on('connection', (socket) => {

    logInfo(socket.id + " connected to the namespace analyzer.");

    //The response even corresponds to a response sent by the analyzer
    socket.on('response', (message) => {

        logInfo(message);

        //Transmits the intstructions to the client
        clientNamespace.emit('instruction', message);

        logInfo('Response: ' + message);
    });

    socket.on('error', (error) => {
        clientNamespace.emit('error', error);

        logError(error);
    });
});


clientNamespace.on('connection', (socket) => {

    logInfo(socket.id + " connected to the namespace clients.");

    //Corresponds to a command sent by the client
    socket.on('command', (message) => {

        logInfo('Command: ' + message.Command);

        //Sends the command to be parsed by the Analyzer
        analyzerNamespace.emit("parse", message);

        logInfo("Parse: " + message);

    });

    //Sent by the client after it executed the instructions it received.
    socket.on('result', (result) => {
        logInfo("Result: " + result);
    });

    socket.on('error', (error) => {
        clientNamespace.emit('error', error);
        logError(error);
    });
});


//Logs any connection to the main namespace. The main namespace should not be used.
io.on('connection', (socket) => {
    logInfo(socket.id + " connected to the main namespace.");
});

//The error handler
app.use((err, req, res, next) => {
  console.log(err);
  logError(err.message);
  return res.send({error: err.message})
});