var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, {
    appRootDir: __dirname,
    config: require('./config'),
    dataSources: require('./datasources')
});

function corsMiddleware(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
};

app.use(corsMiddleware);

app.emit('routes defined');

// -- Mount static files here--
// All static middleware should be registered at the end, as all requests
// passing the static middleware are hitting the file system
// Example:
//   app.use(loopback.static(path.resolve(__dirname', '../client')));

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

// The ultimate error handler.
app.use(loopback.errorHandler());

//{ "principalType": "ROLE", "principalId": "$everyone", "permission": "ALLOW" },

app.start = function() {
  // start the web server
  return app.listen(process.env.PORT || 3000, function() {
    app.emit('started');
    console.log('Web server listening at: %s', process.env.PORT || 3000);
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}