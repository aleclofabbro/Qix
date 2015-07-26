define(function() {
  var _connection = {
    status: function(ok, ko) {
      return _export.status(this.hash, ok, ko);
    },
    exec: function(cmd, ok, ko) {
      return _export.exec(cmd, this.hash, ok, ko);
    },
    disconnect: function(ok, ko) {
      return _export.disconnect(this.hash, ok, ko);
    }
  };
  var _export = {
    connect: function(host, user, pass, ok, ko) {
      var _new_connection = Object.create(_connection);
      _new_connection.host = host;
      _new_connection.user = user;
      _new_connection.pass = pass;
      _new_connection.hash = Math.random();
      setTimeout(ok.bind(null, _new_connection), 1000);
    },
    exec: function(cmd, connection_hash, ok, ko) {
      setTimeout(ok.bind(null, 'EXECUTED:' + cmd), 500);
    },
    disconnect: function(connection_hash, ok, ko) {
      setTimeout(ok, 1000);
    },
    status: function(connection_hash, ok, ko) {
      setTimeout(ok.bind(null, 1), 1000);
    }
  };
  return _export;
});