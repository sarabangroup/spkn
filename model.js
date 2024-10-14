var mongoose = require('mongoose');

var imgSchema = new mongoose.Schema({
    name: String,
    age: Number,
    salary: Number,
    gender: String,
    profession: String,
    jadagam: String,
    img: {
        data: Buffer,
        contentType: String
    }
});

module.exports = mongoose.model('Image', imgSchema);
