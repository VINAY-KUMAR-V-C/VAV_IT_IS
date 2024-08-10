const recordUtil = require('./recordUtil');
const userModels = require('./models');
const queryUtil = require('./queryUtil');
const utils = require('../utils');
var userUtils = {
    addVAVUserInSession: async function (data, pool) {
        var sample = await queryUtil.executeQuery(pool, `DELETE FROM usersessions WHERE expire < NOW();`, []);
        var tokenId = utils.methods.generateRandomId();
        var expiry = utils.methods.addMillisecondsToCurrentTime(utils.tokenExpiry);
        var query = `INSERT INTO usersessions (sid, sess, expire) VALUES ($1, $2, $3)`;
        var result = await queryUtil.executeQuery(pool, query, [tokenId, JSON.stringify(data), expiry]);
        if (result.isSuccess) {
            result.token = tokenId
        }
        return result;
    },
    getUserDetailsFromSession: async function (req, res, pool) {
        var token = req.headers['token'];
        if (token) {
            var result = await queryUtil.executeQuery(pool, `SELECT * FROM usersessions WHERE sid = $1 AND expire > NOW()`, [token]);
            if (!result.isSuccess) {
                return result;
            }
            else if (result.result.length == 0) {
                console.log(req.session);
                return { isSuccess: false, };
            } else {
                return {
                    isSuccess: true,
                    userDetails: JSON.parse(result.result[0].sess)
                };
            }
        } else {
            console.log(req.session);
            return { isSuccess: false, };
        }
    },
    isValidUser: async function (res, req, pool) {
        var modelDetails = userModels['usersLogin'];
        var email = req.body["userEmail"];
        var password = req.body["userPassword"];
        if (!(email || password)) {
            return {
                isSuccess: false,
                message: "Email and password should not be empty"
            }
        }
        var criteria = modelDetails.fields['userEmail'].columnName + '= $1 and ' + modelDetails.fields['userPassword'].columnName + '= $2 ';
        var query = queryUtil.getSelectQuery(1, 2, modelDetails.tableName, null, criteria);
        var queryRes = await queryUtil.executeQuery(pool, query, [email, password]);
        if (!queryRes.isSuccess) {
            return queryRes;
        }
        if (queryRes.result.length == 0) {
            return {
                isSuccess: false,
                message: "No user with this credentials, Kindly try to login again !"
            }
        }
        delete queryRes.result[0].userpassword;
        queryRes.result = recordUtil.methods.getFieldIdVsValue(queryRes.result[0], modelDetails.fields);
        var token = await userUtils.addVAVUserInSession(queryRes.result, pool);
        if (!token.isSuccess) {
            return token;
        }
        return {
            isSuccess: true,
            message: "Login success",
            token: token.token
        }
    },
    createNewUser: async function (res, req, pool) {
        var modelDetails = userModels['usersSignup'];
        var record = {
            userEmail: req.req.body["userEmail"],
            userPassword: req.req.body["userPassword"],
            userName: req.req.body["userName"]
        };
        if (!(record.userEmail || record.userPassword || record.userName)) {
            return {
                isSuccess: false,
                message: "Email, UserName and password should not be empty"
            }
        }
        var isUserAlreadyPresent = await userUtils.isEmailAlreadyPresent(pool, record.userEmail, modelDetails);
        if (!isUserAlreadyPresent.isSuccess) {
            return isUserAlreadyPresent;
        }
        var resData = await recordUtil.methods.createNewRecord(pool, modelDetails, record);
        if (!resData.isSuccess) {
            return resData;
        }
        var token = await userUtils.addVAVUserInSession(resData.result, pool);
        if (!token.isSuccess) {
            return token;
        }
        return {
            isSuccess: true,
            message: "Signup success"
        }
    },
    isEmailAlreadyPresent: async function (pool, email, modelDetails) {
        var criteria = modelDetails.fields['userEmail'].columnName + '= $1';
        var query = queryUtil.getSelectQuery(1, 2, modelDetails.tableName, null, criteria);
        var queryRes = await queryUtil.executeQuery(pool, query, [email]);
        if (queryRes.isSuccess && queryRes.result.length > 0) {
            return {
                isSuccess: false,
                message: 'User with this email already present !'
            };
        } else if (queryRes.result.length == 0) {
            return {
                isSuccess: true,
            };
        }
        else {
            return {
                isSuccess: false,
                message: 'Problem while creating new user !'
            };
        }
    }
}




module.exports = userUtils;
