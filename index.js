// Foundations Project

const express = require('express');
const bodyParser = require('body-parser');
const PORT = 3000;
const server = express();
const userRoute = require('./routes/user_routes');
const reimbursementRoute = require('./routes/reimbursement_routes');

server.use(bodyParser.json());
server.use(userRoute);
server.use(reimbursementRoute);

server.listen(PORT, () => {
    console.log(`Server activated listening on port ${PORT}`)
});

server.get('/', (req, res) => {
    res.send(`Server activated listening on port ${PORT}`);
});

