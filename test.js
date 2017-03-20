// load dependencies
var express = require('express')
var session = require('express-session');
var http = require('http')

// initalize sequelize with session store

// Access the session as req.session
// app.get('/', function(req, res, next) {
//   var sess = req.session
//   if (sess.views) {
//     sess.views++
//     res.setHeader('Content-Type', 'text/html')
//     res.write('<p>views: ' + sess.views + '</p>')
//     res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>')
//     res.end()
//   } else {
//     sess.views = 1
//     res.send('welcome to the session demo. refresh!')
//   }
// })
var app = express()

app.get('/', function(req, res, next) {
  res.send('Hello world!')
})

const server = new http.Server(app);

// listen on port config.port
server.listen(8000, () => {
  console.log(`server started on port 8000`);
});
