const express = require('express');
const { getUsers, getLogs, toggleBlockUser, deleteUsers, getUserFiles } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/users', getUsers);
router.delete('/users', deleteUsers); // Bulk delete
router.get('/users/:id/files', getUserFiles); // Get user files
router.get('/logs', getLogs);
router.put('/users/:id/block', toggleBlockUser);

module.exports = router;
