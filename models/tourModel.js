const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [
        40,
        'The tour name must have less or equal than 40 characters.'
      ],
      minlength: [
        5,
        'the tour name must have more or equal than 5 characters.'
      ],
      validate: [
        validator.isAlpha,
        'The tour name must only contain characters from the alphabet!'
      ]
    },
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
      default: 'Average',
      required: [true, 'Difficulty of the tour is required!'],
      enum: {
        values: ['Easy', 'Average', 'Difficult'],
        message: 'Difficulty must be set to: Easy, Average, or Difficult.'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 1.0,
      min: [1, 'Average rating must be 1 or above.'],
      max: [5, 'Average rating must be below 5']
    },
    ratingsQuantity: {
      type: Number,
      default: 4.5
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return this.price > val; // This only points to the document on NEW document creation; it will not work on updating
        },
        message:
          'The discounted price ({VALUE}) must be less than the original price!'
      }
    },
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
  console.log(
    `Find query took ${Date.now() - this.start} milliseconds to complete!`
  );
  console.log('Documents Found: ', docs);
  next();
});

// AGGREGATE MIDDLEWARE

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

let Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
