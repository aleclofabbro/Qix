define('qix', function() {
  'use strict';
  var _qix_attr_placeholder = 'qix-element';
  var is_qix_attr = is_attr_namespaced.bind(null, 'qix');

  function is_array_like(obj) {
    return ('length' in obj) && ('number' === typeof obj.length);
  }

  function as_array(obj) {
    return is_array_like(obj) ? Array.prototype.slice.call(obj) : [obj];
  }

  function master_elem_array_from_text(text) {
    var div = document.createElement('div');
    div.innerHTML = text;
    return as_array(div.children);
  };

  function get_master_elem_array(master_elem_array_or_text) {
    if ('string' === typeof master_elem_array_or_text) {
      return master_elem_array_from_text(master_elem_array_or_text);
    } else return as_array(master_elem_array_or_text);

  }

  function is_attr_namespaced(prefix, attr) {
    return split_attr_ns_name(attr)[0] === prefix;
  }

  function split_attr_ns_name(attr) {
    return attr.name.split(':');
  }

  function get_ctrl_attributes(ctrl_name, elem) {
    return as_array(elem.attributes)
      .reduce(function(ctrl_attrs, attr) {
        if (is_attr_namespaced(ctrl_name, attr)) {
          ctrl_attrs[split_attr_ns_name(attr)[1]] = attr.value;
        }
        return ctrl_attrs;
      }, {});
  }

  function make_ctrl_def(master_elem, attr) {
    var name = split_attr_ns_name(attr)[1];
    var val_split = attr.value.split('#');
    return {
      name: name,
      module_path: val_split[0],
      module_prop: val_split[1]
        // master_elem: master_elem
    };
  }

  function make_ctrl_defs(master_elem) {
    return as_array(master_elem.attributes)
      .filter(is_qix_attr)
      .map(make_ctrl_def.bind(null, master_elem));
  }

  function merge_objs(target, obj) {
    for (var k in obj)
      target[k] = obj[k];
    return target;
  }

  function mark_qix_elem(master_elem, _ctrl_defs) {
    var _elems_ctrl_names = _ctrl_defs.map(prop_get.bind(null, 'name'));
    master_elem.setAttribute(_qix_attr_placeholder, _elems_ctrl_names.join(','));
  }

  function get_all_ctrl_defs(master_elem_array) {
    return master_elem_array
      .reduce(function(all_defs, master_elem) {
        var _ctrl_defs = make_ctrl_defs(master_elem);
        if (_ctrl_defs.length) {
          mark_qix_elem(master_elem, _ctrl_defs);
          _ctrl_defs.forEach(function(_ctrl_def) {
            all_defs[_ctrl_def.name] = _ctrl_def;
          });
        }
        return merge_objs(get_all_ctrl_defs(as_array(master_elem.children)), all_defs);
      }, {});
  }

  function prop_get(prop, obj) {
    return obj ? obj[prop] : void(0);
  }

  function get_prop(obj, prop) {
    return prop_get(prop, obj);
  }


  function make_qix(callback, errback, master_elem_array_or_text) {
    var master_elem_array = get_master_elem_array(master_elem_array_or_text);
    var all_ctrl_defs = get_all_ctrl_defs(master_elem_array);
    var all_module_arr = Object.keys(get_all_ctrl_defs(master_elem_array))
      .map(get_prop.bind(null, all_ctrl_defs))
      .map(prop_get.bind(null, 'module_path'));

    require(all_module_arr,
      function( /* all_modules */ ) {
        var qix_obj = Object.create(qix_proto);
        qix_obj._all_ctrl_defs = all_ctrl_defs;
        qix_obj._master_elem_array = master_elem_array;
        callback(qix_obj);
      }, errback);
  }

  function make_clone(master_elem) {
    return master_elem.cloneNode(true);
  };

  // function normalize_name(name) {
  //   return name.replace('-', '_');
  // }

  function populate_controllers(_the_qix, binders, ctrls, elem_clone) {

    var _qix_elems = as_array(elem_clone.querySelectorAll('[' + _qix_attr_placeholder + ']'));
    if (elem_clone.hasAttribute(_qix_attr_placeholder))
      _qix_elems.unshift(elem_clone);
    _qix_elems
      .forEach(function(qix_elem) {
        var qix_attr_value = qix_elem.getAttribute(_qix_attr_placeholder);
        var elem_ctrl_names = qix_attr_value.split(',');
        elem_ctrl_names
          .forEach(function(name) {
            var ctrl_def = _the_qix._all_ctrl_defs[name];
            var _module = require(ctrl_def.module_path);
            var factory = ctrl_def.module_prop ? _module[ctrl_def.module_prop] : _module;
            if (!factory)
              throw new Error('No Factory for ctrl_def', ctrl_def);
            var _ctrl_link = Object.create(ctrl_def);
            _ctrl_link.attrs = get_ctrl_attributes.bind(null, name, qix_elem);
            ctrls[normalize_name(name)] = factory(qix_elem, binders[name], _ctrl_link);
            ctrls['$' + name] = _ctrl_link;
            //qix_elem.addEventListener();
          });
      });
    return ctrls;
  }

  var qix_proto = {
    spawn: function(binders) {
      var _the_qix = this;
      var _root_elems = _the_qix._master_elem_array
        .map(make_clone);
      return _root_elems
        .reduce(populate_controllers.bind(null, _the_qix, binders), {
          $root_elems: _root_elems
        });
    },
    spawn_into: function(binders, into_elem) {
      var ctrls = this.spawn(binders);
      ctrls
        .$root_elems
        .forEach(into_elem.appendChild.bind(into_elem));
      return ctrls;
    }
  };

  var noop = function() {};

  return {
    load: function(name, localrequire, done) {
      localrequire(['text!' + name], make_qix.bind(null, done, noop));
    }
  };
});

