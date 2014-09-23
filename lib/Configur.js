var
  path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  resolve = require('dotpath-resolve'),
  compile = require('dotpath-compile'),
  Configur;

/**
 * Configuration object prototype
 * @class Configur
 */
Configur = {
  /**
   * @type {Object}
   */
  raw: null,
  /**
   * @param {Object} [config]
   */
  init: function(config){
    this.raw = config || {};
    return this;
  },
  /**
   * @returns {String} NODE_ENV or 'development' by default
   */
  getEnvironment: function(){
    return process.env.NODE_ENV || 'development';
  },
  /**
   * Load configuration files from given directory
   * @param {String|Array} dir directory path or arguments for path.join() when array
   * @param {String} [selector] section to host loaded configuration
   * @return {Configur}
   */
  loadDir: function(dir, selector){
    if (Array.isArray(dir)) {
      dir = path.join.apply(path, dir);
    }

    selector = selector || '';

    var
      allFiles = this.listConfigFiles(dir),
      jsonFiles = allFiles.filter(function(fileMeta){ return fileMeta.type === 'json'; }),
      jsFiles = allFiles.filter(function(fileMeta){ return fileMeta.type === 'js'; });

    function loadFileByMeta(fileMeta){
      var targetSelector = selector;
      if (fileMeta.section) {
        if (targetSelector) {
          targetSelector = [targetSelector, fileMeta.section].join('.');
        } else {
          targetSelector = fileMeta.section;
        }
      }

      this.loadConfigFile(fileMeta.path, targetSelector);
    }

    jsonFiles.forEach(loadFileByMeta, this);
    this.compileRaw();

    jsFiles.forEach(loadFileByMeta, this);
    this.compileRaw();

    return this;
  },
  /**
   * Compile raw config
   * @returns {Configur}
   */
  compileRaw: function(){
    this.raw = compile(this.raw);
    return this;
  },
  /**
   * @param {String} filePath
   * @param {Object} target
   * @returns {Object} target object
   */
  loadFileJson: function(filePath, target){
    _.merge(target, require(filePath));
  },
  /**
   * @param {String} filePath
   * @param {Object} target
   * @returns {Object} target object
   */
  loadFileJs: function(filePath, target){
    require(filePath)(target);
  },
  /**
   * Load configuration file
   * @param {String} filePath
   * @param {String} [targetSelector]
   * @returns {Object}
   */
  loadConfigFile: function(filePath, targetSelector){
    var
      type = path.extname(filePath).slice(1).toLowerCase(),
      typeName = type.charAt(0).toUpperCase() + type.slice(1),
      loadFn = this['loadFile' + typeName],
      target = this.getBySelector(targetSelector);

    loadFn.call(this, filePath, target);
    return this;
  },
  /**
   * List configuration files in given directory
   * @param {String} dir
   * @returns {Array} configuration files in loading order
   */
  listConfigFiles: function(dir){
    var
      prefix = 'config',
      meta = {},
      rx = new RegExp([
        '^',
        prefix,               // base name
        '((?:-[^\\-.]+)+)?',  // optional section(s)
        '(?:\\.' + this.getEnvironment() + ')?', // optional current environment
        '(?:\\.local)?',      // optional local overrides file
        '\\.(json|js)',       // config file extension
        '$'
      ].join(''));

    return fs.readdirSync(dir)
      .filter(function(file){
        var match = file.match(rx);
        if (!match) {
          return false;
        }

        // collect file metadata to be returned later
        meta[file] = {
          path: path.join(dir, file),
          section: match[1] ? match[1].replace(/-/g, '.').substr(1) : undefined,
          type: match[2]
        };

        return true;
      })
      // loading order is the same as alphabetical sorting
      .sort().reverse()
      // return array of file meta objects
      .map(function(file){
        return meta[file];
      });
  },
  /**
   * Get configuration by dotpath selector
   * @param {String} selector
   * @param {String} [startSelector]
   * @returns {*}
   */
  getBySelector: function(selector, startSelector){
    return resolve(this.raw, selector, startSelector);
  }
};

module.exports = Configur;
