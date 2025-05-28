const mongoose = require('mongoose');

const PestPesticideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  details: { type: String, required: true },
  control: { type: String, required: true },
  type: { type: String, required: true },
  // image: { type: String }, // Store file path
});

module.exports = mongoose.model('PestPesticideModel', PestPesticideSchema);
