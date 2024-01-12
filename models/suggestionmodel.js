const mongoose = require('mongoose');

const suggestedColorSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  SuggestedDressColor: { type: String, required: true },
  SuggestedHandbagColor: { type: String, required: true },
  SuggestedWatchColor: { type: String, required: true },
  SuggestedShoe: { type: String, required: true },
});

const suggestedColor = mongoose.model('SuggestedColor', suggestedColorSchema);

module.exports = suggestedColor;
