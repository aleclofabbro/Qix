(function() {
  "use strict";
  var _strip_first_line = function(str) {
    var arr = str.split(/\n/);
    arr.shift();
    return arr.join('\n');
  };
  // angular.module('ubnt-srvcs')
  //   .factory('ubnt-services', [
  //     'ssh-connection',
  //     '$rootScope',
  //     function(ssh, $rootScope) {
  //       var _curr_conn;
  //       var _scope = $rootScope.$new(true);
  //       var _prepare_new_connection = function() {
  //         if (_curr_conn)
  //           _curr_conn.disconnect();
  //         _curr_conn = ssh.prepare();
  //         _curr_conn.$on('destroyed',
  //           function() {
  //             _scope.$emit('disconnected');
  //             _prepare_new_connection();
  //           });
  //         _curr_conn.$on('connected',
  //           function() {
  //             _scope.$emit('connected');
  //           });
  //       };
  //       _prepare_new_connection();

  //       return angular.extend(_scope, {
  //         isActive: function() {
  //           return (!!_curr_conn) && _curr_conn.isActive();
  //         },
  //         connect: function(conn_params) {
  //           return _curr_conn
  //             .connect(conn_params)
  //             .then(angular.noop);
  //         },
  //         survey: function() {
  //           return _curr_conn
  //             .exec('/usr/www/survey.json.cgi')
  //             .then(function(resp_str) {
  //               var resp_str_strip = _strip_first_line(resp_str);
  //               var links = JSON.parse(resp_str_strip);
  //               links.sort(function(a, b) {
  //                 return a.signal_level > b.signal_level;
  //               });
  //               return links;
  //             });
  //         },
  //         status: function() {
  //           return _curr_conn
  //             .exec('/usr/www/status.cgi')
  //             .then(function(resp_str) {
  //               var resp_str_strip = _strip_first_line(resp_str);
  //               return JSON.parse(resp_str_strip);
  //             });
  //         }
  //       });
  //     }
  //   ]);
})();