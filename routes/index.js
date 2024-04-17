import userRoutes from './users.js';

const constructorMethod = (app) => {
    app.use('/', userRoutes);
    
    app.use('*', (req, res) => {
        return res.status(404).render('error', {error: '404: Page Not Found'});
      });
};

export default constructorMethod;