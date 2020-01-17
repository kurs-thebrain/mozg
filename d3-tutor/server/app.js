
const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('../schema/schema');
const cors = require('cors');

let app = express();
const PORT = 3005;

app.use(cors());

app.use('/graphql',graphqlHTTP({
    schema,
    graphiql: true,
}));

app.listen(PORT,err => {
    err? console.log(error) : console.log('Server startet at 3005');
})