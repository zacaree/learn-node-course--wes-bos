const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: 'That filetype isn\'t allowed!' }, false);
    }
  }
};

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  // Check if there isn't a new file to resize
  if (!req.file) {
    next(); // Skip to the next middleware
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // Now we resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  // once we've written the photo to our filesystem, keep going!
  next();
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores: stores });
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it!');
  }
};

exports.editStore = async (req, res) => {
  // 1. Find the store based on the id in the slug
  const store = await Store.findOne({ _id: req.params.id });
  // 2. Confirm the user is the owner of the store
  confirmOwner(store, req.user);
  // 3. Render the edit form so the user can update their store
  res.render('editStore', { title: `Edit ${store.name}`, store: store });
};

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
};

exports.getStoreBySlug = async (req, res, next) => {
  // res.send('it works!');
  // res.json(req.params);
  const store = await Store.findOne({ slug: req.params.slug }).populate('author');
  if (!store) return next();
  res.render('store', { store: store, title: store.name })
  // res.json(store);
};

exports.getStoresByTag = async (req, res) => {
  // Grabs value of :tag variable from the URL
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  // Find all stores with a tag that matches the :tag variable in the URL / slug
  const storesPromise = Store.find({ tags: tagQuery });
  // Here we're destructuring the results of tagsPromise and storesPromise into the variables tags and stores.
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  // res.json(stores);
  res.render('tag', { tags, stores, tag, title: 'Tags' });
};

exports.searchStores = async (req, res) => {
  const stores = await Store
  // 1. Find stores that match
  .find({
    $text: {
      $search: req.query.q
    }
  }, {
    score: { $meta: 'textScore' }
  })
  // 2. Sort these stores
  .sort({
    score: { $meta: 'textScore' }
  })
  // 3. Limit to only 5 results
  .limit(5);
  res.json(stores);
};