//Here you will import route files and export the constructor method as shown in lecture code and worked in previous labs.
import authRoutes from './auth_routes.js';


const constructorMethod = (app) => {
  app.use('/', authRoutes);

  app.use('*', (req, res) => {
    return res.status(404).json({error: 'Not found'});
  });
};

export default constructorMethod;