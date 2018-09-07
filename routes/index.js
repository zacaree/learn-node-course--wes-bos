const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  console.log('hey!!!!🔥 Yo');
  // res.send('Hey! It works!');
  // const zac = { name: 'Zac', age: 31, cool: true };
  // res.json(zac);
  // res.send(req.query.name);
  res.send(req.query);
});

module.exports = router;
