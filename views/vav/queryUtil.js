const tableQuery = require('./queries');
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
  //   var query1 = `
  //   ALTER TABLE usersessions
  //   ALTER sess 
  //   TYPE varchar(1000)
  //   USING sess::varchar;
  // `;
  //   const r1 = await pool.query(query1, []);
    var response = {
      isSuccess: true
    };
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
