const mongoose = require('mongoose');

// Define the history schema
const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  SuggestedDressColor: {
    type: String,
    required: true,
  },
  SuggestedHandbagColor: {
    type: String,
    required: true,
  },
  SuggestedWatchColor: {
    type: String,
    required: true,
  },
  SuggestedShoe: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the history model
const historymodel = mongoose.model('history', historySchema);
module.exports = historymodel;