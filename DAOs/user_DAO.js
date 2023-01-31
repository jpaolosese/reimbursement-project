const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-west-2'
});
const docClient = new AWS.DynamoDB.DocumentClient();

function addUser(email, password, role = "employee") {
    const params = {
        TableName: 'reimbursement_users',
        Item: {
            email,
            password,
            role
        }
    }
    return docClient.put(params).promise();
}

function retrieveUserByEmail(email) {
    const params = {
        TableName: 'reimbursement_users',
        Key: {
            "email": email
        }
    }
    return docClient.get(params).promise();
}

module.exports = {
    addUser,
    retrieveUserByEmail
}