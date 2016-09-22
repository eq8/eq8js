/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported() {
	return function useMiddleware(req, res) {
		var api = this;
		api.middleware(req, res);
	};
};
