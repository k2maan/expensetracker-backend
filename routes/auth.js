// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

// const express = require('express');
// const User = require('../models/userSchema');
// const router = express.Router();
// const { body, validationResult } = require('express-validator');
// const bcrypt = require('bcryptjs');
// var jwt = require('jsonwebtoken');
// var fetchUser = require('../middleware/fetchUser');
// require('dotenv').config()

// const JWT_SECRET = process.env.JWT_SECRET;

// // ROUTE 1: Create a User using: POST "/register". No login required
// router.post('/register', [
//   body('name', 'Enter a valid name').isLength({ min: 3 }),
//   body('email', 'Enter a valid email').isEmail(),
//   body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
// ], async (req, res) => {
//   let success = false;
//   // If there are errors, return Bad request and the errors
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) { 
//     return res.status(400).json({success, errors: errors.array() });
//   }
//   try {
//     // Check whether the user with this email exists already
//     let user = await User.findOne({success, email: req.body.email });
//     if (user) {
//       return res.status(400).json({success, error: "Sorry a user with this email already exists" })
//     }
//     const salt = await bcrypt.genSalt(10);
//     const secPass = await bcrypt.hash(req.body.password, salt);

//     // Create a new user
//     user = await User.create({
//       name: req.body.name,
//       password: secPass,
//       email: req.body.email,
//     });
//     const data = {
//       user: {
//         id: user.id
//       }
//     }
//     const authtoken = jwt.sign(data, JWT_SECRET);



//     success= true
//     res.json({success, authtoken ,  userId: user.id})

//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Internal Server Error");
//   }
// })


// // ROUTE 2: Authenticate a User using: POST "/login". No login required
// router.post('/login', [
//   body('email', 'Enter a valid email').isEmail(),
//   body('password', 'Password cannot be blank').exists(),
// ], async (req, res) => {
//   let success = false;
//   // If there are errors, return Bad request and the errors
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { email, password } = req.body;
//   try {
//     let user = await User.findOne({ email });
//     if (!user) {
//       success = false
//       return res.status(401).json({ error: "Please try to login with correct credentials" });
//     }

//     const passwordCompare = await bcrypt.compare(password, user.password);
//     if (!passwordCompare) {
//       success = false
//       return res.status(401).json({ success, error: "Please try to login with correct credentials" });
//     }

//     const data = {
//       user: {
//         id: user.id
//       }
//     }
//     const authtoken = jwt.sign(data, JWT_SECRET);
//     success = true;
//     res.json({ success, authtoken })
//     res.json({ token, userId: user._id });

//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Internal Server Error");
//   }


// });


// // ROUTE 3: Get loggedin User Details using: POST "/getuser". Login required
// router.post('/getuser', fetchUser, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId).select("name email");
//     if (!user) {
//       return res.status(404).send("User not found");
//     }
//     res.json({ userId: userId, name: user.name, email: user.email });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Internal Server Error");
//   }
// });

  
  
  
// module.exports = router
const express = require('express');
const User = require('../models/userSchema');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();
var fetchUser = require('../middleware/fetchUser');
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Configure Passport.js with Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in the database
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // User already exists, authenticate and return the user
          done(null, user);
        } else {
          // User does not exist, create a new user and return it
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            // You can generate a random password for Google-authenticated users
            password: Math.random().toString(36).slice(-8),
          });

          done(null, user);
        }
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Initialize Passport.js middleware
router.use(passport.initialize());

// ROUTE 1: Create a User using: POST "/register". No login required
router.post(
  '/register',
  [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      // Check whether the user with this email exists already
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({ success, error: 'Sorry, a user with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create a new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);

      success = true;

      res.json({ success, authtoken, userId: user.id });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  }
);

// ROUTE 2: Authenticate a User using: POST "/login". No login required
router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
  ],
  async (req, res) => {
    let success = false;

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, isGoogleLogin } = req.body;

    try {
      let user;

      if (isGoogleLogin) {
        // Handle Google authentication logic
        return passport.authenticate('google', {
          scope: ['profile', 'email'],
          session: false, // Disable session-based authentication since we are using JWT
        })(req, res);
      } else {
        // Handle email/password authentication logic
        user = await User.findOne({ email });

        if (!user) {
          success = false;
          return res.status(401).json({ error: 'Please try to login with correct credentials' });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);

        if (!passwordCompare) {
          success = false;
          return res.status(401).json({ success, error: 'Please try to login with correct credentials' });
        }
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
    }
  }
);

// ROUTE 3: Get logged-in User Details using: POST "/getuser". Login required
router.post('/getuser', fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('name email');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.json({ userId: userId, name: user.name, email: user.email });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
});

// Google authentication route
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google authentication callback route
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    session: false, // Disable session-based authentication since we are using JWT
    failureRedirect: '/login', // Redirect to the login page in case of authentication failure
  }),
  (req, res) => {
    const data = {
      user: {
        id: req.user.id,
      },
    };

    const authtoken = jwt.sign(data, JWT_SECRET);
    res.redirect(`http://localhost:3000/login/success?token=${authtoken}`);
  }
);

module.exports = router;
