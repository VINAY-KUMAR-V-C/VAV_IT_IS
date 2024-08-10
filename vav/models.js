var models = {};
models = {
    usersSignup : {
        label: "User",
        tableName: "USERDETAILS",
        id: "usersSignup",
        primaryKey: "userId",
        fields: {
            "userId": {
                label: "User Id",
                columnName: "USERID",
                type: "number",
                clientDisplay: false,
                id: "userId",
            },
            "userName": {
                label: "User Name",
                columnName: "USERNAME",
                clientDisplay: true,
                type: "string",
                id: "userName",
                isMandatory: true,
                maxSize: 200,
            },
            "userEmail": {
                label: "Email",
                columnName: "USEREMAIL",
                type: "email",
                clientDisplay: true,
                maxSize: 200,
                isMandatory: true,
                id: "userEmail"
            },
            "userPassword": {
                label: "Password",
                columnName: "USERPASSWORD",
                type: "password",
                clientDisplay: true,
                id: "userPassword",
                isMandatory: true,
                maxSize: 20,
                minSize:8
            },
        }
    },
    usersLogin : {
        label: "User",
        tableName: "USERDETAILS",
        id: "usersLogin",
        primaryKey: "userId",
        fields: {
            "userId": {
                label: "User Id",
                columnName: "USERID",
                type: "number",
                clientDisplay: false,
                id: "userId",
            },
            "userEmail": {
                label: "Email",
                columnName: "USEREMAIL",
                type: "email",
                clientDisplay: true,
                maxSize: 200,
                isMandatory: true,
                id: "userEmail"
            },
            "userPassword": {
                label: "Password",
                columnName: "USERPASSWORD",
                type: "password",
                clientDisplay: true,
                id: "userPassword",
                isMandatory: true,
                maxSize: 20,
                minSize:8
            },
        }
    }
}
module.exports = models;