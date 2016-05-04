/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(_) {
	function appendPrior(api, listener, prior) {
		return function newDefaultListener() {
			var args = Array.prototype.slice.call(arguments);
			var newArgs = _.concat(args, prior);
			listener.apply(api, newArgs);
		};
	}

	return function setDefaultListener(e, listener, done) {
		var api = this;
		var prior = api.listeners[e];
		var newDefaultListener = appendPrior(api, listener, prior);

		if (_.isFunction(api.listeners[e])) {
			api.removeListener(e, api.listeners[e]);
		}

		api.listeners[e] = newDefaultListener;
		api.on(e, newDefaultListener);

		if (_.isFunction(done)) {
			done();
		}
	};
};
