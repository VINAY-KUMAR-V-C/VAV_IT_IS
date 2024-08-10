const express = require('express');
const router = express.Router();
const utils = require('../../../utils');
const expenseTrackerModels = require('./models');
const recordUtil = require('../../recordUtil');
const appDetails = utils.apps.expenseTracker;
const queryUtils = require('../../queryUtil');
const userUtil = require('../../userUtil');

var appUtils = {};
appUtils.methods = {
  getCommonDetails : function(keys,values){
    var data = {};
    for(var i=0;i<keys.length;i++){
      data[keys[i]] = values[i];
    }
    data['app'] = appDetails;
    data['baseURL'] = utils.urls.baseURL;
    data["company"] = utils.company;
    return data;
  },
  getCategoryVsAmount : async function(pool,modelDetails,chartId,userDetails){
    //EXTRACT(YEAR FROM TO_TIMESTAMP(EXPDATE)) AS year,
    //EXTRACT(MONTH FROM TO_TIMESTAMP(EXPDATE)) AS month,
    var groupByFieldId = modelDetails.charts[chartId].groupByField;
    var groupByColumn = modelDetails.fields[groupByFieldId].columnName;
    var sumOfColumn = modelDetails.fields[modelDetails.charts[chartId].sumOfField].columnName;
    var tableName = modelDetails.tableName;
    const query = `
    SELECT ${groupByColumn} AS group_by_field, SUM(${sumOfColumn}) AS total_amount
    FROM ${tableName} WHERE USERID = ${userDetails.userId}
    GROUP BY ${groupByColumn}
    `;
    //ORDER BY year DESC, month DESC`;
    var queryOutput = await queryUtils.executeQuery(pool,query);
    if(!queryOutput.isSuccess){
      return queryOutput;
    }
    queryOutput = queryOutput.result;
    var output = {
      labels :[],
      values : [],
      chartDetails : modelDetails.charts[chartId]
    };
    var preDefinedValues = modelDetails.preDefinedValues[groupByFieldId];
    for(var i=0;i<queryOutput.length;i++){
      output["labels"].push(preDefinedValues[queryOutput[i].group_by_field].label +' : '+queryOutput[i].total_amount); 
      output["values"].push(queryOutput[i].total_amount); 
    }
    return {isSuccess:true,result:output};
  }
};

