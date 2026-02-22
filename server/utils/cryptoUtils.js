const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Basic AES Encryption configuration
const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.JWT_SECRET || 'secret_key', 'salt', 32);

exports.encryptFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        const input = fs.createReadStream(filePath);
        const encryptedFilePath = filePath + '.enc';
        const output = fs.createWriteStream(encryptedFilePath);

        // Store IV at the beginning of the file
        output.write(iv);

        input.pipe(cipher).pipe(output);

        output.on('finish', () => {
            // Option: delete original unencrypted file after encryption
            fs.unlinkSync(filePath);
            resolve(encryptedFilePath);
        });

        output.on('error', (err) => {
            reject(err);
        });
    });
};

exports.decryptFile = (encryptedFilePath, originalName) => {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(encryptedFilePath);

        // Read the first 16 bytes to get the IV
        readStream.once('readable', () => {
            const iv = readStream.read(16);

            if (!iv) {
                return reject(new Error('Could not read IV from file'));
            }

            const decipher = crypto.createDecipheriv(algorithm, key, iv);

            const decryptedFilePath = path.join(path.dirname(encryptedFilePath), `decrypted_${originalName}`);
            const output = fs.createWriteStream(decryptedFilePath);

            readStream.pipe(decipher).pipe(output);

            output.on('finish', () => {
                resolve(decryptedFilePath);
            });

            output.on('error', (err) => {
                reject(err);
            });
        });
    });
};
