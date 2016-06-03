'use strict';

module.exports = function exported(url, jwt, secret, options) {
	return function verifyToken(ws, done) {
		var api = this;
		var location = url.parse(ws.upgradeReq.url, true);
		var token = location.query.token
			? location.query.token
			: jwt.sign(api.options.users.anon, api.options.jwt.secret);

		return jwt.verify(token, secret, options, function callback(err, user) {
			done(err, api, ws, location, user);
		});
	};
};
