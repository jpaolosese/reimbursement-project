const express = require('express');
const router = express.Router();
const user_DAO = require('../DAOs/user_DAO')
const jwt_util = require('../jwt_util')

router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await user_DAO.retrieveUserByEmail(email);
    const userItem = user.Item;

    try {
        if (userItem) { // check if user exists
            if (userItem.password === password) { // check if password is the same
                res.send({
                    "message": "Successfully logged in!",
                    "token": jwt_util.createJWT(userItem.email, userItem.role)
                })
            } else { // wrong password
                res.statusCode = 400;
                res.send({
                    "message": "Invalid password!"
                })
            }
        } else { // if user does not exist
            res.statusCode = 400;
            res.send({
                "message": "Invalid email!"
            })
        }
    } catch (err) {
        res.statusCode = 400;
        res.send({
            "message": err
        })
    }
})

router.post('/register', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await user_DAO.retrieveUserByEmail(email);
        const userItem = user.Item;

        if (userItem) {     // if user already exists
            res.send({
                "message": "User already exists with that email!"
            })
        } else {
            await user_DAO.addUser(email, password, req.body.role);
            res.send({
                "message": "Successfully registered user!"
            })
        }
    } catch (err) {
        res.statusCode = 400;
        res.send({
            "message": err
        })
    }
})


module.exports = router;