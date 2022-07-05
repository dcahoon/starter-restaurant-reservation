//const { PORT = 5000 } = process.env;
const PORT = process.env.PORT || 5000

const app = require("./app");
const knex = require("./db/connection");

knex.migrate
  .latest()
  .then((migrations) => {
    console.log("migrations", migrations);
    app.listen(PORT, listener);
  })
  .catch((error) => {
    console.error(error);
    knex.destroy();
  });

function listener() {
  console.log(`Listening on Port ${PORT}!`);
}


/* const express = require('express')
const cors = require('cors')

const app = express()
const router = express.Router()
const PORT = process.env.PORT || 5000

router.get('/', cors(), (req, res) => {
  res.json({ message: 'Hello Heroku!' });
})

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT} `);
})

module.exports = app */

module.exports = app