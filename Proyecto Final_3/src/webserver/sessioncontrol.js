import passport from 'passport';
import passportLocal from 'passport-local';
import MongoStore from 'connect-mongo';
import { mongo_server , db_name, multer_pics} from '../config/config.js'
import session from 'express-session'
import { loggerFE as logger } from '../utils/logger.js';
import { createHash } from '../utils/hash.js';

class SessionControl{
    constructor(app, business, persistence){
        // ---------------------------------------------------------------------------------------------------------
        // Middleware para manejo de sesiones
        // ---------------------------------------------------------------------------------------------------------
        const url = mongo_server.url + '/' + db_name;
        app.use(session({
            store: MongoStore.create({mongoUrl: url}),
            secret: "secreto",
            resave: true,
            saveUninitialized: true,
            cookie:{maxAge:300000}
        }));

        // ---------------------------------------------------------------------------------------------------------
        // Configuracion Passport Login
        // ---------------------------------------------------------------------------------------------------------
        const LocalStrategy = passportLocal.Strategy;
        passport.use('login', new LocalStrategy(async (username, password, done) => {
            const {err, user} = await business.userLogin(username, password);
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
            const originalPath = multer_pics + '/' + username + '_pic_profile.png'
            const photoFilename = user.photo
            const finalPath = multer_pics + '/' + photoFilename
            persistence.rename(originalPath, finalPath)

            // Send response
            return (done(err, user));

        }));

        passport.serializeUser((user, done) => {
            done(null, user.username);
        });
          
        passport.deserializeUser(async (username, done) => {
            const user = await business.userDeserialize(username)
            done(null, user);
        });

        app.use(passport.initialize());
        app.use(passport.session());
    }

    getPassport(){
        return passport;
    }
}

export default SessionControl;