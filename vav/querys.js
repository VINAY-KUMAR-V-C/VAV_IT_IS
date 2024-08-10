
tableVSQueries = {
    categroyInfo: async function (pool) {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS categoryinfo (
                categoryId SERIAL PRIMARY KEY,
                categoryName VARCHAR(255) NOT NULL
            );
        `;
        try {
            await pool.query(createTableQuery);
            console.log('Table created successfully');
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS categoryinfo (
                    categoryId SERIAL PRIMARY KEY,
                    categoryName VARCHAR(255) NOT NULL
                );
            `;
            try {
                await pool.query(createTableQuery);
                console.log('Table created successfully');
            } catch (err) {
                console.error('Error creating table', err.stack);
            }
        } catch (err) {
            console.error('Error creating table', err.stack);
        }
    }
}
async function createExpenseTable() {
    try {
      const client = await pool.connect();
  
      // Define the CREATE TABLE query for EXPENSE table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS EXPENSE (
          EXPID SERIAL PRIMARY KEY,
          EXPCATEGORYID VARCHAR(255),
          EXPAMOUNT NUMERIC(10, 2) CHECK (EXPAMOUNT <= 10000000),
          EXPDATE INTEGER, 
          EXPADDITIONALDETAILS VARCHAR(500)
        )`;
  
      // Execute the CREATE TABLE query
      await client.query(createTableQuery);
      console.log('EXPENSE table created successfully.');
  
      // Release the client back to the pool
      client.release();
    } catch (err) {
      console.error('Error creating EXPENSE table:', err.message);
    } finally {
      // Close the connection pool (optional, depending on your application's lifecycle)
      await pool.end();
    }
  }
module.exports = tableVSQueries;