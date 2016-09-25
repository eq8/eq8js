/*
 * eq8js
 * Copyright(c) 2016 Benjamin Bartolome
 * Apache 2.0  Licensed
 */

'use strict';

module.exports = function exported(api, passport, AnonymousStrategy, JwtStrategy) {
	var apiOptions = api.options.jwt;
	var passportJwtOptions = {
		secretOrKey: apiOptions.secret,
		jwtFromRequest: apiOptions.jwtFromRequest,
		algorithms: apiOptions.verify.algorithms,
		issuer: apiOptions.verify.issuer,
		audience: apiOptions.verify.audience,
		ignoreExpiration: apiOptions.verify.ignoreExpiration
	};

	passport.use(new JwtStrategy(passportJwtOptions, verifyCallback));
	passport.use(new AnonymousStrategy());
	return passport.initialize();
};

function verifyCallback(jwtPayload, done) {
	return done(null, jwtPayload);
}
