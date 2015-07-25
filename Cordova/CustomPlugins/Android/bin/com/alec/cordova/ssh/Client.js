module.exports = {
	connect: function(host,user,pass,ok,ko) {
        cordova.exec(ok, ko, "AlecSSH", "connect", [host,user,pass]);
    },
    exec: function(cmd,clientHash,ok,ko) {
        cordova.exec(ok, ko, "AlecSSH", "exec", [cmd,clientHash]);
    },
    disconnect: function(clientHash,ok,ko) {
        cordova.exec(ok, ko, "AlecSSH", "disconnect", [clientHash]);
    }
}
