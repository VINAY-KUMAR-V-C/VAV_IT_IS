path = require('path');
utils = {};
utils.isProduction = true;
utils.tokenExpiry = 1000 * 60 * 30;
//-------------------------------------------------------------------------------------------------------------
utils["urls"] = {
    baseURL: utils.isProduction ? 'https://vav-it-is.vercel.app/' : 'http://localhost:6969/'
}
//-------------------------------------------------------------------------------------------------------------

utils['database'] = {
    psql: {
        psqlConnectionData: {
            postgresUrl: process.env.POSTGRES_URL,
            postgresPrismaUrl: process.env.POSTGRES_PRISMA_URL,
            postgresUrlNoSsl: process.env.POSTGRES_URL_NO_SSL,
            postgresUrlNonPooling: process.env.POSTGRES_URL_NON_POOLING,
            postgresUser: process.env.POSTGRES_USER,
            postgresHost: process.env.POSTGRES_HOST,
            postgresPassword: process.env.POSTGRES_PASSWORD,
            postgresDatabase: process.env.POSTGRES_DATABASE
        }
    }
}

//-------------------------------------------------------------------------------------------------------------
utils['apps'] = {
    expenseTracker: {
        id: 'expenseTracker',
        label: 'Expense Tracker',
        folderName: 'expenseTracker',
        routerFileName: 'expenseTrackerRouter',
        defaultModel: 'expense'
    }
}
//-------------------------------------------------------------------------------------------------------------
utils['company'] = {
    companyId: 'vav',
    appName: 'VAV',
    folderName: 'vav',
    routerFileName: 'vavRouter'
}
//-------------------------------------------------------------------------------------------------------------
utils['session'] = {
    timeOfLive: 120
}
//-------------------------------------------------------------------------------------------------------------
utils.methods = {
    generateRandomId: function () {
        var length = 12;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    },
    addMillisecondsToCurrentTime: function (milliseconds) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + milliseconds);
        return futureDate;
    }
}
//-------------------------------------------------------------------------------------------------------------

module.exports = utils;
