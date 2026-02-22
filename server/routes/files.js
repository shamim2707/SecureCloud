const express = require('express');
const { uploadFile, downloadFile, getMyFiles, renameFile, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/myfiles', protect, getMyFiles);
router.post('/upload', protect, upload.array('files', 10), uploadFile); // Allow up to 10 files at once
router.get('/:id/download', protect, downloadFile);
router.put('/:id/rename', protect, renameFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;
