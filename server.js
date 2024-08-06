const express = require('express');
const utils = require('./utils')
const app = express();
const path = require('path');
const { Pool } = require('pg');
const session = require('express-session');
//Notes :
// make secure true once application is deployed in vercel
//-------------------------------------------------------------------------------------------------------------
const serverDetails = {
    port : 6969,
}
//-------------------------------------------------------------------------------------------------------------
// Configure session middleware
app.use(session({
    secret: 'vav_it_is_XUV', // Replace with a strong, random secret key
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true, // Set to true if using HTTPS and false in localhost
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      maxAge: 1000 * 60 * 30 // Session max age in milliseconds (30 minutes)
    }
  }));
//-------------------------------------------------------------------------------------------------------------
const psql = new Pool({
    connectionString:utils.database.psql.psqlConnectionData.postgresUrl,
});
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
const companyRouterHandler = './'+companyDetails.folderName+'/'+companyDetails.routerFileName;
const companyRouter = '/'+companyDetails.companyId;

app.use(companyRouter, require(companyRouterHandler)(psql));
app.get('/', (req, res) => {
    res.redirect('/vav');
  });
app.use((req, res) => {
    res.status(404).sendFile(__dirname + '/views/404.html');
});
app.listen(serverDetails.port, () => {
    console.log(`Server is running on ${utils.urls.baseURL }`);
});
//-------------------------------------------------------------------------------------------------------------
