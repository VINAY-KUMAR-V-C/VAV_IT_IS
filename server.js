const express = require('express');
const utils = require('./utils')
const app = express();
const path = require('path');
const { Pool } = require('pg');
const session = require('express-session');
const cookieParser = require("cookie-parser");
//Notes :
// make secure true once application is deployed in vercel
//-------------------------------------------------------------------------------------------------------------
const serverDetails = {
  port: 6969,
}

//-------------------------------------------------------------------------------------------------------------
const psql = new Pool({
  connectionString: utils.database.psql.psqlConnectionData.postgresUrl,
});
//-------------------------------------------------------------------------------------------------------------
// // Configure session middleware
app.use(cookieParser());
app.use(session({
  resave : true,
  saveUninitialized:true,
  secret : "vav_it_is_XUV",
  cookie: { maxAge: 1000 * 60 * 30 } // 5 mins
}))
// app.use(session({
//   store: new pgSession({
//     pool: psql,
//     tableName: 'usersessions'
//   }),
//   // Custom serialization
//   serialize: function (session) {
//     return JSON.stringify(session); // Serialize to JSON string
//   },
//   unserialize: function (session) {
//     return JSON.parse(session); // Deserialize from JSON string
//   },
//   secret: 'vav_it_is_XUV', // Replace with a strong, random secret key
//   resave: false,
//   saveUninitialized: false, // Recommend false to comply with laws that require permission before setting a cookie
//   cookie: {
//     secure: utils.isProduction,
//     httpOnly: true,
//     maxAge: 1000 * 60 * 30,
//     sameSite: 'none'
//   }
// }));

// app.use((req, res, next) => {
//   console.log('Session ID:', req.sessionID);
//   next();
// });
//-------------------------------------------------------------------------------------------------------------
// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
//-------------------------------------------------------------------------------------------------------------
app.set('views', path.join(__dirname, 'views'));
//this is used to send value to html dynamically
app.set('view engine', 'ejs');

//-------------------------------------------------------------------------------------------------------------
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

//-------------------------------------------------------------------------------------------------------------
const companyDetails = utils.company;
const companyRouterHandler = './' + companyDetails.folderName + '/' + companyDetails.routerFileName;
const companyRouter = '/' + companyDetails.companyId;

app.use(companyRouter, require(companyRouterHandler)(psql));
app.get('/', (req, res) => {
  res.redirect('/vav');
});
app.use((req, res) => {
  res.status(404).sendFile(__dirname + '/views/404.html');
});
app.listen(serverDetails.port, () => {
  console.log(`Server is running on ${utils.urls.baseURL}`);
});
//-------------------------------------------------------------------------------------------------------------
