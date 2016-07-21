'use strict';

module.exports = function exported() {
	return function addRequestContext(req, res) {
		var api = this;
		api.middleware(req, res);
	};
};
