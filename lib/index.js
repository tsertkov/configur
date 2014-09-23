/** @module dotpath-configur */

var Configur = require('./Configur.js');

/**
 * Load configuration catalog from given directory
 * @param {String|Array} dir
 * @returns {ConfigurInterface}
 */
module.exports = function(dir){
  var configur = Object.create(Configur)
    .init()
    .loadDir(dir);

  /**
   * @class ConfigurInterface
   */
  return {
    /**
     * Load configuration files from given directory
     * @see Configur.loadDir
     * @param {String|Array} dir directory path or arguments array for path.join()
     * @param {String} [selector]
     * @returns {ConfigurInterface}
     */
    loadDir: function(dir, selector){
      configur.loadDir.call(configur, dir, selector);
      return this;
    },
    /**
     * Get configuration by dotpath selector
     * @see Configur.getBySelector
     * @param {String} [selector]
     * @returns {*}
     */
    'get': function(selector){
      return configur.getBySelector.call(configur, selector);
    }
  };
};
