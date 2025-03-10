const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema({
    // user connected to Account
    username: {
        type: mongoose.Schema.Types.ObjectId, ref:'Account'
    },
    post_commented: {
        type: mongoose.Schema.Types.ObjectId, ref:'Post'
    },
    comment_content: {
        type: String,
        required: true,
        min: 1,
    },
    comment_date: {
        type: Date
    },
    is_edited: {
        type: Boolean,
        default: false
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId, ref:'Comment',
    }],
    parent_comment_id: {
        type: mongoose.Schema.Types.ObjectId, ref:'Comment',
    },
    votes: {
        type: Number,
        default: 0
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId, ref:'Account'
    }],
    downvotes:[{
        type: mongoose.Schema.Types.ObjectId, ref:'Account'
    }]
})

commentSchema.virtual('up').get(function() {
  return this.username;
})

function populateAll(next){
     this.populate('replies');
     this.populate('username');
     this.populate('upvotes');
     this.populate('downvotes')
     next();
}

commentSchema.pre('find', populateAll);
module.exports = mongoose.model('Comment', commentSchema);