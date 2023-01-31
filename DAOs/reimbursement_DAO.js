const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-west-2'
});
const docClient = new AWS.DynamoDB.DocumentClient();

async function addReimbursement(user_email, amount, description) {
    const params = {
        TableName: 'reimbursements',
        Item: {
            reimbursement_id: String(Date.now()),
            user_email,
            amount,
            description,
            status: "pending"
        }
    }

    return await docClient.put(params).promise();
}

async function getAllReimbursements() {
    params = {
        TableName: 'reimbursements'
    }
    let data = await docClient.scan(params).promise();
    let dataItems = data.Items;
    return dataItems;
}


async function getUnprocessedReimbursements() {
    let reimbursementList = await getAllReimbursements();
    let pendingReimbursements = []
    for (let item of reimbursementList) {
        if (item.status === "pending") {
            pendingReimbursements.push(item)
        } else {
            continue;
        }
    }

    return pendingReimbursements;
}


async function processReimbursement(newStatus, id) {
    const params = {
        TableName: 'reimbursements',
        UpdateExpression: "set #s = :s",
        ExpressionAttributeNames: {
            "#s": "status"
        },
        ExpressionAttributeValues: {
            ":s": newStatus
        },
        Key: {
            reimbursement_id: id
        }
    }

    return docClient.update(params).promise();
}

async function getReimbursementByID(reimbursement_id) {
    const params = {
        TableName: 'reimbursements',
        Key: {
            reimbursement_id
        }
    }

    return await docClient.get(params).promise();
}


async function getReimbursementsByEmail(user_email) {
    let reimbursementList = await getAllReimbursements();
    let reimbursementByEmail = []
    for (let item of reimbursementList) {
        if (item.user_email === user_email) {
            reimbursementByEmail.push(item);
        }
    }
    return reimbursementByEmail;
}

async function getPendingReimbursements() {
    let reimbursementList = await getAllReimbursements();
    let pendingReimbursements = []
    for (let item of reimbursementList) {
        if (item.status === "pending") {
            pendingReimbursements.push(item);
        }
    }
    return pendingReimbursements;
}


module.exports = {
    addReimbursement,
    getAllReimbursements,
    processReimbursement,
    getUnprocessedReimbursements,
    getReimbursementByID,
    getReimbursementsByEmail,
    getPendingReimbursements
}