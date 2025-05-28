const express = require('express');
const router = express.Router();
const { getBatches, addBatch, updateBatch, deleteBatch } = require('../controllers/batchController');

router.get('/', getBatches);  // ✅ Matches /api/batch-records
router.post('/add', addBatch);  // ✅ Matches /api/batch-records/add
router.put('/:id', updateBatch);  // ✅ Matches /api/batch-records/:id
router.delete('/:id', deleteBatch);  // ✅ Matches /api/batch-records/:id

module.exports = router;
