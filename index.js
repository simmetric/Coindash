var express = require('express');
var server = express();
var options = {
    index: 'index.html'
};
server.use('/', express.static(__dirname + '/', options));
server.listen(process.env.PORT);