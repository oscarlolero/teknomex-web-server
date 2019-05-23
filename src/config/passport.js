const axios = require('axios');
const LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    passport.serializeUser(function (user, done) {
        //console.log('Serializing user: ', user);
        done(null, user);
    });
    // used to deserialize user
    passport.deserializeUser(function (user, done) {
        //console.log('Deserializing user: ', user);
        done(null, user);
    });

    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, async function(req, username, inPassword, done) {
        try {
            const DBRes = await axios.get(`https://flutter-products-3e91e.firebaseio.com/users/${username}.json`);
            if (!DBRes.data) {
                return done(null, false, req.flash('loginMessage', 'El usuario no existe.'));
            } else if (Object.values(DBRes.data)[2] !== req.body.password) {
                return done(null, false, req.flash('loginMessage', 'Contraseña incorrecta.'));
            } else {
                console.log(DBRes.data);
                return done(null, DBRes.data);
                /*
                return res.status(200).send(JSON.stringify({
                    // 'userId': Object.keys(DBRes.data)[1],
                    // 'token': 'token_123123',
                    'isAdmin': Object.values(DBRes.data)[0]
                }));
                */
            }
        } catch (e) {
            return res.status(502).send(JSON.stringify({
                'message': 'DB_CONNECTION_ERROR'
            }));
        }
    }));
};