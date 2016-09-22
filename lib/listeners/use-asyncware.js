/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported() {
	return function useAsyncware(ws) {
		var api = this;
		api.asyncware(ws);
	};
};