module.exports = (pool) => {
  router.use(async (req, res, next) => {
    if (req.path == '/index' && !req.headers.token) {
      if(!req.query.token){
        res.status(404).send({ error: 'Authentication error : Token param is absent!'});
        return ;
      }else{
        req.headers.token = req.query.token;
      }
    }
    var userDetails = await userUtil.getUserDetailsFromSession(req,res,pool);
    if(userDetails.isSuccess){
      userDetails = userDetails.userDetails;
    }else{
      res.status(401).send({ error: 'Session has expired or no session data found. Please log in again.', redirect: utils.urls.baseURL });
      return;
    }
    req.userDetails = userDetails;
    next();
  });
  router.get('/index', (req, res) => {
    var data = appUtils.methods.getCommonDetails(["model","token"],[expenseTrackerModels['expense'],req.headers.token]);
    res.render('appIndex', { data });
  });
  router.get('/:modelId/charts',async (req, res) => {
    var userDetails = req.userDetails;
    var reqData = recordUtil.methods.getBasicDataFromRequest(req, true, false, false);
    var modelId = reqData.modelId;
    var modelDetails = expenseTrackerModels[modelId];
    var data = await appUtils.methods.getCategoryVsAmount(pool,modelDetails,"categoryIdVsAmount",userDetails);
    if(!modelDetails){
      res.status(404).send({ error: 'No model with this name : '+modelId });
      return ;
    }
    if(data.isSuccess){
      data = data.result;
      res.render('chart', { data });
    }else{
      res.status(404).send({ error: data.message });
    }
  });

  router.get('/:modelId/formcreate', (req, res) => {
    var reqData = recordUtil.methods.getBasicDataFromRequest(req, true, false, false);
    var modelId = reqData.modelId;
    var modelDetails = expenseTrackerModels[modelId];
    if(modelDetails==null){
      return {
        isSuccess : false,
        message : 'No model with this name : '+modelId
      }
    }
    var data = appUtils.methods.getCommonDetails(["formType","model"],["create",modelDetails]);
    res.render('form', { data });
  });

  router.get('/:modelId/formedit/:modelRecordId',async (req, res) => {
    var userDetails = req.userDetails;
    var reqData = recordUtil.methods.getBasicDataFromRequest(req, true, false, true);
    var modelId = reqData.modelId;
    var modelDetails = expenseTrackerModels[modelId];
    if(modelDetails==null){
      res.status(404).send({ error: 'No model with this name : '+modelId });
      return ;
    }
    var recordId = reqData.modelRecordId;
    if(typeof recordId != 'number' || isNaN(recordId)){
      res.status(404).send({ error: 'Record Id given is not number' });
      return ;
    }
    var recordId =Number(recordId); 
    var record = await recordUtil.methods.getRecordById(pool,modelDetails,recordId,userDetails);
    if(!record.isSuccess){
      return res.status(500).json(record);
    }
    var data = appUtils.methods.getCommonDetails(["formType","record","model"],["edit",record.result,modelDetails]);
    res.render('form', { data });
  });

  router.post('/:modelId', async (req, res) => {
    var userDetails = req.userDetails;
    const reqData = recordUtil.methods.getBasicDataFromRequest(req, true, true, false);
    var modelId = reqData.modelId;
    var modelDetails = expenseTrackerModels[modelId];
    if(modelDetails==null){
      res.status(404).send({ error: 'No model with this name : '+modelId });
      return ;
    }
    const recordCreateResponse = await recordUtil.methods.createNewRecord(pool, modelDetails,reqData.payload,userDetails);
    if (recordCreateResponse.isSuccess) {
      res.status(200).send(recordCreateResponse.result);
    } else {
      res.status(500).json({ error: recordCreateResponse.message });
    }
  });

  router.get('/:modelId/list', async (req, res) => {
    var userDetails = req.userDetails;
    const reqData = recordUtil.methods.getBasicDataFromRequest(req, true, true, false);
    var modelId = reqData.modelId;
    var modelDetails = expenseTrackerModels[modelId];
    if(modelDetails==null){
      res.status(404).send({ error: 'No model with this name : '+modelId });
      return ;
    }
    var result = await recordUtil.methods.getRecords(pool, modelDetails,req.query.page,req.query.count,userDetails);
    if (result.isSuccess) {
      res.status(200).send(result.result);
    } else {
      res.status(404).json({ error: result.message });
    }
  });

  router.get('/:modelId', async (req, res) => {
    const reqData = recordUtil.methods.getBasicDataFromRequest(req, true, false, false);
    const modelId = reqData.modelId;
    var modelDetails = expenseTrackerModels[modelId];
    if(modelDetails==null){
      res.status(404).send({ error: 'No model with this name : '+modelId });
      return ;
    }
    var data = {
      appDetails: appDetails,
      modelDetails: modelDetails,
      baseURL: utils.urls.baseURL,
      companyDetails: utils.company
    }
    res.render('listPage', { data });
  });

  router.delete('/:modelId/:modelRecordId',async (req, res) => {
    var userDetails = req.userDetails;
    const reqData = recordUtil.methods.getBasicDataFromRequest(req, true, false, true);
    var modelId = reqData.modelId;
    var recordId = reqData.modelRecordId;
    if(typeof recordId != 'number' || isNaN(recordId)){
      res.status(404).send({ error: 'Record Id given is not number' });
      return ;
    }
    var recordId =Number(recordId); 
    var modelDetails = expenseTrackerModels[modelId];
    if(modelDetails==null){
      res.status(404).send({ error: 'No model with this name : '+modelId });
      return ;
    }
    var deleteRes = await recordUtil.methods.deleteRecordById(pool,modelDetails,recordId,userDetails);
    if(deleteRes.isSuccess){
      res.status(200).send(deleteRes.message);
    }else{
      res.status(404).send({ error: deleteRes.message });
    }
  });

  router.put('/:modelId/:modelRecordId',async (req, res) => {
    var userDetails = req.userDetails;
    const reqData = recordUtil.methods.getBasicDataFromRequest(req, true, true, true);
    var modelId = reqData.modelId;
    var recordId =Number(reqData.modelRecordId); 
    var record = reqData.payload;
    var recordUpdateResponse = await recordUtil.methods.updateRecord(pool,modelId,recordId,record,userDetails);
    if (recordUpdateResponse.isSuccess) {
      if(recordUpdateResponse.result==null){
        res.status(200).send(recordUpdateResponse.message);
      }else{
        res.status(200).send(recordUpdateResponse.result);
      }
    } else {
      res.status(404).json({ error: recordUpdateResponse.message });
    }
  });
  return router;
};
