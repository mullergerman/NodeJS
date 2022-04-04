import passport from 'passport';
import passportLocal from 'passport-local';
import MongoStore from 'connect-mongo';
import expressSession from 'express-session'
import { createHash } from '../utils/hash.js';

class SessionControl{
    constructor(app, business, persistence, config){
       
        // ---------------------------------------------------------------------------------------------------------
        // Middleware para manejo de sesiones
        // ---------------------------------------------------------------------------------------------------------
        const url = config.mongo_server.url + '/' + config.db_name;
        this.session = expressSession({
            store: MongoStore.create({mongoUrl: url}),
            secret: "secreto",
            resave: true,
            saveUninitialized: true,
            cookie:{maxAge:null}
        })

        app.use(this.session);

        // ---------------------------------------------------------------------------------------------------------
        // Configuracion Passport Login
        // ---------------------------------------------------------------------------------------------------------
        const LocalStrategy = passportLocal.Strategy;
        passport.use('login', new LocalStrategy(async (username, password, done) => {
            const {err, user, access_token} = await business.userLogin(username, password);
            if (user) user.access_token = access_token;
            return (done(err, user));
        }));

        // ---------------------------------------------------------------------------------------------------------
        // Configuracion Passport Register
        // ---------------------------------------------------------------------------------------------------------
        passport.use('register', new LocalStrategy({passReqToCallback: true}, async (req, username, password, done) => {

            // Insert new user
            const userDTO = {
                username,
                password: createHash(password),
                name: `${req.body.nombre} ${req.body.apellido}`,
                address: req.body.direccion,
                age: req.body.edad,
                phone: req.body.telefono[0] + req.body.telefono[1]
            }

            const {err, user} = await business.userRegister(userDTO);

            // Rename PicProfile
            const originalPath = config.multer_pics + '/' + username + '_pic_profile.png'
            const photoFilename = user.photo
            const finalPath = config.multer_pics + '/' + photoFilename
            persistence.rename(originalPath, finalPath)

            // Send response
            return (done(err, user));

        }));

        passport.serializeUser((user, done) => {
            done(null, user.username);
        });
          
        passport.deserializeUser(async (username, done) => {
            const user = {}
            user.username = username;
            done(null, user);
        });

        app.use(passport.initialize());
        app.use(passport.session());
    }

    getPassport(){
        return passport;
    }

    getSession(){
        return this.session;
    }
}

export default SessionControl;