const mongoose = require("mongoose");
const tagSchema = new mongoose.Schema({
    tag_name: {
        type: String,
        required: true
    },
    photo:{
        type: String,
        default: 'img/default_tag.jpg'
    }

})

module.exports = mongoose.model('Tag', tagSchema);