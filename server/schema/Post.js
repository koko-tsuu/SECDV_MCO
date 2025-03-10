const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
    username: {
        type:mongoose.Schema.Types.ObjectId, ref:'Account'
    },
    post_title: {
        type: String,
        required: true,
        min: 1,
        max: 50,
    },
    post_content: {
        type: String,
        required: true,
        min: 1,
    },
    post_attachment: {
        type: String,
        max: 1
    },
    post_edited: {
        type:Boolean,
        default: false
    },
    post_date: {
        type: Date
    },
    post_date_modified: {
        type: Date
    },
    upvotes:[{
        default: [],
        type: mongoose.Schema.Types.ObjectId, ref: 'Account'
    }],
    downvotes:[{
        default: [],
        type: mongoose.Schema.Types.ObjectId, ref:'Account'
    }],
    comments: [{
        default: [],
        type: mongoose.Schema.Types.ObjectId, ref:'Comment',
    }],
    tags: [{
        type: mongoose.Schema.Types.ObjectId, ref:'Tag',
    }]

})

module.exports = mongoose.model('Post', postSchema);