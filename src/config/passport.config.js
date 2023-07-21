import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import {
    createHash,
    isValidPassword
} from '../utils.js';
import userModel from '../daos/mongodb/models/users.model.js';

const localStrategy = local.Strategy;

const initializePassport = () => {
    passport.use(
        'register',
        new localStrategy({
                passReqToCallback: true,
                usernameField: 'email',
            },
            async (req, username, password, done) => {
                const {
                    first_name,
                    last_name,
                    email,
                    age
                } = req.body;

                try {
                    const exist = await userModel.findOne({
                        email
                    });

                    if (exist) {
                        return done(null, false, {
                            message: 'Usuario ya registrado.',
                        });
                    }

                    const newUser = {
                        first_name,
                        last_name,
                        email,
                        age,
                        password: createHash(password),
                        role: 'User',
                    };

                    const result = await userModel.create(newUser);

                    return done(null, result);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.use(
        'login',
        new localStrategy({
                usernameField: 'email',
            },
            async (username, password, done) => {
                try {
                    const user = await userModel.findOne({
                        email: username
                    });

                    if (!user) {
                        return done(null, false, {
                            message: 'Correo incorrecto.',
                        });
                    }

                    if (!isValidPassword(user, password)) {
                        return done(null, false, {
                            message: 'Contraseña incorrecta.',
                        });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.use('github', new GitHubStrategy({
        clientID: 'Iv1.8dff530e6f620e73',
        clientSecret: 'f2cadb654d2ea6c76f5bb37cbd62f1bc1a4af805',
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await userModel.findOne({
                email: profile._json.email
            })
            if (!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "X",
                    email: "X" // profile._json.email
                        ,
                    age: 19,
                    password: "X",
                    role: "User"
                };
                const result = await userModel.create(newUser);
                return done(null, result);
            } else {
                return done(null, false);
            }

        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id);
            done(null, {
                _id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                role: user.role,
            });
        } catch (error) {
            done(error);
        }
    });

};

export default initializePassport;