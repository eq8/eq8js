'use strict';

module.exports = function exported() {
	return function addRequestHandler(req, res) {
		var api = this;
		api.express(req, res);
	};
};
