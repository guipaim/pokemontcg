import { userAccounts } from '../mongoConfig/mongoCollections.js';
import userRoutes from './users.js';
import UserAccount from '../data/createUser.js';

const userAccount = new UserAccount(); 

const constructorMethod = (app) => {
    app.use('/', userRoutes);
    
    app.use('*', (req, res) => {
        return res.status(404).render('error', {error: '404: Page Not Found'});
      });
};

export default constructorMethod;