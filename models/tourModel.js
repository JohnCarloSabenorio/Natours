const mongoose = require('mongoose');
const slugify = require('slugify');
const tourSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: {
      type: String
    },
    rating: { type: Number, default: 4.5 },
    price: { type: Number, required: true },
    duration: {
      type: Number,
      required: [true, 'Duration of the tour is required!']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Max group size of the tour is required!']
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty of the tour is required!']
    },
    ratingsAverage: {
      type: Number
    },
    ratingsQuantity: {
      type: Number,
      default: 4.5
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'Summary of the tour is required!']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'And image cover of the tour is required!']
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE. It runs before .save() and .create()

// PRE-SAVE HOOKS/MIDDLEWARE
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre("save", function(next){
//   console.log("Saving document...");
//   next();
// });

// POST-SAVE HOOKS/MIDDLEWARE
// tourSchema.post("save", function(doc, next){
//   console.log("Document is saved: ", doc)
//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Find query took ${Date.now() - this.start} milliseconds to complete!`);
  console.log("Documents Found: ", docs);
  next();
});

let Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
