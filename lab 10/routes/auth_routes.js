//import express, express router as shown in lecture code
import {Router} from 'express';
const router = Router();
import {users} from '../config/mongoCollections.js'
import {registerUser, loginUser} from '../data/users.js'
import middleware from "../middleware.js"

router.route('/').get(async (req, res) => {
  //code here for GET THIS ROUTE SHOULD NEVER FIRE BECAUSE OF MIDDLEWARE #1 IN SPECS.
  return res.json({error: 'YOU SHOULD NOT BE HERE!'});
});

router
  .route('/register')
  .get(async (req, res) => {
    //code here for GET
    if (req.session.user) {
      res.redirect(req.session.user.role === 'user' ? '/protected' : '/admin');
    }
    res.render('register');

  })
  .post(async (req, res) => {
    try {
      const { firstName, lastName, emailAddress, password, confirmPassword, role } = req.body;
      if (!firstName || !lastName || !emailAddress || !password || !confirmPassword || !role) {
        return res.status(400).render('register', { error: 'All fields are required.' });
      }
      const registerResult = await registerUser(firstName, lastName, emailAddress, password, role);
      if (registerResult.insertedUser) {
        return res.redirect('/login');
    } else {
        return res.status(500).send('Internal Server Error');
    }
    }
    catch (e) {
      //console.log('In the catch of register post')
      //console.log(e);
      return res.status(400).render('register', {errorMessage: e});
    }
  });

router
  .route('/login').get(async (req, res) => {
    //code here for GET
    if(req.session.user) {
      res.redirect(req.session.user.role === 'admin' ? '/admin' : '/protected');
    }
    res.render('login');
  })
  .post(async (req, res) => {
    //code here for POST
    try {
      //console.log(req.body);
      const emailAddressInput = req.body.emailAddress; 
      const passwordInput = req.body.password;
      //console.log(emailAddressInput);
      const user = await loginUser(emailAddressInput, passwordInput);
      req.session.user = {
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        role: user.role
      }
        return res.redirect(req.session.user.role === 'admin' ? '/admin' : '/protected');
    }
    catch (e) {
      return res.status(400).render('login', {errorMessage: e});
    }
  });

router.route('/protected').get(middleware.protectedRedirect, async (req, res) => {
  //code here for GET
  res.render('protected', {
    firstName: req.session.user.firstName,
    lastName: req.session.user.lastName,
    currentTime: new Date().toLocaleString(),
    role: req.session.user.role
  })

});

router.route('/admin').get(middleware.adminRedirect, async (req, res) => {
  //code here for GET
  res.render('admin', {
    firstName: req.session.user.firstName,
    lastName: req.session.user.lastName,
    currentTime: new Date().toLocaleString()
  })
});

router.route('/error').get(async (req, res) => {
  //code here for GET
  res.status(404).render('error', {e});

});

router.route('/logout').get(middleware.logoutRedirect, async (req, res) => {
  //code here for GET
  res.clearCookie("AuthState");
  res.status(400).render('logout', { message: 'You have been logged out.' });

});
export default router;