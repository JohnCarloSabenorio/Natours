const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
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
    type: Number,
    required: [true, 'The average rating of the tour is required!']
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
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date]
});

module.exports = mongoose.model('Tour', tourSchema);
