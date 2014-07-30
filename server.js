var express      = require('express'),
    st           = require('st'),
    vhost        = require('vhost'),
    morgan       = require('morgan'),
    httpProxy    = require('http-proxy'),
    errorHandler = require('errorhandler'),
    env          = process.env.NODE_ENV || 'development',
    port         = process.env.PORT || 3000;

var app = express();

// setup proxy
var proxy = httpProxy.createProxyServer();
proxy.on('error', function (err, req, res) {
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Ah shit, that site is down. Balls :(');
});

if (env === 'development') {
  app.use(errorHandler());
}

// logging
app.use(morgan('combined'));

// thriftymum.com (ghost)
var thriftyMum = function(req, res, next) {
  // ensure we are on www.thethriftymum.com
  if (req.hostname !== 'www.thethriftymum.com')
    res.redirect(301, 'http://www.thethriftymum.com' + req.path);
  else
    proxy.web(req, res, { target: 'http://localhost:2368' });
}

app.use(vhost('thethriftymum.com', thriftyMum));
app.use(vhost('*.thethriftymum.com', thriftyMum));

// ws-html.ryanl.me
app.use(vhost('ws-html.ryanl.me', st({path: '/opt/ws-html.ryanl.me', index: 'index.html'})));

// default site (blog)
var blog = st({ path: '/opt/blog/_site', index: 'index.html' });
app.use(blog);

app.listen(port);
console.log('Server started on ' + port);
