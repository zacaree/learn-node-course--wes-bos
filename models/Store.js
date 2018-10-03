const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number, 
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Define our indexes
storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({
  location: '2dsphere'
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // (short circuit) stop this function from running
  }
  this.slug = slug(this.name);
  // find other stores that have a slug of zac, zac-1, zac-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  // if storesWithSlug exists (is truthy)
  if (storesWithSlug.length) {
    // increment the number at the end of the new one by one
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`
  }
  // next() will continue on to the actual saving of our store to the database.
  next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

// This will return a promise which is why the function calling it in storeController.js is set to await
storeSchema.statics.getTopStores = function() {
  // aggregate is a query function. It's much like .find
  return this.aggregate([
    // Lookup stores and populate their reviews
    // This takes our stores document and our reviews document and merges them together
    { $lookup: { 
      from: 'reviews', 
      localField: '_id', 
      foreignField: 'store', 
      as: 'reviews' 
    }},
    // Filter keeping only stores that have two or more reviews
    // 0 is the first, 1 is the second. So where a second review exists...
    { $match: { 'reviews.1': { $exists: true } } },
    // Find the average of all reviews on a store
    { $project: {
      photo: '$$ROOT.photo',
      name: '$$ROOT.name',
      slug: '$$ROOT.slug',
      reviews: '$$ROOT.reviews',
      averageRating: { $avg: '$reviews.rating' }
    }},
    // Sort list of stores by their average rating, highest first
    { $sort: { averageRating: -1 } },
    // Limit the list to a max of 10 stores
    { $limit: 10 }
  ]);
};

// This creates a virtual relationship between Store and Review on the DB.
// Essentially saying, find reviews where the store's _id property === the review's store property
storeSchema.virtual('reviews', {
  ref: 'Review', // What model to link?
  localField: '_id', // Which field on the store?
  foreignField: 'store' // Which field on the review?
});

module.exports = mongoose.model('Store', storeSchema);

