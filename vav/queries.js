var queries = {
    table :{
        userSessions :`
        CREATE TABLE IF NOT EXISTS usersessions (
          sid VARCHAR NOT NULL PRIMARY KEY,
          sess VARCHAR NOT NULL,
          expire TIMESTAMP NOT NULL
        );
      `,
        userDetails :`
        CREATE TABLE IF NOT EXISTS USERDETAILS (
          USERID SERIAL PRIMARY KEY,
          USERNAME VARCHAR(200) NOT NULL,
          USEREMAIL VARCHAR(200) NOT NULL,
          USERPASSWORD VARCHAR(20) NOT NULL
        )`,
        EXPENSE :`
        CREATE TABLE IF NOT EXISTS EXPENSE (
          EXPID SERIAL PRIMARY KEY,
          EXPCATEGORYID VARCHAR(255),
          EXPAMOUNT NUMERIC(10, 2) CHECK (EXPAMOUNT <= 10000000),
          EXPDATE INTEGER, 
          EXPADDITIONALDETAILS VARCHAR(500),
          USERID INTEGER,
          FOREIGN KEY (USERID) REFERENCES USERDETAILS(USERID)
        )`
    }
}
module.exports = queries;
