const mongoose = require('mongoose');
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
  // res.json(req.body);
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores: stores });
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  res.render('editStore', { title: `Edit ${store.name}`, store: store });
}

exports.updateStore = async (req, res) => {
  // Set the location to be a point
  req.body.location.type = 'Point';
  // Find and update the store
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // Return the new store rather than the old one
    runValidators: true // Run schema validation
  }).exec();
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store →</a>`)
  res.redirect(`/stores/${store._id}/edit`);
}