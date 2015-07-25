var _connection = {
  status: function(ok, ko) {
    return module.exports.status(this.hash, ok, ko);
  },
  exec: function(cmd, ok, ko) {
    return module.exports.exec(cmd, this.hash, ok, ko);
  },
  disconnect: function(ok, ko) {
    return module.exports.disconnect(this.hash, ok, ko);
  }
};


module.exports = {
  connect: function(host, user, pass, ok, ko) {
    cordova.exec(function(hash) {
      var _new_connection = Object.create(_connection);
      _new_connection.host = host;
      _new_connection.user = user;
      _new_connection.pass = pass;
      _new_connection.hash = hash;
      ok(_new_connection);
    }, ko, "AlecSSH", "connect", [host, user, pass]);
  },
  exec: function(cmd, connection_hash, ok, ko) {
    cordova.exec(ok, ko, "AlecSSH", "exec", [cmd, connection_hash]);
  },
  disconnect: function(connection_hash, ok, ko) {
    cordova.exec(ok, ko, "AlecSSH", "disconnect", [connection_hash]);
  },
  status: function(connection_hash, ok, ko) {
    cordova.exec(ok, ko, "AlecSSH", "status", [connection_hash]);
  }
};