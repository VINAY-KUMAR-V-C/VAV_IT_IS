const queries = require("./queryUtil");
const expenseTrackerModels = require("./apps/expenseTracker/models");
const fieldUtil = require("./fieldUtil");
var recordUtil = {};
recordUtil.methods = {
    getBasicDataFromRequest: function (req, needModelId, needPayload, needModelRecordId) {
        const dataFromRequest = {};
        if (needModelId) {
            dataFromRequest.modelId = req.params.modelId;
        }
        if (needModelRecordId) {
            dataFromRequest.modelRecordId = Number(req.params.modelRecordId);
        }
        if (needPayload) {
            dataFromRequest.payload = req.body;
        }
        return dataFromRequest;
    },

    createNewRecord: async function (pool,modelDetails,record,userDetails) {
        var response = { isSuccess: true };
        try {
            var fieldDetails = modelDetails.fields;
            var columnNameVsValue = {};
            for (var fieldId in fieldDetails) {
                if (fieldDetails.hasOwnProperty(fieldId)) {
                    if (fieldDetails[fieldId].clientDisplay) {
                        var value = fieldUtil.methods.validateAndgetValueForField(record[fieldId], fieldDetails[fieldId],modelDetails);
                        if (value.isSuccess) {
                            columnNameVsValue[fieldDetails[fieldId].columnName] = value.value;
                        } else {
                            return value;
                        }
                    }
                }
            }
            if(userDetails){
                columnNameVsValue["USERID"] = userDetails["userId"]; 
            }
            var { queryText, values } = queries.getInsertQuery(columnNameVsValue, modelDetails.tableName);
            var queryResult = await queries.executeQuery(pool, queryText, values);
            if (!queryResult.isSuccess) {
                return queryResult;
            } else {
                var fieldIdVsValue = recordUtil.methods.getFieldIdVsValue(queryResult.result[0], fieldDetails);
                response.result = fieldIdVsValue;
            }
        } catch (error) {
            response.error = error;
            response.isSuccess = false;
            return response;
        }
        return response;
    },

    getFieldIdVsValue: function (columnNameVsValue, fieldDetails) {
        var fieldIdVsValue = {};
        for (const fieldId in fieldDetails) {
            if (fieldDetails.hasOwnProperty(fieldId)) {
                if(fieldDetails[fieldId].type=='password'){
                    continue;
                }
                fieldIdVsValue[fieldId] = columnNameVsValue[fieldDetails[fieldId].columnName.toLowerCase()];
                if(fieldDetails[fieldId].type=='date'){
                    fieldIdVsValue[fieldId] = new Date(fieldIdVsValue[fieldId] * 1000);
                }
            }
        }
        return fieldIdVsValue;
    },

    getRecords : async function(pool,modelDetails,page,count,userDetails){
        var response = {isSuccess:true};
        page = (page==undefined)?1:Number(page);
        count = (count==undefined || Number(count)==0)?10:Number(count);
        count = count>50?50:count;
        var modelId = modelDetails.id;
        var orderBy = modelId=='expense'?'EXPDATE' : "";
        var cri = null;
        if(userDetails){
            cri = `USERID = `+userDetails.userId;
        }
        var countQuery = queries.getCountQuery(modelDetails.tableName,cri);
        var totalNumberOfRecords = await queries.executeQuery(pool,countQuery);
        if((totalNumberOfRecords).isSuccess){
            totalNumberOfRecords = totalNumberOfRecords.result[0].count;
        }else{
            return totalNumberOfRecords;
        }
        var selectQuery = queries.getSelectQuery(page,count,modelDetails.tableName,orderBy,cri);
        var result = await queries.executeQuery(pool,selectQuery);
        var records = [];
        if(result.isSuccess){
            result = result.result;
            for(var i=0;i<result.length;i++){
                var record = recordUtil.methods.getFieldIdVsValue(result[i],modelDetails.fields);
                records.push(record);
            }
            response.result = {
                records:records,
                totalRecordsCount:totalNumberOfRecords
            }
            return response;
        }else{
            return result;
        }
    },

    getRecordById : async function(pool,modelDetails,recordId,userDetails){
        var response = {isSuccess:true};
        var priCol = modelDetails.fields[modelDetails.primaryKey].columnName;
        var values = [recordId];
        var whereCond = priCol+'= $1';
        if(userDetails){
            whereCond +=  ' and USERID = $2';
            values.push(userDetails.userId);
        }
        var selectQuery = queries.getSelectQuery(1,1,modelDetails.tableName, false, whereCond);        
        var record = await queries.executeQuery(pool,selectQuery,values);
        if(record.isSuccess){
            if(record.result.length==0){
                response.isSuccess = false;
                response.message = "No records found with this id ("+recordId+") in this model ("+modelDetails.label+") !";
                return response;
            }else{
                record = recordUtil.methods.getFieldIdVsValue(record.result[0],modelDetails.fields);
                response.result = record;
                return response;
            }
        }else{
            record;
        }
    },

    updateRecord : async function(pool,modelId,recordId,record,userDetails){
        var response = {isSuccess:true};
        var fieldDetails = expenseTrackerModels[modelId].fields;
        var columnNames = [];
        var updateValues = [];
        for(var fieldId in fieldDetails){
            if(record[fieldId]!=undefined){
                var value = fieldUtil.methods.validateAndgetValueForField(record[fieldId],fieldDetails[fieldId],expenseTrackerModels[modelId]);
                if(!value.isSuccess){
                    return value;
                }
                columnNames.push(fieldDetails[fieldId].columnName); 
                updateValues.push(value.value);
            }
        }
        if(updateValues.length==0){
            response.message = "Nothing to update";
            return response;
        }
        var whereCond =  (modelId=='expense')?fieldDetails[expenseTrackerModels[modelId].primaryKey].columnName+'='+recordId:null;
        if(userDetails){
            whereCond +=  ' and USERID = '+userDetails.userId;
        }
        var query = queries.getUpdateQuery(expenseTrackerModels[modelId].tableName,columnNames,whereCond);
        var updateResult = await queries.executeQuery(pool,query,updateValues);
        if(updateResult.isSuccess){
            response.result = recordUtil.methods.getFieldIdVsValue(updateResult.result[0],fieldDetails);
            return response;
        }else{
            return updateResult;
        }
    },

    deleteRecordById : async function(pool,modelDetails,recordId,userDetails){
        var primarColumn = modelDetails.fields[modelDetails.primaryKey].columnName;
        var whereCond = primarColumn+'=$1';
        if(userDetails){
            whereCond +=  ' and USERID = '+userDetails.userId;
        }
        var values = [recordId];
        var query = queries.getDeleteQuery(modelDetails.tableName,whereCond);
        var deleteRecord = await queries.executeQuery(pool,query,values);
        if(deleteRecord.isSuccess && deleteRecord.result.length>0){
            var response = {
                isSuccess : true,
                message : "Record Deleted Successfully",
            }
            return response;
        }else if(deleteRecord.isSuccess && deleteRecord.result.length==0){
            var response = {
                isSuccess : true,
                message : "Record Not found",
            }
            return response;
        }else{
            return deleteRecord;
        }
    }
};
module.exports = recordUtil;