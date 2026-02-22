const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all activity logs
// @route   GET /api/admin/logs
// @access  Private/Admin
exports.getLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find().populate('userId', 'name email').sort('-timestamp');
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Block/Unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
exports.toggleBlockUser = async (req, res) => {
    try {
        // Basic implementation idea. A formal "isBlocked" field could be added to User model.
        res.status(200).json({ success: true, message: 'User block status updated (Placeholder)' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const File = require('../models/File');
const fs = require('fs');

// @desc    Delete multiple or single users and all their data
// @route   DELETE /api/admin/users
// @access  Private/Admin
exports.deleteUsers = async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of userIds' });
        }

        // Prevent admin from deleting themselves
        if (userIds.includes(req.user.id)) {
            return res.status(400).json({ message: 'You cannot delete your own admin account.' });
        }

        // Find all users
        const users = await User.find({ _id: { $in: userIds } });
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        for (const user of users) {
            // Find all files of this user
            const files = await File.find({ owner: user._id });
            for (const file of files) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                await file.deleteOne();
            }
            // Delete logs for this user
            await ActivityLog.deleteMany({ userId: user._id });
            // Finally delete the user
            await user.deleteOne();
        }

        res.status(200).json({ success: true, message: 'Users and all associated data deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get files by a specific user
// @route   GET /api/admin/users/:id/files
// @access  Private/Admin
exports.getUserFiles = async (req, res) => {
    try {
        const files = await File.find({ owner: req.params.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: files.length, data: files });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
