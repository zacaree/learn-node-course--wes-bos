const mongoose = require('mongoose');
const Review = mongoose.model('Review');
// const User = mongoose.model('User');
// const Store = mongoose.model('Store');

exports.addReview = async (req, res) => {
  // add author & store to the req.body object.
  req.body.author = req.user._id;
  req.body.store = req.params.id;
  // add req.body to Review on the DB, then save.
  const newReview = new Review(req.body);
  await newReview.save();
  req.flash('success', 'Review Saved!');
  res.redirect('back');
};