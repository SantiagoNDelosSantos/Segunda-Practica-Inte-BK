import {
    Router
} from 'express';
import userModel from '../daos/mongodb/models/users.model.js';
import passport from 'passport';
import {
    createHash,
    isValidPassword
} from '../utils.js';

const router = Router();

// Registro:
router.post('/register', async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            age,
            password
        } = req.body;
        const exist = await userModel.findOne({
            email
        });

        if (exist) {
            return res.status(400).send({
                status: 'error',
                error: 'El usuario ya existe. Presione "Ingresa aquí" para iniciar sesión.',
            });
        }

        let result = await userModel.create({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            role: 'User',
        });

        res.send({
            status: 'success',
            message: 'Usuario registrado.',
        });
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});



// Login:
router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).send({
                status: 'error',
                error: info.message
            });
        }
        req.logIn(user, err => {
            if (err) {
                return next(err);
            }
            req.session.user = {
                first_name: user.first_name,
                last_name: user.last_name,
                age: user.age,
                email: user.email,
                role: "User"
            };
            return res.send({
                status: 'success',
                payload: req.session.user
            });
        });
    })(req, res, next);
});


// Autenticación con GitHub:
router.get('/github', passport.authenticate('github', {
        scope: 'user: email'
    }),
    (req, res) => {}
)

router.get('/githubcallback', passport.authenticate('github', {
    failureRedirect: '/login'
}), async (req, res) => {
    console.log('Exito');
    req.session.user = req.user;
    res.redirect('/realtimeproducts');
})


// Cerrar sesión:
router.get('/logout', (req, res) => {
    req.logout(); // Eliminar la sesión de Passport
    req.session.destroy(); // Destruir sesión
    res.send('Sesión cerrada');
});

export default router;