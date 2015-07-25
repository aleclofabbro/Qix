cd cordova
cordova plugin remove com.alec.cordova.ssh
cordova platform remove browser
cordova platform remove android
cordova plugin add ~/Eclipse/AndroidPlugins/src/com/alec/cordova/ssh/
cordova platform add browser --usegit
cordova platform add android

