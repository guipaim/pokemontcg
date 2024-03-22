import userRoutes from './users.js';

const constructorMethod = (app) => {
    app.use('/users', userRoutes);

    app.get('/', (req, res) => {
        res.send('Welcome to the homepage!');
    });
    
    app.use('*', (req, res) => {
        return res.status(404).json({error: 'Not found'});
      });
};

export default constructorMethod;