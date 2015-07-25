angular.module('ubnt-srvcs')
  .factory('ubnt-survey', [
    'ubnt-connection',
    'strip-first-line',
    function(connection, _strip_first_line) {
      "use strict";
      var session = connection
        .map(function(ssh_conn) {
          return ssh_conn.getSession();
        });

      var executer = session
        .map(function(ssh_sess) {
          ssh_sess
            .stdin('/usr/www/survey.json.cgi');
          return ssh_sess
            .stdout
            .take(1)
            .map(function(resp_str) {
              var resp_str_strip = _strip_first_line(resp_str);
              var links = JSON.parse(resp_str_strip);
              links.sort(function(a, b) {
                return a.signal_level > b.signal_level;
              });
              return links;
            });
        });

      var surveys = Rx.Observable.create(
        function(observer) {
          var to;
          var execute = function() {
            executer
              .take(1)
              .do(function() {
                to = setTimeout(execute, surveys.interval);
              })
              .subscribe(observer);
          };
          return function() {
            clearTimeout(to);
          };
        });

      surveys.interval = 500;
      return surveys;
    }
  ]);