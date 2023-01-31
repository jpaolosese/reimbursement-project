const express = require('express');
const router = express.Router();
const user_DAO = require('../DAOs/user_DAO');
const reimbursement_DAO = require('../DAOs/reimbursement_DAO');
const jwt_util = require('../jwt_util');
const e = require('express');


// submit reimbursement
// only employees
router.post('/reimbursements', async (req, res) => {
    try {

        const header = req.headers.authorization;
        const token = header.split(' ')[1];
        const tokenPayload = await jwt_util.verifyTokenAndReturnPayload(token);

        // managers are not authorized to submit reimbursements
        if (tokenPayload.role === "manager") {
            res.statusCode = 400;
            res.send({
                "message": "You are not authorized to submit a reimbursement!"
            })
        } else {

            // ensure that employee includes amount and description
            if (req.body.amount && req.body.description) { 
                await reimbursement_DAO.addReimbursement(tokenPayload.email, req.body.amount, req.body.description);
                res.statusCode = 201;
                res.send({
                    "message": `${tokenPayload.email} successfully submitted ticket for $${req.body.amount}. Reason: ${req.body.description}`
                })
            } else {
                res.statusCode = 400;
                res.send({
                    "message": "You must include an amount and description!"
                })
            }

        }
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            res.statusCode = 400;
            res.send({
                "message": "Invalid JWT"
            });
        } else if (err.name === "TypeError") {
            res.statusCode = 400;
            res.send({
                "message": "No auth header provided"
            })
        } else {
            res.statusCode = 400;
            res.send({
                "message": err
            })
        }
    }
})

router.patch('/reimbursements/:reimbursement_id', async (req, res) => {
    try {
        const header = req.headers.authorization;
        const token = header.split(' ')[1];
        const tokenPayload = await jwt_util.verifyTokenAndReturnPayload(token);

        const newStatus = req.body.status;
        const id = req.params.reimbursement_id;

        const data = await reimbursement_DAO.getReimbursementByID(req.params.reimbursement_id);
        const dataItem = data.Item;

        if (tokenPayload.role === "manager") {

            if (dataItem.status === "pending") {
                await reimbursement_DAO.processReimbursement(newStatus, id);
                res.statusCode = 200;
                res.send({
                    "message": "Successfully processed reimbursement!"
                })
            } else {
                res.statusCode = 400;
                res.send({
                    "message": "Cannot process reimbursement that has already been processed!"
                })
            }

        } else {
            res.statusCode = 400;
            res.send({
                "message": "You are not authorized to process reimbursements!"
            })

        }
    } catch (err) {

        res.statusCode = 400;
        res.send({
            "message": err
        })

    }
}
)

router.get('/reimbursements', async (req, res) => {
    try {
        const header = req.headers.authorization;
        const token = header.split(' ')[1];
        const tokenPayload = await jwt_util.verifyTokenAndReturnPayload(token);

        if (tokenPayload.role === "manager") {
            let data = await reimbursement_DAO.getUnprocessedReimbursements();
            res.send({
                "message": data
            })
        } else if (tokenPayload.email) {
            let data = await reimbursement_DAO.getReimbursementsByEmail(tokenPayload.email);
            res.send({
                "message": data
            })
        } else {
            let data = await reimbursement_DAO.getAllReimbursements();
            res.send({
                "message": data
            })
        }
    } catch (err) {
        res.statusCode = 500;
        res.send({
            "message": err
        })
    }
})


module.exports = router;