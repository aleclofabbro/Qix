cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.alec.cordova.ssh/Client.js",
        "id": "com.alec.cordova.ssh.com.alec.cordova.ssh.Client",
        "clobbers": [
            "alec_ssh"
        ]
    },
    {
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "id": "cordova-plugin-whitelist.whitelist",
        "runs": true
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.alec.cordova.ssh": "0.1.0",
    "cordova-plugin-whitelist": "1.0.0"
}
// BOTTOM OF METADATA
});