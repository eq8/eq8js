'use strict';

module.exports = function exported(url, jwt) {
	return function verifyToken(ws, done) {
		var api = this;
		var location = url.parse(ws.upgradeReq.url, true);
		var secret = api.options.jwt.secret;
		var options = api.options.jwt.verify;
		var token = location.query.token
			? location.query.token
			: jwt.sign(api.options.users.anon, secret);

		return jwt.verify(token, secret, options, function callback(err, user) {
			done(err, api, ws, user);
		});
	};
};
