/*
 * This module doesn't export anything at the moment.
 * What it does is decorate objects with a function under the key
 * util.inspect.custom, that the util.inspect function will call when
 * rendering the object for display.
 *
 * To use this module, simply decorate the required class by adding
 * a util.inspect.custom function on the prototype, and make sure it gets
 * imported somewhere.
 */
import util from 'util';
import colors from 'colors';

// render dates in epoch seconds with expired dates showing red
Date.prototype[util.inspect.custom] = function(depth, options) {
    let now = new Date();
    let secs = this.getTime()/1000;
    if (this.getTime() < now.getTime()) {
        return secs.toString().red;
    } else {
        return secs.toString().yellow;
    }
}
