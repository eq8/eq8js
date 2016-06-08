'use strict';

module.exports = function exported(api) {
	return function initAnonymousUser(req, res, next) {
		if (!req.user) {
			req.user = api.options.users.anon;
		}

		next();
	};
};
