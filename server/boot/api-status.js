module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/api', server.loopback.status());
  server.use(router);
};
