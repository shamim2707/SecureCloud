const File = require('../models/File');
const ActivityLog = require('../models/ActivityLog');
const { encryptFile, decryptFile } = require('../utils/cryptoUtils');
const fs = require('fs');

// @desc    Upload & Encrypt a file
// @route   POST /api/files/upload
// @access  Private
exports.uploadFile = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Please upload at least one file' });
        }

        const uploadedFiles = [];

        // Process each file
        for (const file of req.files) {
            try {
                // Encrypt the uploaded file
                const encryptedFilePath = await encryptFile(file.path);

                // Save metadata to DB
                const fileRecord = await File.create({
                    originalName: file.originalname,
                    filename: `${file.filename}.enc`, // reflect encrypted status
                    path: encryptedFilePath,
                    mimetype: file.mimetype,
                    size: file.size,
                    owner: req.user.id
                });

                uploadedFiles.push(fileRecord);
            } catch (encryptionError) {
                // Cleanup current failing file
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                console.error('Encryption failed for file:', file.originalname, encryptionError);
                // Continue with other files rather than breaking the whole upload
            }
        }

        // Log Activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'File Upload',
            ipAddress: req.ip
        });

        res.status(201).json({
            success: true,
            data: uploadedFiles,
            message: `${uploadedFiles.length} file(s) encrypted and uploaded successfully.`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during upload process' });
    }
};

// @desc    Get user's files
// @route   GET /api/files/myfiles
// @access  Private
exports.getMyFiles = async (req, res) => {
    try {
        const files = await File.find({ owner: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, data: files });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching files' });
    }
};

// @desc    Download & Decrypt a file
// @route   GET /api/files/:id/download
// @access  Private
exports.downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check ownership
        if (file.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to access this file' });
        }

        // Decrypt file temporarily
        const decryptedFilePath = await decryptFile(file.path, file.originalName);

        // Send the file
        res.download(decryptedFilePath, file.originalName, async (err) => {
            if (err) {
                console.error('Error downloading file:', err);
            }
            // Cleanup decrypted file after sending
            if (fs.existsSync(decryptedFilePath)) {
                fs.unlinkSync(decryptedFilePath);
            }
        });

        // Log Activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'File Download',
            ipAddress: req.ip
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during download' });
    }
};

// @desc    Rename a file
// @route   PUT /api/files/:id/rename
// @access  Private
exports.renameFile = async (req, res) => {
    try {
        const { newName } = req.body;
        if (!newName) {
            return res.status(400).json({ message: 'New name is required' });
        }

        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check ownership
        if (file.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to rename this file' });
        }

        file.originalName = newName;
        await file.save();

        // Log Activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'File Renamed',
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, data: file });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during rename' });
    }
};

// @desc    Delete a file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check ownership
        if (file.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this file' });
        }

        // Remove encrypted file from filesystem
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        await file.deleteOne();

        // Log Activity
        await ActivityLog.create({
            userId: req.user.id,
            action: 'File Deleted',
            ipAddress: req.ip
        });

        res.status(200).json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during deletion' });
    }
};