/**
 * @license RequireJS text 2.0.14 Copyright (c) 2010-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/text for details
 */
/*jslint regexp: true */
/*global require, XMLHttpRequest, ActiveXObject,
  define, window, process, Packages,
  java, location, Components, FileUtils */

define('text', ['module'], function(module) {
  'use strict';

  var text, fs, Cc, Ci, xpcIsWindows,
    progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
    xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,
    bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,
    hasLocation = typeof location !== 'undefined' && location.href,
    defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ''),
    defaultHostName = hasLocation && location.hostname,
    defaultPort = hasLocation && (location.port || undefined),
    buildMap = {},
    masterConfig = (module.config && module.config()) || {};

  text = {
    version: '2.0.14',

    strip: function(content) {
      //Strips <?xml ...?> declarations so that external SVG and XML
      //documents can be added to a document without worry. Also, if the string
      //is an HTML document, only the part inside the body tag is returned.
      if (content) {
        content = content.replace(xmlRegExp, "");
        var matches = content.match(bodyRegExp);
        if (matches) {
          content = matches[1];
        }
      } else {
        content = "";
      }
      return content;
    },

    jsEscape: function(content) {
      return content.replace(/(['\\])/g, '\\$1')
        .replace(/[\f]/g, "\\f")
        .replace(/[\b]/g, "\\b")
        .replace(/[\n]/g, "\\n")
        .replace(/[\t]/g, "\\t")
        .replace(/[\r]/g, "\\r")
        .replace(/[\u2028]/g, "\\u2028")
        .replace(/[\u2029]/g, "\\u2029");
    },

    createXhr: masterConfig.createXhr || function() {
      //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
      var xhr, i, progId;
      if (typeof XMLHttpRequest !== "undefined") {
        return new XMLHttpRequest();
      } else if (typeof ActiveXObject !== "undefined") {
        for (i = 0; i < 3; i += 1) {
          progId = progIds[i];
          try {
            xhr = new ActiveXObject(progId);
          } catch (e) {}

          if (xhr) {
            progIds = [progId]; // so faster next time
            break;
          }
        }
      }

      return xhr;
    },

    /**
     * Parses a resource name into its component parts. Resource names
     * look like: module/name.ext!strip, where the !strip part is
     * optional.
     * @param {String} name the resource name
     * @returns {Object} with properties "moduleName", "ext" and "strip"
     * where strip is a boolean.
     */
    parseName: function(name) {
      var modName, ext, temp,
        strip = false,
        index = name.lastIndexOf("."),
        isRelative = name.indexOf('./') === 0 ||
        name.indexOf('../') === 0;

      if (index !== -1 && (!isRelative || index > 1)) {
        modName = name.substring(0, index);
        ext = name.substring(index + 1);
      } else {
        modName = name;
      }

      temp = ext || modName;
      index = temp.indexOf("!");
      if (index !== -1) {
        //Pull off the strip arg.
        strip = temp.substring(index + 1) === "strip";
        temp = temp.substring(0, index);
        if (ext) {
          ext = temp;
        } else {
          modName = temp;
        }
      }

      return {
        moduleName: modName,
        ext: ext,
        strip: strip
      };
    },

    xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,

    /**
     * Is an URL on another domain. Only works for browser use, returns
     * false in non-browser environments. Only used to know if an
     * optimized .js version of a text resource should be loaded
     * instead.
     * @param {String} url
     * @returns Boolean
     */
    useXhr: function(url, protocol, hostname, port) {
      var uProtocol, uHostName, uPort,
        match = text.xdRegExp.exec(url);
      if (!match) {
        return true;
      }
      uProtocol = match[2];
      uHostName = match[3];

      uHostName = uHostName.split(':');
      uPort = uHostName[1];
      uHostName = uHostName[0];

      return (!uProtocol || uProtocol === protocol) &&
        (!uHostName || uHostName.toLowerCase() === hostname.toLowerCase()) &&
        ((!uPort && !uHostName) || uPort === port);
    },

    finishLoad: function(name, strip, content, onLoad) {
      content = strip ? text.strip(content) : content;
      if (masterConfig.isBuild) {
        buildMap[name] = content;
      }
      onLoad(content);
    },

    load: function(name, req, onLoad, config) {
      //Name has format: some.module.filext!strip
      //The strip part is optional.
      //if strip is present, then that means only get the string contents
      //inside a body tag in an HTML string. For XML/SVG content it means
      //removing the <?xml ...?> declarations so the content can be inserted
      //into the current doc without problems.

      // Do not bother with the work if a build and text will
      // not be inlined.
      if (config && config.isBuild && !config.inlineText) {
        onLoad();
        return;
      }

      masterConfig.isBuild = config && config.isBuild;

      var parsed = text.parseName(name),
        nonStripName = parsed.moduleName +
        (parsed.ext ? '.' + parsed.ext : ''),
        url = req.toUrl(nonStripName),
        useXhr = (masterConfig.useXhr) ||
        text.useXhr;

      // Do not load if it is an empty: url
      if (url.indexOf('empty:') === 0) {
        onLoad();
        return;
      }

      //Load the text. Use XHR if possible and in a browser.
      if (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort)) {
        text.get(url, function(content) {
          text.finishLoad(name, parsed.strip, content, onLoad);
        }, function(err) {
          if (onLoad.error) {
            onLoad.error(err);
          }
        });
      } else {
        //Need to fetch the resource across domains. Assume
        //the resource has been optimized into a JS module. Fetch
        //by the module name + extension, but do not include the
        //!strip part to avoid file system issues.
        req([nonStripName], function(content) {
          text.finishLoad(parsed.moduleName + '.' + parsed.ext,
            parsed.strip, content, onLoad);
        });
      }
    },

    write: function(pluginName, moduleName, write, config) {
      if (buildMap.hasOwnProperty(moduleName)) {
        var content = text.jsEscape(buildMap[moduleName]);
        write.asModule(pluginName + "!" + moduleName,
          "define(function () { return '" +
          content +
          "';});\n");
      }
    },

    writeFile: function(pluginName, moduleName, req, write, config) {
      var parsed = text.parseName(moduleName),
        extPart = parsed.ext ? '.' + parsed.ext : '',
        nonStripName = parsed.moduleName + extPart,
        //Use a '.js' file name so that it indicates it is a
        //script that can be loaded across domains.
        fileName = req.toUrl(parsed.moduleName + extPart) + '.js';

      //Leverage own load() method to load plugin value, but only
      //write out values that do not have the strip argument,
      //to avoid any potential issues with ! in file names.
      text.load(nonStripName, req, function(value) {
        //Use own write() method to construct full module value.
        //But need to create shell that translates writeFile's
        //write() to the right interface.
        var textWrite = function(contents) {
          return write(fileName, contents);
        };
        textWrite.asModule = function(moduleName, contents) {
          return write.asModule(moduleName, fileName, contents);
        };

        text.write(pluginName, nonStripName, textWrite, config);
      }, config);
    }
  };

  if (masterConfig.env === 'node' || (!masterConfig.env &&
      typeof process !== "undefined" &&
      process.versions &&
      !!process.versions.node &&
      !process.versions['node-webkit'] &&
      !process.versions['atom-shell'])) {
    //Using special require.nodeRequire, something added by r.js.
    fs = require.nodeRequire('fs');

    text.get = function(url, callback, errback) {
      try {
        var file = fs.readFileSync(url, 'utf8');
        //Remove BOM (Byte Mark Order) from utf8 files if it is there.
        if (file[0] === '\uFEFF') {
          file = file.substring(1);
        }
        callback(file);
      } catch (e) {
        if (errback) {
          errback(e);
        }
      }
    };
  } else if (masterConfig.env === 'xhr' || (!masterConfig.env &&
      text.createXhr())) {
    text.get = function(url, callback, errback, headers) {
      var xhr = text.createXhr(),
        header;
      xhr.open('GET', url, true);

      //Allow plugins direct access to xhr headers
      if (headers) {
        for (header in headers) {
          if (headers.hasOwnProperty(header)) {
            xhr.setRequestHeader(header.toLowerCase(), headers[header]);
          }
        }
      }

      //Allow overrides specified in config
      if (masterConfig.onXhr) {
        masterConfig.onXhr(xhr, url);
      }

      xhr.onreadystatechange = function(evt) {
        var status, err;
        //Do not explicitly handle errors, those should be
        //visible via console output in the browser.
        if (xhr.readyState === 4) {
          status = xhr.status || 0;
          if (status > 399 && status < 600) {
            //An http 4xx or 5xx error. Signal an error.
            err = new Error(url + ' HTTP status: ' + status);
            err.xhr = xhr;
            if (errback) {
              errback(err);
            }
          } else {
            callback(xhr.responseText);
          }

          if (masterConfig.onXhrComplete) {
            masterConfig.onXhrComplete(xhr, url);
          }
        }
      };
      xhr.send(null);
    };
  } else if (masterConfig.env === 'rhino' || (!masterConfig.env &&
      typeof Packages !== 'undefined' && typeof java !== 'undefined')) {
    //Why Java, why is this so awkward?
    text.get = function(url, callback) {
      var stringBuffer, line,
        encoding = "utf-8",
        file = new java.io.File(url),
        lineSeparator = java.lang.System.getProperty("line.separator"),
        input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
        content = '';
      try {
        stringBuffer = new java.lang.StringBuffer();
        line = input.readLine();

        // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
        // http://www.unicode.org/faq/utf_bom.html

        // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
        // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
        if (line && line.length() && line.charAt(0) === 0xfeff) {
          // Eat the BOM, since we've already found the encoding on this file,
          // and we plan to concatenating this buffer with others; the BOM should
          // only appear at the top of a file.
          line = line.substring(1);
        }

        if (line !== null) {
          stringBuffer.append(line);
        }

        while ((line = input.readLine()) !== null) {
          stringBuffer.append(lineSeparator);
          stringBuffer.append(line);
        }
        //Make sure we return a JavaScript string and not a Java string.
        content = String(stringBuffer.toString()); //String
      } finally {
        input.close();
      }
      callback(content);
    };
  } else if (masterConfig.env === 'xpconnect' || (!masterConfig.env &&
      typeof Components !== 'undefined' && Components.classes &&
      Components.interfaces)) {
    //Avert your gaze!
    Cc = Components.classes;
    Ci = Components.interfaces;
    Components.utils['import']('resource://gre/modules/FileUtils.jsm');
    xpcIsWindows = ('@mozilla.org/windows-registry-key;1' in Cc);

    text.get = function(url, callback) {
      var inStream, convertStream, fileObj,
        readData = {};

      if (xpcIsWindows) {
        url = url.replace(/\//g, '\\');
      }

      fileObj = new FileUtils.File(url);

      //XPCOM, you so crazy
      try {
        inStream = Cc['@mozilla.org/network/file-input-stream;1']
          .createInstance(Ci.nsIFileInputStream);
        inStream.init(fileObj, 1, 0, false);

        convertStream = Cc['@mozilla.org/intl/converter-input-stream;1']
          .createInstance(Ci.nsIConverterInputStream);
        convertStream.init(inStream, "utf-8", inStream.available(),
          Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);

        convertStream.readString(inStream.available(), readData);
        convertStream.close();
        inStream.close();
        callback(readData.value);
      } catch (e) {
        throw new Error((fileObj && fileObj.path || '') + ': ' + e);
      }
    };
  }
  return text;
});