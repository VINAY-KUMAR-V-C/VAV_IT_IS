const recordUtil = require('./recordUtil');
const userModels = require('./models');
const queryUtil = require('./queryUtil');
const utils = require('../utils');
var userUtils = {
    addVAVUserInSession : async function(req,data){
        if (!req.session.vavSession) {
            req.session.vavSession = {};
        }
        req.session.vavSession.userDetails = data;
        // Serialize the session data before saving
        req.session.vavSessionSerialized = JSON.stringify(req.session.vavSession);
    
        await req.session.save((err) => {
            if (err) {
              console.error('Failed to save session:', err);
            } else {
              console.log('Session saved successfully:', req.session.vavSession.userDetails);
            }
        });
    },
    getUserDetailsFromSession : function(req,res){
        if(req && req.session && req.session.vavSession && req.session.vavSession.userDetails){
            return {
                isSuccess : true,
                result : req.session.vavSession.userDetails
            };
        }else{
            console.log(req.session);
            res.status(401).send({ error: 'Session has expired or no session data found. Please log in again.',redirect : utils.urls.baseURL });
            return {isSuccess : false,};
        }
    },
    isValidUser: async function (res,req,pool) {
        var modelDetails = userModels['usersLogin'];
        var email = req.body["userEmail"];
        var password = req.body["userPassword"];
        if(!(email || password)){
            return {
                isSuccess : false,
                message : "Email and password should not be empty"
            }
        }
        var criteria = modelDetails.fields['userEmail'].columnName +'= $1 and '+ modelDetails.fields['userPassword'].columnName+'= $2 ';
        var query = queryUtil.getSelectQuery(1, 2, modelDetails.tableName , null, criteria);
        var queryRes = await queryUtil.executeQuery(pool,query,[email,password]);
        if(!queryRes.isSuccess){
            return queryRes;
        }
        if(queryRes.result.length==0){
            return {
                isSuccess : false,
                message : "No user with this credentials, Kindly try to login again !"
            }
        }
        delete queryRes.result[0].userpassword;
        queryRes.result = recordUtil.methods.getFieldIdVsValue(queryRes.result[0],modelDetails.fields);
        await userUtils.addVAVUserInSession(req,queryRes.result);
        return {
            isSuccess : true,
            message : "Login success"
        }
    },
    createNewUser : async function(res,req,pool){
        var modelDetails = userModels['usersSignup'];
        var record = {
            userEmail : req.req.body["userEmail"],
            userPassword : req.req.body["userPassword"],
            userName : req.req.body["userName"]
        };
        if(!(record.userEmail || record.userPassword || record.userName)){
            return {
                isSuccess : false,
                message : "Email, UserName and password should not be empty"
            } 
        }
        var isUserAlreadyPresent = await userUtils.isEmailAlreadyPresent(pool,record.userEmail,modelDetails);
        if(!isUserAlreadyPresent.isSuccess){
            return isUserAlreadyPresent;
        }
        var resData = await recordUtil.methods.createNewRecord(pool,modelDetails,record);
        if(!resData.isSuccess){
            return resData;
        }
        userUtils.addVAVUserInSession(req.req,resData.result);
        return {
            isSuccess : true,
            message : "Signup success"
        }
    },
    isEmailAlreadyPresent :async function(pool,email,modelDetails){
        var criteria = modelDetails.fields['userEmail'].columnName +'= $1';
        var query = queryUtil.getSelectQuery(1, 2, modelDetails.tableName , null, criteria);
        var queryRes = await queryUtil.executeQuery(pool,query,[email]);
        if(queryRes.isSuccess && queryRes.result.length>0){
            return {
                isSuccess : false,
                message : 'User with this email already present !'
            };
        }else if(queryRes.result.length==0){
            return {
                isSuccess : true,
            };
        }
        else{
            return {
                isSuccess : false,
                message : 'Problem while creating new user !'
            };
        }
    }
}




module.exports = userUtils;
