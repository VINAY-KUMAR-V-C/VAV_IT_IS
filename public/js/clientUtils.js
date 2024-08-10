var clientUtils = {};
clientUtils.data = {};
clientUtils.data.models = {};
clientUtils.methods = {
    validateFields: function (fieldDetails, fieldValue) {
        var response = { isSuccess: true };
        if (fieldDetails.isMandatory) {
            switch (fieldDetails.type) {
                case 'number':
                    if (!(Number(fieldValue) > 0 && Number(fieldValue) < fieldDetails.maxSize)) {
                        response.message = 'Field ' + fieldDetails.label + ' must be with in this range (0 ,' + fieldDetails.maxSize + ') !';
                        response.isSuccess = false;
                    }
                    break;
                case 'string':
                    var length = fieldValue.length;
                    if(fieldValue!=null && length>=fieldDetails.maxSize){
                        response.message = 'Field '+ fieldDetails.label + ' must be less than ' + fieldDetails.maxSize + ' !';
                        response.isSuccess = false;
                    }
                    break;
                case 'email':
                    var length = fieldValue.length;
                    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if(fieldValue!=null && length>=fieldDetails.maxSize){
                        response.message = 'Field '+ fieldDetails.label + ' must be less than ' + fieldDetails.maxSize + ' !';
                        response.isSuccess = false;
                    }else if(!emailPattern.test(fieldValue)){
                        response.message = 'Field '+ fieldDetails.label + ' should be in this format xyz@abc.com';
                        response.isSuccess = false;
                    }
                    break;
                case 'password':
                    var length = fieldValue.length;
                    if(fieldValue==null || length>fieldDetails.maxSize || length<fieldDetails.minSize){
                        response.message = 'Field '+ fieldDetails.label + ' length must be in this range ( ' + fieldDetails.minSize +' , ' + fieldDetails.maxSize + ' ) !';
                        response.isSuccess = false;
                    }
                    break;
                default:
                    break;
            }
        }
        return response;
    },

    saveRecord: async function (modelId, formType,uri) {
        if (formType == 'edit') {
            clientUtils.methods.editRecord(modelId);
            return;
        }
        var fieldIdVSValue = {};
        var fields = clientUtils.data.models[modelId].fields;
        for (let fieldId in fields) {
            var formEle = $("#form_" + modelId);
            var fieldDetails = fields[fieldId];
            if (fieldDetails.clientDisplay) {
                var fieldEle = formEle.find("#field_" + modelId + "_" + fieldId)[0];
                var fieldValue = fieldEle.value;
                var validateRes = clientUtils.methods.validateFields(fieldDetails, fieldValue);
                if (!validateRes.isSuccess) {
                    clientUtils.methods.showAlertMessage(validateRes.message, 'error');
                    return;
                }
                fieldIdVSValue[fieldId] = fieldValue;
            }
        }
        var reqDetails = {
            "requestPayLoad": fieldIdVSValue,
            "method": 'POST',
            "uri": ((modelId==='usersLogin' || modelId==='usersSignup') && uri)?uri: clientUtils.data.app.id + '/' + modelId,
            "headers": {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        }
        var resultOfReq = await clientUtils.methods.makeCallToServer(reqDetails);
        if (resultOfReq.isSuccess && (modelId=='usersLogin' || modelId=='usersSignup')){

        }else if(resultOfReq.isSuccess) {
            clientUtils.methods.showAlertMessage("Record Creation Successfull", 'success');
            clientUtils.methods.getRecordsList(1, null, modelId);
            clientUtils.methods.closeForm(modelId);
        } else {
            clientUtils.methods.showAlertMessage(resultOfReq.response.error, 'error');
        }
    },
    editRecord: async function (modelId) {
        var formEle = $("#form_" + modelId);
        var fieldIdVSValue = {};
        var fields = clientUtils.data.models[modelId].fields;
        for (let fieldId in fields) {
            var fieldDetails = fields[fieldId];
            if (fieldDetails.clientDisplay) {
                var fieldEle = formEle.find("#field_" + modelId + "_" + fieldId)[0];
                var fieldValue = fieldEle.value;
                var validateRes = clientUtils.methods.validateFields(fieldDetails, fieldValue);
                if (!validateRes.isSuccess) {
                    clientUtils.methods.showAlertMessage(validateRes.message, 'error');
                    return;
                }
                fieldIdVSValue[fieldId] = fieldValue;
            }
        }
        var updatedFieldVsValue = {};
        var beforeUpdate = clientUtils.data.recordPreData;
        for (var fieldId in fieldIdVSValue) {
            if (fieldIdVSValue[fieldId] != beforeUpdate[fieldId]) {
                updatedFieldVsValue[fieldId] = fieldIdVSValue[fieldId];
            }
        }
        if (Object.keys(updatedFieldVsValue).length == 0) {
            clientUtils.methods.showAlertMessage("No changes found to update this record", 'error');
            return;
        }
        var priFieldId = clientUtils.data.models[modelId].primaryKey;
        var reqDetails = {
            "requestPayLoad": updatedFieldVsValue,
            "method": 'PUT',
            "uri": clientUtils.data.app.id + '/' + modelId + '/' + beforeUpdate[priFieldId],
            "headers": {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        }
        var resultOfReq = await clientUtils.methods.makeCallToServer(reqDetails);
        if (resultOfReq.isSuccess) {
            clientUtils.methods.showAlertMessage("Record Updated Successfull", 'success');
            clientUtils.methods.getRecordsList(1, null, modelId);
            clientUtils.methods.closeForm(modelId);
        } else {
            clientUtils.methods.showAlertMessage(resultOfReq.response.error, 'error');
        }
    },
    showAlertMessage: function (message, messageType) {
        var popUpEle = $("#notification-popup");

        popUpEle.removeClass().addClass(messageType);
        popUpEle.text(message);
        popUpEle.addClass('notification-popup');

        popUpEle.removeClass('fade-out'); 
        void popUpEle[0].offsetWidth; 
        popUpEle.addClass('fade-out'); 
    },

    makeCallToServer: async function (reqDetails) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: clientUtils.data.baseURL + clientUtils.data.company.companyId + '/' + reqDetails.uri,
                type: reqDetails.method,
                dataType: 'json',
                data: reqDetails.requestPayLoad == undefined ? null : reqDetails.requestPayLoad,
                headers: reqDetails.headers,
                success: function (response) {
                    if(response.redirect){
                        clientUtils.methods.showAlertMessage(response.message,'success')
                        setTimeout(() => {
                            window.location.href = response.redirect;
                        }, 1000); 
                    }
                    resolve({ "isSuccess": true, "response": response });
                },
                error: function (xhr) {
                    if (xhr.status == 200) {
                        resolve({ "isSuccess": true, "response": xhr.responseText });
                    } else {
                        if(xhr.responseJSON.redirect){
                            clientUtils.methods.showAlertMessage(xhr.responseJSON.message,'error')
                            setTimeout(() => {
                                window.location.href = xhr.responseJSON.redirect;
                            }, 1000); 
                        }
                        resolve({ "isSuccess": false, "response": xhr.responseJSON });
                    }
                }
            });
        });
    },

    updateFormData: function (modelId) {
        var modelDetails = clientUtils.data.models[modelId];
        var record = clientUtils.data.recordPreData;
        var fieldDetails = clientUtils.data.models[modelId].fields;
        var formEle = $("#app-container-" + modelDetails.appId);
        for (fieldId in record) {
            var fieldEle = formEle.find("#field_" + modelId + "_" + fieldId);
            if (fieldEle.length != 0) {
                if (fieldDetails[fieldId].type == 'date') {
                    record[fieldId] = clientUtils.methods.getDateToRender(record[fieldId]);
                }
                fieldEle.val(record[fieldId]);
            }
        }
    },

    getFormAndRender: async function (formType, modelId, recordId) {
        var uri = clientUtils.data.app.id + '/' + modelId + '/form' + formType;
        var reqDetails = {
            "method": 'GET',
            "uri": (formType == "create") ? uri : uri + "/" + recordId,
            "headers": null
        }
        var resultOfReq = await clientUtils.methods.makeCallToServer(reqDetails);
        if (resultOfReq.isSuccess) {
            clientUtils.methods.appendValueToEleById("#app-container-" + clientUtils.data.models[modelId].appId + " #form-container",resultOfReq.response);
            if (formType == 'edit') {
                clientUtils.methods.updateFormData(modelId);
            }
            clientUtils.methods.openForm(modelId);
        } else {
            clientUtils.methods.showAlertMessage(resultOfReq.response.error, 'error');
        }
    },
    closeForm: function (modelId) {
        var modelDetails = clientUtils.data.models[modelId];
        var appId = modelDetails.appId;
        $("#app-container-" + appId + " #form-container").removeClass('form-container');
        $("#app-container-" + appId + " #form-container").addClass('form-container-hidden');
    },
    openForm: function (modelId) {
        var modelDetails = clientUtils.data.models[modelId];
        var appId = modelDetails.appId;
        $("#app-container-" + appId + " #form-container").removeClass('form-container-hidden');
        $("#app-container-" + appId + " #form-container").addClass('form-container');
    },
    getRecordsList: async function (page, count, modelId) {
        if (count == null) {
            count = $("#section-" + modelId + " .section-1 #record-per-page select").val();
        }
        var reqDetails = {
            "requestPayLoad": {
                count: count,
                page: page
            },
            "method": 'GET',
            "uri": clientUtils.data.app.id + '/' + modelId + '/list',
            "headers": null
        }
        var resultOfReq = await clientUtils.methods.makeCallToServer(reqDetails);
        if (resultOfReq.isSuccess) {
            clientUtils.methods.appendValueToEleById("#app-container-" + clientUtils.data.models[modelId].appId + " #record-list-view",clientUtils.methods.renderListData(resultOfReq.response, modelId, page, count));
        } else {
            clientUtils.methods.showAlertMessage(resultOfReq.response.error, 'error');
        }
    },
    getDateToRender: function (date) {
        date = new Date(date);
        return date.toISOString().slice(0, 10);
    },
    renderListData: function (response, modelId, page, count) {
        var modelDetails = clientUtils.data.models[modelId];
        if(count==null){
            count = $("#app-container-"+modelDetails.appId + " #record-per-page select")[0].value;
        }
        var isNextNeeded = (response.totalRecordsCount <= page * count) ? false : true;
        var isPreviousNeeded = (page <= 1) ? false : true;
        var records = response.records;
        var appId = modelDetails.appId;
        clientUtils.methods.appendValueToEleById("#app-container-" + appId + " #total-records","Total records : "+response.totalRecordsCount);
        if (isPreviousNeeded) {
            clientUtils.methods.appendValueToEleById("#app-container-" + appId + " #before","<button onclick=\'clientUtils.methods.getRecordsList(" + (page - 1) + "," + count + ",\"" + modelId + "\")\'><</button>");
        } else {
            clientUtils.methods.appendValueToEleById("#app-container-" + appId + " #before","<button style=\"cursor:none\"><</button>");
        }
        clientUtils.methods.appendValueToEleById("#app-container-" + appId + " #current-page",page);
        if (isNextNeeded) {
            clientUtils.methods.appendValueToEleById("#app-container-" + appId + " #after","<button onclick=\'clientUtils.methods.getRecordsList(" + (page + 1) + "," + count + ",\"" + modelId + "\")\'>></button>");
        } else {
            clientUtils.methods.appendValueToEleById("#app-container-" + appId + " #after","<button style=\"cursor:none\">></button>");
        }
        var fieldDetails = modelDetails.fields;
        var displayOrder = modelDetails.displayOrder;
        var html = "<table>";
        html += "<thead><tr>";
        for (var i = 0; i < displayOrder.length; i++) {
            html += "<th>" + fieldDetails[displayOrder[i]].label + "</th>";
        }
        var primaryFieldId = modelDetails.primaryKey;
        html += "</tr></thead><tbody>";
        for (var i = 0; i < records.length; i++) {
            html += "<tr onclick=\'clientUtils.methods.getFormAndRender(\"edit\",\"" + modelId + "\"," + records[i][primaryFieldId] + ")\'>";
            for (var j = 0; j < displayOrder.length; j++) {
                if (fieldDetails[displayOrder[j]].type == 'date') {
                    records[i][displayOrder[j]] = clientUtils.methods.getDateToRender(records[i][displayOrder[j]]);
                } else if (fieldDetails[displayOrder[j]].type == 'dependencyField') {
                    records[i][displayOrder[j]] = modelDetails.preDefinedValues[displayOrder[j]][records[i][displayOrder[j]]].label;
                }
                html += "<td>" + records[i][displayOrder[j]] + "</td>";
            }
            html += "</tr>";
        }
        html += "</tbody></table>";
        return html;
    },

    deleteRecord: async function (modelId) {
        var record = clientUtils.data.recordPreData;
        var modelDetails = clientUtils.data.models[modelId];
        const confirmed = confirm('Are you sure you want to delete this  : ?' + JSON.stringify(record));
        if (confirmed) {
            var reqDetails = {
                "method": 'DELETE',
                "uri": clientUtils.data.app.id + '/' + modelId + '/' + record[modelDetails.primaryKey],
                "headers": null
            }
            var resultOfReq = await clientUtils.methods.makeCallToServer(reqDetails);
            if (resultOfReq.isSuccess) {
                clientUtils.methods.showAlertMessage("Record Deleted Successfully", 'success');
                clientUtils.methods.getRecordsList(1, null, modelId);
                clientUtils.methods.closeForm(modelId);
            } else {
                clientUtils.methods.showAlertMessage(resultOfReq.response.error, 'error');
            }
        }
    },

    getChartAndRender: async function (modelId) {
        var modelDetails = clientUtils.data.models[modelId];
        var reqDetails = {
            "method": 'GET',
            "uri": clientUtils.data.app.id + '/' + modelId + '/charts',
            "headers": null
        }
        var resultOfReq = await clientUtils.methods.makeCallToServer(reqDetails);
        if (resultOfReq.isSuccess) {
            clientUtils.methods.appendValueToEleById("#app-container-" + modelDetails.appId + " #chart-container",resultOfReq.response);

        } else {
            clientUtils.methods.showAlertMessage(resultOfReq.response.error, 'error');
        }
    },

    appendValueToEleById : function(elementId,value){
        $(elementId).html(value);
    }
}
