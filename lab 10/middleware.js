/*
You can choose to define all your middleware functions here, 
export them and then import them into your app.js and attach them that that.
add.use(myMiddleWare()). you can also just define them in the app.js 
if you like as seen in lecture 10's lecture code example. If you choose to write them in the app.js, 
you do not have to use this file. 
*/

const exportedMethods = {
    logging(req, res, next) {
        console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} /${
            req.session.user ? "Authenticated User" : "Non-Authenticated User"
          }`);
        next();
    },
    registerRedirect(req, res, next) {
        if (req.session.user) {
            if (req.session.user.role === 'admin') {
                return res.redirect('/admin');
            } 
            else if (req.session.user.role === 'user') {
                return res.redirect('/protected');
            }    
        }
        return res.redirect('/register');
    },
    loginRedirect(req, res, next) {   
        if (req.session.user) {
            if (req.session.user.role === 'admin') {
                return res.redirect('/admin');
            } 
            else if (req.session.user.role === 'user') {
                return res.redirect('/protected');
            }    
        }
        return res.redirect('/login');
    },
    protectedRedirect(req, res, next) {
        if(req.session.user) {
            return next();
        }
        res.redirect('/login');
    },
    adminRedirect(req, res, next) {
        if (!req.session.user) {
            res.redirect('/login');
        }
        if(req.session.user.role === 'admin') {
            return next();
        }
        else {
            res.status(403).render('error', {code: '403', message: 'insufficient permissions'})
        }
    },
    logoutRedirect(req, res, next) {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        next();
    }
}

export default exportedMethods