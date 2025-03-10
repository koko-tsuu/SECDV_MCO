const express = require ("express");
const router = express.Router();
const Account = require('../server/schema/Account');
router.use(express.urlencoded({ extended: true }));
router.use(express.json());
const bcrypt = require('bcryptjs');



router.post('/', async (req, res) =>{

    try {
        const { action } = req.body;
        
        if(action === 'register') {

            const { username, email_reg, password_reg } = req.body;
             //Check if the user already exists 
            //will make frontend for this
            const existingUser = await Account.findOne({ email:email_reg });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists'});
            }

            const hashedPassword = await bcrypt.hash(password_reg, 10);

            // Create a new account document
            const newAccount = new Account({
                username: username.toLowerCase(),
                email: email_reg,
                password: hashedPassword
            });

            newAccount.save()
            .then(savedAccount => {
                console.log('New Account created:', savedAccount);
                req.session.username = username;
                return res.json({ message: 'Successfully registered! You will be redirected shortly.', username: username.toLowerCase() });
            })
            .catch(error => {
                console.error('Error creating Account:', error);
            });
        } else if (action === 'login') {
            const { email_log, password_log, rememberMe } = req.body;

            const user = await Account.findOne( {email: email_log} );

            if (!user) {
                console.log('user');
                console.log(user);
                return res.status(401).json({ message: 'Invalid credentials'});
            }

            const passwordComp = await bcrypt.compare(password_log, user.password);

            if (!passwordComp) {
                console.log(passwordComp);
                return res.status(401).json({ message: 'Invalid credentials'});
            }
            
            req.session.username = user.username;

            if (rememberMe) {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

                console.log("cookie created ", req.session.cookie.maxAge);
              } 

            return res.json({ username: user.username });
        }


                } catch (error) {
                    
                    console.error('Error registering user:', error);
                    return res.status(500).send('Error registering user.');
                }

});

router.get('/findUser', async (req, res) => {
    const username = req.query.user;
    const userInUse = await Account.findOne({username:username}).exec();
    if (userInUse){
        res.sendStatus(400);
    } else {
        res.sendStatus(200);
    }
})

// REGEX FROM: https://www.simplilearn.com/tutorials/javascript-tutorial/email-validation-in-javascript
router.get('/verifyEmail', async (req, res) => {
    const email = req.query.email;
    const emailInUse = await Account.findOne({email:email}).exec();

    var validEmailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const isValid = email.match(validEmailFormat);
    console.log(isValid);

    if (emailInUse){ 
        res.sendStatus(400);
    } else if (!isValid){
        res.sendStatus(422);
    } else {
        res.sendStatus(200);
    }

})

router.get('/isEmail', async (req, res) => {
    const email = req.query.email;
    const emailInUse = await Account.findOne({email:email}).exec();

    var validEmailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    const isValid = email.match(validEmailFormat);
    console.log(isValid);

    if (!emailInUse){ //email has no acc
        res.sendStatus(400);
    } else if (!isValid){ //invalid format
        res.sendStatus(422);
    } else { 
        res.sendStatus(200);
    }
});

// Add a new route for logging out
router.get('/logout', (req, res) => {
  // Destroy the session to log the user out

  req.session.cookie.maxAge = 0;

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }

    // Redirect to the home page after logout
    res.redirect('/home');
  });

});

module.exports = router;