(function() {

  var _export = {
    connect: function(success, fail, args) {
      var host = args[0];
      var user = args[1];
      var pass = args[2];
      console.log('********* connect', arguments);
      setTimeout(success.bind(null, 'xxx_hash'), 1000);
    },
    disconnect: function(success, fail, args) {
      console.log('********* disconnect', arguments);
      setTimeout(success, 1000);
    },
    exec: function(success, fail, args) {
      var cmd = args[0];
      var clientHash = args[1];
      console.log('********* exec', arguments);
      setTimeout(function() {
        var _result = JSON.parse(JSON.stringify(survey_result));
        _result.forEach(function(item) {
          var sig = Number(item.signal_level);
          sig = Math.round(sig + 10 * (Math.random() - 0.5));
          item.signal_level = String(sig);
        });
        success(header + JSON.stringify(_result, null, 4));
      }, 500);
    }
  };

  require("cordova/exec/proxy").add("AlecSSH", _export);



  ///



  var header = 'Content-Type: text/html\n\n';
  var survey_result = [{
    "mac": "68:72:51:0E:E3:2C",
    "mode": "Master",
    "frequency": "2.417",
    "channel": "2",
    "quality": "16/94",
    "signal_level": "-80",
    "noise_level": "-50",
    "encryption": "none",
    "essid": "ABC-das-da-asd-",
    "pairwise_ciphers": "",
    "group_cipher": "",
    "auth_suites": "",
    "htcap": 1,
    "mtik_name": ""
  }, {
    "mac": "68:72:51:06:14:42",
    "mode": "Master",
    "frequency": "2.422",
    "channel": "3",
    "quality": "14/94",
    "signal_level": "-56",
    "noise_level": "-96",
    "encryption": "none",
    "essid": "WER-das-da-asd-",
    "pairwise_ciphers": "",
    "group_cipher": "",
    "auth_suites": "",
    "htcap": 1,
    "mtik_name": ""
  }, {
    "mac": "6A:72:51:04:F3:5A",
    "mode": "Master",
    "frequency": "2.427",
    "channel": "4",
    "quality": "47/94",
    "signal_level": "-49",
    "noise_level": "-100",
    "encryption": "none",
    "essid": "NOInet_047-das-da-asd-",
    "pairwise_ciphers": "",
    "group_cipher": "",
    "auth_suites": "",
    "htcap": 1,
    "mtik_name": ""
  }, {
    "mac": "6A:72:51:06:1B:D1",
    "mode": "Master",
    "frequency": "2.427",
    "channel": "4",
    "quality": "16/94",
    "signal_level": "-55",
    "noise_level": "-100",
    "encryption": "none",
    "essid": "NOInet_026-das-da-asd-",
    "pairwise_ciphers": "",
    "group_cipher": "",
    "auth_suites": "",
    "htcap": 1,
    "mtik_name": ""
  }];

})();