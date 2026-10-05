const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true
    },
    ISBN: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      trim: true
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [1, 'Total copies must be at least 1']
    },
    availableCopies: {
      type: Number,
      required: [true, 'Available copies is required'],
      min: [0, 'Available copies cannot be negative'],
      validate: {
        validator: function (value) {
          // In save or update operations where totalCopies is available
          if (this.totalCopies !== undefined) {
            return value <= this.totalCopies;
          }
          return true;
        },
        message: 'Available copies cannot exceed total copies'
      }
    }
  },
  {
    timestamps: true
  }
);

// Helpful index on genre for fast filtering
bookSchema.index({ genre: 1 });
bookSchema.index({ title: 'text' });

module.exports = mongoose.model('Book', bookSchema);
