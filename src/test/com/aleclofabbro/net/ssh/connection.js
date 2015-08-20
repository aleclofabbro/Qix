require(['com/aleclofabbro/platform/browser-mock/_use']);
require(['com/aleclofabbro/net/ssh/connection'], function(_conn) {
  conn = _conn;
  dbg = {
    tag: 'XXXCONN',
    set: 'ssh'
  };
  dbg_obs(_conn.switch(), dbg);
  _conn.connect({}, function() {
    sess = dbg.ssh.getSession();
    dbg_obs(sess.stdout, 'stdout');
    sess.stdin.onNext('asd')
  });
});