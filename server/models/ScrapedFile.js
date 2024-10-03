const mongoose = require('mongoose');

const ScrapedFileSchema = new mongoose.Schema({
    file_name: {
        type: String,
        required: true,
        unique: true
    },
    url: {
        type: String,
        required: true
    },
    scraped_content: {
        type: String,
        required: true
    }
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

const ScrapedFile = mongoose.model('ScrapedFile', ScrapedFileSchema);
module.exports = ScrapedFile;
