/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(api, async, url, jwt) {
	return function initUser(ws, done) {
		var location = url.parse(ws.upgradeReq.url, true);
		var secret = api.options.jwt.secret;
		var options = api.options.jwt.verify;
		var token = location.query.token
			? location.query.token
			: jwt.sign(api.options.users.anon, secret);

		var extractPayload = jwt.verify.bind(jwt, token, secret, options);
		var extractUserFromPayload = api.options.jwt.verifyCallback;

		async.waterfall([
			extractPayload,
			extractUserFromPayload
		], function callback(err, user) {
			if (err) {
				api.logger.error(err);
				ws.user = api.options.users.anon;
			} else {
				ws.user = user;
			}

			return done();
		});
	};
};
