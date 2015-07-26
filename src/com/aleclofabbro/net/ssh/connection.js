define([
    'rx.all',
    // 'pausablbufered',
    'com/aleclofabbro/platform/net/ssh/connection'
  ],
  function(Rx, ssh_impl) {
    "use strict";

    var _session_server = function(connectionSubj, ssh_impl) {
      var _close_connection = function() {
        ssh_impl.disconnect();
        connectionSubj.onComplete();
      };
      var _connection_error = function(err) {
        ssh_impl.disconnect();
        connectionSubj.onError(err);
      };

      connectionSubj.onNext({
        getSession: function() {
          var stdout = new Rx.Subject();
          var stdin = new Rx.Subject();

          var stdin_queue = stdin.pausableBuffered();
          stdin_queue
            .subscribe(function(cmd) {
              stdin_queue.pause();
              ssh_impl.exec(cmd,
                function(resp) {
                  stdout.onNext(resp);
                  stdin_queue.resume();
                }, _connection_error);
            });

          stdin_queue.resume();
          connectionSubj
            .subscribeOnError(_connection_error);
          connectionSubj
            .subscribeOnCompleted(_close_connection);
          return {
            stdin: stdin.asObserver(),
            stdout: stdout.asObservable(),
            close: _close_connection
          };
        }
      });
    };

    var connection_requests = new Rx.Subject();
    var connection_requests_obs = connection_requests.asObservable();
    connection_requests_obs.connect = function(conn_params) {
      var connectionSubj = new Rx.ReplaySubject(1);
      ssh_impl.connect(
        conn_params.host,
        conn_params.user,
        conn_params.pass,
        _session_server.bind(null, connectionSubj),
        connectionSubj.onError);

      var connection_observable = connectionSubj.asObservable();
      connection_requests.onNext(connection_observable);
      return connection_observable;
    };

    return connection_requests_obs;
  });