import express, { static } from 'express';
var server = express();
var options = {
    index: 'index.html'
};
server.use('/', static('/home/site/wwwroot', options));
server.listen(process.env.PORT);