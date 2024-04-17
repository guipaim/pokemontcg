import { Router } from 'express'
const router = Router()
import {cardMongoData} from '../data/index.js';
import validation from '../data/validation.js';
import { createUser, loginUser } from '../data/pokemonMongo.js';

router
  .route('/')
  .get(async (req, res) => {
    try {

      if (req.session.user) {
        const userId = req.session.user.id;
        return res.redirect('/' + userId);
        }
        else {
          return res.redirect('/login');
      }

    } catch (e) {
      // Something went wrong with the server!
      return res.status(500).send(e);
    }
  })

  router
  .route('/register')
  .get(async (req, res) => {
    return res.render('./register', {loggedIn: req.session.user ? true : false});
  })
  .post(async (req, res) => {

    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({error: 'Not a valid JSON'});
    }
    const { userNameInput, passwordInput, confirmPasswordInput } = req.body;
    if (!userNameInput) {
      return res
        .status(400)
        .json({error: 'Please supply User Name'});
    }
    if (!passwordInput) {
      return res
        .status(400)
        .json({error: 'Please enter Password'});
    }
    if (!confirmPasswordInput) {
      return res
        .status(400)
        .json({error: 'Please confirm Password'});
    }
    
    try {
      validation.checkString(userNameInput, "User Name");
      let newUser;
      
      try { 
        newUser = await createUser(userNameInput, passwordInput);
      } catch(err) {
        req.session.error = err.message;
        return res.status(403).redirect('error');
      };

      if (newUser.insertedUser === true) {
        res.redirect('/login');
      }
      else {
        res.status(500).render('register', {
          error: 'Internal Server Error',
          loggedIn: req.session.user ? true : false
        });
      }
    } catch (error) {
      res.status(400).render('register', { 
        error: error.message,
        loggedIn: req.session.user ? true : false
       });
    }
  });

  router
  .route('/login')
  .get(async (req, res) => {
    if (req.session.user) {
      return req.session.user ? res.redirect('/protected') : res.redirect('/login',);
    }
    res.render('login');
  })
  .post(async (req, res) => {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({error: 'Not a valid JSON'});
    }

    const { userNameInput, passwordInput } = req.body;

    if ( !userNameInput || !passwordInput ) {
      return res
        .status(400)
        .json({error: 'User Name and Password are required'});
    }

    try {

      if (!validation.checkString("User Name", userNameInput)) {
        throw new Error('Invalid User Name');
      };

      if (!validation.checkPassword(passwordInput)) {
        throw new Error('Invalid password.');
      };

      let newLogin;
      
      try { 
        newLogin = await loginUser(userNameInput, passwordInput);
      } catch(err) {
        console.error('Login error:', err.message);
        req.session.error = err.message;
        return res.status(403).redirect('error');
      };
      
      if (newLogin) {
        req.session.user = {
          userName: newLogin.userName
        }
      } 

      req.session.save((error) => {
        if (error) {
          console.error('Session save error:', error);
          console.error(error);
          return res.status(500).render('login', { 
            error: 'Failed to save session.',
            loggedIn: req.session.user ? true : false
          });
        }
        return res.redirect('/protected');
      });
    } catch (error) {
      console.error('Critical error:', error);
      res.status(400).render('login', { 
        error: error.message,
        loggedIn: req.session.user ? true : false
       });
    }

  });
  

router.route('/protected').get(async (req, res) => {
  
  if (!req.session.user) {
    req.session.error = '403: You do not have permission to access this page.'
    return res.status(403).redirect('error');
  } 
  
  res.render('protected', {
    userName: req.session.user.userName, 
    currentTime: new Date().toLocaleTimeString(), 
  });
});

router.route('/error').get(async (req, res) => {
  
  const error = req.session.error; 
  req.session.error = null;

  
  return res.render('error', {
    loggedIn: req.session.user ? true : false,
    error: error
  });
});

router.route('/logout').get(async (req, res) => {
  
  if (!req.session.user) {
    req.session.error = '403: You are not logged in.  You can\'t log out if your aren\'t logged in.'
    loggedIn: req.session.user ? true : false;
    return res.status(403).redirect('error');
  } 

  req.session.destroy((err) => {
    if (err) {
      console.error('Error deleting session cookie:', err);
    }
    res.clearCookie('AuthState');
  return res.render('./logout', {
    loggedIn: false
  });
  });
});

export default router;
//These all need to be updated to our needs
router
  .route('/:id')
  .get(async (req, res) => {
    if (!req.session.user) {
      return res.status(404).render('error', {
        error: '404: Page Not Found',
        loggedIn: req.session.user ? true : false
      });
  } 
    try {
      req.params.id = validation.checkId(req.params.id);
    } catch (e) {
      return res.status(404).render('error', {
        error: '404: Page Not Found', 
        loggedIn: req.session.user ? true : false
      });
    }
    try {
      const user = await cardMongoData.getUserById(req.params.id);
      return res.json(user);
    } catch (e) {;
      return res.status(404).render('error', {
        error: '404: Page Not Found',
        loggedIn: req.session.user ? true : false
      });
    }
  })
  
  .post(async (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
  }
    return res.send(
      
      `POST request to http://localhost:3000/users/${req.params.id}`
    );
  })
  .delete(async (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
  }
    return res.send(
      `DELETE request to http://localhost:3000/users/${req.params.id}`
    );
  });


  /*
  .post(async (req, res) => {
    // Not implemented
    return res.send('POST request to http://localhost:3000/users');
  })
  .delete(async (req, res) => {
    // Not implemented
    return res.send('DELETE request to http://localhost:3000/users');
  })
  .put(async (req, res) => {
    return res.send('PUT request to http://localhost:3000/users');
  });
*/

