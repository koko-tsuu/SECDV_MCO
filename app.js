require('dotenv').config();

const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo');

const mongoose = require("mongoose");

const PORT = 3000 || process.env.PORT;
const connecttoDB = require('./server/config/db');

app.use(
    session({
      name: 'id',
      secret: process.env.SESSION_SECRET, // Replace with your own secret key
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI, // Replace with your MongoDB connection URL and database name
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'native' 
      }),
      cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true // Restrict client-side access to the cookie
      }
    })
  );


const userRouter = require('./routes/user');
const Account = require('./server/schema/Account');
app.use('/user', userRouter);
app.use('/user', express.static(__dirname + "/public"));

const tagRouter = require('./routes/tag');
const Tag = require('./server/schema/Tag');
app.use('/tag', tagRouter);
app.use('/tag', express.static(__dirname + "/public"));

const searchRouter = require('./routes/search');
app.use('/search', searchRouter);
app.use('/search', express.static(__dirname + "/public"));

const postRouter = require('./routes/post');
const Post = require('./server/schema/Post');
app.use('/post', postRouter);
app.use('/post', express.static(__dirname + "/public"));

const accountAuthRouter = require('./routes/account-auth');
app.use('/', accountAuthRouter);

const homeRouter = require('./routes/home');
app.use('/home', homeRouter);

const subscribeRouter = require('./routes/subscribe');
app.use('/subscribe', subscribeRouter);

connecttoDB();

app.use(express.static(__dirname + "/public"));
app.engine("hbs", exphbs.engine({
    extname:'hbs',
    helpers: {
        each_upto: (n, block) => 
        {
            var x = '';
            for(var i = 0; i < n; i++)
                x+= block.fn(i)
            return x;
        },
        formatDate: function(date) {
          const monthNames = [
            "January", "February", "March", "April", "May", "June", 
            "July", "August", "September", "October", "November", "December"
          ];
        
        let day = date.getDate();
        let month = date.getMonth();
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();

        let formattedTime = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // Convert to 12-hour format
        formattedTime = hours + ":" + (minutes < 10 ? "0" : "") + minutes + " " + formattedTime;
    
        // Format the date
        let formattedDate = monthNames[month] + " " + day + ", " + year + " " + formattedTime;
        
        return formattedDate;
      },
      noTimeFormatDate: function(date) {
        const monthNames = [
          "January", "February", "March", "April", "May", "June", 
          "July", "August", "September", "October", "November", "December"
        ];
      
      let day = date.getDate();
      let month = date.getMonth();
      let year = date.getFullYear();
  
      // Format the date
      let formattedDate = monthNames[month] + " " + day + ", " + year + " ";
      
      return formattedDate;

      }
    }
  }));
app.set("view engine", "hbs");
app.set("views", "./views");

app.listen(PORT, () => {
    console.log("Server listening. Port: " + PORT);
});

app.get('/about', async(req, res) =>{
  let logged_in = false;
  let navbar = 'navbar';
  if(req.session.username) {
    //user is logged in
    logged_in = true;
    
    navbar = 'logged-navbar';
  }

  res.render('about',{
    title: "About us",
    navbar: navbar,
    logged_in: logged_in,
    session_user: req.session.username,
  });
});

app.get('/', (req, res) =>{
    res.redirect('/home');
});

app.all('*', async (req, res) => {
    res.status(404);
    
    let logged_in = false;
  let navbar = 'navbar';
  if(req.session.username) {
    //user is logged in

    logged_in = true;
    
    navbar = 'logged-navbar';
  }

    res.render("404",{
    title: "404 | Not found",
    navbar: navbar,
    logged_in: logged_in,
    session_user: req.session.username})
});

