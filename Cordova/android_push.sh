cd cordova
#cordova platform remove android
#cordova platform add android
cordova build android
adb install -r platforms/android/build/outputs/apk/android-debug.apk
adb logcat -c
adb logcat | grep Web
