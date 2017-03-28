// load dependencies
var express = require('express')
var Sequelize = require('sequelize')
var session = require('express-session');
var http = require('http')
// https://github.com/expressjs/session/pull/159
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
var SequelizeStore = require('connect-session-sequelize')(session.Store);

var sequelize = new Sequelize('postgresql://localhost/test');

var Session = sequelize.define('Session', {
  sid: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  userId: {type: Sequelize.INTEGER, field: 'user_id'},
  expires: Sequelize.DATE,
  data: Sequelize.JSONB
});

function extendDefaultFields(defaults, session) {
  return {
    data: defaults.data,
    expires: defaults.expires,
    userId: session.userId
  };
}

var app = express()


app.get('/sync', function(req, res, next) {
  console.log('sequelize.sync()')
  sequelize.sync({force: true})
  .then(() => res.end('sync'))

})

var sessOpt = {
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 6000 * 1000 },
  store: new SequelizeStore({
    db: sequelize,
    expiration: 24 * 60 * 60 * 1000,  // ms
    table: 'Session',
    extendDefaultFields: extendDefaultFields
  }),
};
app.use(session(sessOpt))

const port = 8000
const domain = 'http://localhost:' + port
const makeURL = name => domain + '/' + name
const makeLink = name => '<a href="' + makeURL(name) + '">' + name + '</a>'

function msg() {
  return makeLink('login/' +  Math.floor(Math.random() * 10000)) + '<br>' +
  makeLink('logout') + '<br>' +
  makeLink('counter') + '<br>'

}
function end(res, customMsg) {
  res.end(msg() + customMsg)
}
app.get('/', function(req, res, next) {
  end(res, 'Hello !')
})
const getMaxId = () => Session.findAll({
  attributes: [
    [sequelize.fn('MAX', sequelize.col('user_id')), 'maxId']
  ],
})

app.get('/login/:id', function(req, res, next) {
  var sess = req.session;
  sess.userId = req.params.id
  sess.views = 1
  end(res, `welcome to the session demo ${sess.userId}. refresh!`)
})

app.get('/counter', function(req, res, next) {
  console.log(req)
  var sess = req.session;
  console.log(sess)
  if (sess.views) {
    sess.views++
    end(res, 'hello user ' + sess.userId + ' we saw you ' + sess.views)
  } else {
    end('403', res)
  }
})

app.get('/dump', function(req, res, next) {
  console.log(req)
  res.end('de')
})
app.get('/logout', function(req, res, next) {
  var sess = req.session;
  req.session.destroy();
  end(res, 'logout for ' + sess.userId)
})

const server = new http.Server(app);

// listen on port config.port
server.listen(port, () => {
  console.log('server started on ' + domain);
});


// TODO
// cannot login again when the user is already logged in
// cannot logout if already login
//
