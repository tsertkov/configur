/** @module dotpath-compile */

var Configur = require('./Configur.js');

/**
 * Load configuration catalog from given directory
 * @see Configur.init
 * @param {String|Array} dir
 * @returns {Configur}
 */
module.exports = function(dir){
  return Object.create(Configur)
    .init()
    .loadConfigDir(dir);
};
