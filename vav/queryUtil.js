const queries = {
  getInsertQuery: function (columnNameVSvalue, tableName) {
    const columns = Object.keys(columnNameVSvalue).join(', ');
    const values = Object.values(columnNameVSvalue);
    const queryText = `INSERT INTO ${tableName} (${columns}) VALUES (${values.map((_, index) => '$' + (index + 1)).join(', ')}) RETURNING *`;
    return { queryText, values };
  },

  getSelectQuery: function (page, count, tableName, orderBy, whereCondition) {
    const offset = (page - 1) * count;
    var query = `SELECT * FROM ${tableName}`;
    query += (whereCondition) ? ` WHERE ${whereCondition}` : ``;
    query += (orderBy) ? ` ORDER BY ${orderBy} DESC` : ``;
    query += ` LIMIT ${count} OFFSET ${offset}`;
    return query;
  },

  executeQuery: async function (pool, queryText, values) {
    var response = {
      isSuccess: true
    };
    const createUserDetailsTableQuery = `
    CREATE TABLE IF NOT EXISTS USERDETAILS (
      USERID SERIAL PRIMARY KEY,
      USERNAME VARCHAR(200) NOT NULL,
      USEREMAIL VARCHAR(200) NOT NULL,
      USERPASSWORD VARCHAR(20) NOT NULL
    )`;

  const createExpenseTableQuery = `
    CREATE TABLE IF NOT EXISTS EXPENSE (
      EXPID SERIAL PRIMARY KEY,
      EXPCATEGORYID VARCHAR(255),
      EXPAMOUNT NUMERIC(10, 2) CHECK (EXPAMOUNT <= 10000000),
      EXPDATE INTEGER, 
      EXPADDITIONALDETAILS VARCHAR(500),
      USERID INTEGER,
      FOREIGN KEY (USERID) REFERENCES USERDETAILS(USERID)
    )`;
    await pool.query(createUserDetailsTableQuery);
    await pool.query(createExpenseTableQuery);
    try {
      const res = await pool.query(queryText, values);
      response.result = res.rows;
      return response;
    } catch (err) {
      response.isSuccess = false;
      console.log(err);
      response.message = "Internal Server Error : (Issue in query execution)"
      return response;
    }
  },

  getCountQuery: function (tableName, whereCondition) {
    var query = `SELECT COUNT(*) FROM ${tableName}`;
    query += (whereCondition) ? ` WHERE ${whereCondition}` : ``;
    return query;
  },

  getUpdateQuery: function (tableName, columns, whereCondition) {
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');
    const queryText = `UPDATE ${tableName} SET ${setClause}` +
      (whereCondition ? ` WHERE ${whereCondition}` : '') +
      ` RETURNING *`;
    return queryText;
  },

  getDeleteQuery: function (tableName, whereCondition) {
    const queryText = `DELETE FROM ${tableName}` +
      (whereCondition ? ` WHERE ${whereCondition}` : '') +
      ` RETURNING *`;
    return queryText;
  }
  
};

module.exports = queries;
