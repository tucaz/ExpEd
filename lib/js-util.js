//This prototype is provided by the Mozilla foundation and
//is distributed under the MIT license.
//http://www.ibiblio.org/pub/Linux/LICENSES/mit.license

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt /*, from*/) {
    var len = this.length,
		from = Number(arguments[1]) || 0;
    
	from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    
	if (from < 0) {
		from += len;
	}

    for (; from < len; from++) {
		if (from in this &&
			this[from] === elt)
		return from;
    }
    return -1;
  };
}