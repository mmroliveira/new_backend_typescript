const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

module.exports = {
    dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    storage: multer.diskStorage({
        destination: (request, file, cb) => {
            const category_name = request.query['category_name'];

            cb(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads', category_name));
        },

        filename: (request, file, cb) => {
            crypto.randomBytes(4, (err, hash) => {
                if(err) cb(err);
                
                let string = file.mimetype;
                string = string.split('/')
                
                const fileName = `${hash.toString('hex')}.${string[1]}`;

                cb(null, fileName);
            });
        },
    }),

    limits: {
        fileSize: 2 * 1024 * 1024
    },
    
    fileFilter: (request, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
        ];

        if(allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type.'));
        }
    }
};