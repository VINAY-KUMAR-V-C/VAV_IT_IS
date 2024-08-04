path = require('path');
utils = {};
//-------------------------------------------------------------------------------------------------------------
utils["urls"] = {
    baseURL : 'http://localhost:6969/'
}
//-------------------------------------------------------------------------------------------------------------

utils['database'] = {
    psql : {
        psqlConnectionData : {
            postgresUrl : process.env.POSTGRES_URL,
            postgresPrismaUrl : process.env.POSTGRES_PRISMA_URL,
            postgresUrlNoSsl : process.env.POSTGRES_URL_NO_SSL,
            postgresUrlNonPooling : process.env.POSTGRES_URL_NON_POOLING,
            postgresUser : process.env.POSTGRES_USER,
            postgresHost : process.env.POSTGRES_HOST,
            postgresPassword : process.env.POSTGRES_PASSWORD,
            postgresDatabase : process.env.POSTGRES_DATABASE
        }
    }
}

//-------------------------------------------------------------------------------------------------------------
utils['apps'] = {
    expenseTracker : {
        id : 'expenseTracker',
        label : 'Expense Tracker',
        folderName : 'expenseTracker',
        routerFileName : 'expenseTrackerRouter',
        defaultModel : 'expense'
    }
}
//-------------------------------------------------------------------------------------------------------------
utils['company'] = {
    companyId : 'vav',
    appName : 'VAV',
    folderName : 'vav',
    routerFileName : 'vavRouter'
}
//-------------------------------------------------------------------------------------------------------------
utils['session'] = {
    timeOfLive : 120
}
//-------------------------------------------------------------------------------------------------------------

module.exports = utils;