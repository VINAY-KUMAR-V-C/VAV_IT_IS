contantsError = {
    "SES_EXP": {
        "name" : "Session expired ,Kindly login again",
        "sc" : 401
    },
    "DUP_USER": {
        "name" : "User with this email is already present, Try again with differnt Email Id",
        "sc" : 400
    },
    "REQ_FIELDS_NF": {
        "name" : "Mandatory fields not found",
        "sc" : 400
    },
    "REQ_FIELDS_EMP": {
        "name" : "Some mandatory fields are empty",
        "sc" : 400
    },
    "REQ_FIELDS_DT": {
        "name" : "Data type not correct for fields",
        "sc" : 400
    },
    "LOG_FAIL": {
        "name" : "User with this Email & password not present",
        "sc" : 401
    },
    "REQ_MET_NOT_PROP": {
        "name" : "Requested method is wrong",
        "sc" : 405
    },
    "INV_REQ_BODY": {
        "name" : "Invalid JSON syntax in request body",
        "sc" : 400
    },
    "NO_USER_FOUND": {
        "name" : "No user found with this Email & Password",
        "sc" : 404
    },
    "I_S_E": {
        "name" : "Internal server error",
        "sc" : 500
    },
    "REC_NOT_FOUND" :{
        "name" : "Record not found",
        "sc" : 404
    },
    "CATEGORY_NOT_FOUND" :{
        "name" : "Category Id not found",
        "sc" : 404
    },
    "INVALID_DATE_FORMAT" :{
        "name" : "Invalid date format",
        "sc" : 422
    }
}

contantsSuccess = {
    "Login_Success": {
        "name" : "Login Success",
    },
    "Signup_Success": {
        "name" : "Signup Success",
    },
    "Signout_Success": {
        "name" : "Session Expired , kindly login again",
    },
    "REC_DEL_SUC": {
        "name" : "Record deleted successfully",
    },
    "REC_UPD_SUC": {
        "name" : "Record updated successfully",
    },
    "REC_ADD_SUC": {
        "name" : "Record added successfully",
    },
    "REC_FETCHED_SUC": {
        "name" : "Record fetched success",
    }
}

icons_vs_element = {
    "download": {
      "name": "Download",
      "element": "<i class=\"fas fa-download\"></i>"
    },
    "next": {
      "name": "Next",
      "element": "<i class=\"fas fa-arrow-right\"></i>"
    },
    "previous": {
      "name": "Previous",
      "element": "<i class=\"fas fa-arrow-left\"></i>"
    },
    "report": {
      "name": "Report",
      "element": "<i class=\"fas fa-file-alt\"></i>"
    },
    "list": {
      "name": "List",
      "element": "<i class=\"fas fa-list\"></i>"
    },
    "refresh": {
      "name": "Refresh",
      "element": "<i class=\"fas fa-sync\"></i>"
    },
    "logout": {
      "name": "Logout",
      "element": "<i class=\"fas fa-sign-out-alt\"></i>"
    },
    "plus": {
      "name": "New Record",
      "element": "<i class=\"fas fa-plus\"></i>"
    },
    "editRecord": {
      "name": "Edit",
      "element": "<i class=\"fas fa-edit\"></i>"
    },
    "deleteRecord": {
      "name": "Delete",
      "element": "<i class=\"fas fa-trash-alt\"></i>"
    }
}

companyDetails = {
    'name':"VAV",
    'apiName':'VAV'
}

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS USERDETAILS (
    USERID SERIAL PRIMARY KEY,
    USERNAME VARCHAR(200) NOT NULL,
    USEREMAIL VARCHAR(200) NOT NULL,
    USERPASSWORD VARCHAR(20) NOT NULL
  );
`;