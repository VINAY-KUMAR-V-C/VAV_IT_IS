var models = {};
models = {
    expense : {
        label: "Expense",
        tableName: "EXPENSE",
        id: "expense",
        primaryKey: "expId",
        appId : "expenseTracker",
        displayOrder: ["category", "amount", "date", "additionalDetails"],
        charts: {
            "categoryIdVsAmount": {
                id: "categoryIdVsAmount",
                label: "Category VS Amount",
                groupByField: "category",
                sumOfField: "amount"
            }
        },
        fields: {
            "expId": {
                label: "Exp Id",
                columnName: "EXPID",
                type: "number",
                clientDisplay: false,
                id: "expId",
            },
            "category": {
                label: "Category",
                columnName: "EXPCATEGORYID",
                clientDisplay: true,
                type: "dependencyField",
                id: "category",
                isMandatory: true,
            },
            "amount": {
                label: "Amount",
                columnName: "EXPAMOUNT",
                type: "number",
                clientDisplay: true,
                maxSize: 10000000,
                isMandatory: true,
                id: "amount"
            },
            "date": {
                label: "Date",
                columnName: "EXPDATE",
                type: "date",
                clientDisplay: true,
                isMandatory: false,
                id: "date"
            },
            "additionalDetails": {
                label: "Additional Details",
                columnName: "EXPADDITIONALDETAILS",
                type: "string",
                clientDisplay: true,
                id: "additionalDetails",
                isMandatory: false,
                maxSize: 500,
            },
            "userId": {
                label: "User Id",
                columnName: "USERID",
                type: "number",
                clientDisplay: false,
                id: "userId",
            }
        },
        preDefinedValues: {
            "category": {
                "medical": {
                    label: "Medical",
                    id: "medical"
                },
                "family": {
                    label: "Family",
                    id: "family"
                },
                "rent": {
                    label: "Rent",
                    id: "rent"
                },
                "travel": {
                    label: "Travel",
                    id: "travel"
                },
                "food": {
                    label: "Food",
                    id: "food"
                },
                "others": {
                    label: "Others",
                    id: "others"
                }
            }
        }
    }
}
module.exports = models;