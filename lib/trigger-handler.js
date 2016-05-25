'use strict';

module.exports = function exported() {
	return function triggerHandler(e, done) {
		var api = this;

		api.seneca.act(e, done);
	}
}
