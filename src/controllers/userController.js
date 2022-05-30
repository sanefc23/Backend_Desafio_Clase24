const User = require('../db/User');

const userController = {
    login: (req, res) => {
        User.findOne({
                userName: req.body.userName
            })
            .then(user => {
                if (user) {
                    if (user.password == req.body.password) {
                        req.session.userName = user.userName;
                        req.session.admin = user.admin;
                        res.cookie.user = user.userName;
                        console.log(req.session);
                        res.redirect('/');
                    } else {
                        res.render('index', {
                            error: 'Password incorrecto'
                        })
                    }
                } else {
                    res.render('index', {
                        error: 'Usuario no encontrado'
                    })
                }
            })
            .catch(e => {
                console.log(e);
            });
    },
    logout: (req, res) => {
        res.clearCookie('userCookie')
        req.session.destroy()
        res.redirect('/');
    }
}

module.exports = userController