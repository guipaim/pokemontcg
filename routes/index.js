import userRoutes from './users.js';

const constructorMethod = (app) => {
    app.use('/', userRoutes);
    
    app.use('*', (req, res) => {
      let loggedIn;
      if (!req.session.user) {
        loggedIn = false;
      }
      else {
        loggedIn = true;
      }
        return res.status(404).render('error', {
          error: '404: Page Not Found',
          loggedIn: loggedIn
        });
      });
};

export default constructorMethod;