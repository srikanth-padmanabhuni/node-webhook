const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = 8000

const startServer = () => {
    app.listen(PORT, () => {
        console.log("App server running on port " + PORT);
    })
}

const addMiddleWares = () => {
    app.use(express.json());
    app.use(morgan(function (tokens, req, res) {
        return [
          '[' + new Date().toLocaleString() + ']',
          '[' + path.basename(__filename) + ']',
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'),
          '-',
          tokens['response-time'](req, res), 'ms',
        ].join(' ');
      }));
}

const addRoutes = () => {
    app.get('/healthCheck', (req, res) => {
        return res.json({
            body: "Webhook working fine",
            status: 200
        })
    })
    
    app.post('/notify', (req, res) => {
        console.log(req.body);
        return res.json({
            data: "Thanks for notification",
            status: 200
        })
    })
}

addMiddleWares();
addRoutes();
startServer();