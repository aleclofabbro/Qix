angular.module('ubnt-srvcs')
  .factory('ubnt-connection', [
    'ssh-connection',
    function(ssh) {
      "use strict";
      var _connections = new Rx.ReplaySubject(1);
      var connection = _connections.switch()
      connection.login = function(conn_params) {
        var _conn = ssh.connect(conn_params);
        _connections.onNext(_conn);
        return _conn;
        // _connections
        //   .take(1)
        //   .subscribe(function(conn) {
        //     conn && conn.close();
        //   });
      };
      connection.reqs = _connections;
      return connection;
    }
  ]);