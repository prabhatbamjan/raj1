const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    batchName: { type: String, required: true },
    selectAnimal: { type: String, required: true },
    raisedFor: { type: String, required: true },
    startDate: { type: Date, required: true }
});

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;
