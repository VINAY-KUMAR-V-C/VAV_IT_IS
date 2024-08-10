fieldUtil = {};

//-------------------------------------------------------------------------------------------------------------
fieldUtil.methods = {
  validateAndgetValueForField: function (value, fieldDetails,modelDetails) {
    var res = {
      isSuccess: true
    }
    try {
      var dataType = fieldDetails.type;
      switch (dataType) {
        case 'number':
          value = Number(value);
          if (typeof value !== 'number' || isNaN(value)) {
            res.isSuccess = false;
            res.message = fieldDetails.label + ' Value is Incorrect';
            return res;
          }
          break;
        case 'date':
          if(value=='' || value==null){
            value = new Date();
          }
          value = new Date(value);
          if (isNaN(value.getTime())) {
            res.isSuccess = false;
            res.message = fieldDetails.label + ' value is Incorrect';
            return res;
          }
          value = Math.floor(value.getTime() / 1000);
          res.value = value;
          break;
        case 'string':
          value = value.trim();
          if(value.length>fieldDetails.maxSize){
            res.isSuccess = false;
            res.message = fieldDetails.label + ' field should be less than '+fieldDetails.maxSize;
            return res;
          }
          break;
        case 'password':
          value = value.trim();
          if(value.length>fieldDetails.maxSize || value.length<fieldDetails.minSize){
            res.isSuccess = false;
            res.message = fieldDetails.label + ' field length should be in this range( '+fieldDetails.minSize +' , '+fieldDetails.maxSize+' )';
            return res;
          }
          break;
        case 'dependencyField':
          var dependencyFieldId = modelDetails.preDefinedValues[fieldDetails.id][value];
          if (dependencyFieldId == null) {
            res.isSuccess = false;
            res.message = fieldDetails.label + ' value is incorrect';
            return res;
          }
          value = dependencyFieldId.id;
          break;
        case 'email':
          value = value.trim();
          if(value.length>fieldDetails.maxSize){
            res.isSuccess = false;
            res.message = fieldDetails.label + ' field should be less than '+fieldDetails.maxSize;
            return res;
          }
          var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if(!emailPattern.test(value)){
            res.isSuccess = false;
            res.message = fieldDetails.label + ' value is incorrect for email type';
            return res; 
          }
          break;
        default:
          break;
      }
    } catch (error) {
      res.error = error;
      res.isSuccess = false;
    }
    res.value = value;
    return res;
  }
}
//-------------------------------------------------------------------------------------------------------------
module.exports = fieldUtil;