const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        min: 4,
        max: 20,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        max: 254
    },
    password: {
        type: String,
        required: true,
        min: 1,
        max: 100
    },
    profile_pic: {
        type: String,
        default: "img/de.png"
    },
    profile_desc: {
        type: String,
        max: 50
    },
    subscribed_tags: [{
        type: mongoose.Schema.Types.ObjectId, ref:'Tag',
    }],
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId, ref:'Post'
    } ],
    downvotes: [{   
        type: mongoose.Schema.Types.ObjectId, ref:'Post'
     }]
})


accountSchema.virtual('voteCount').get(function() {
    return this.username.length
});

module.exports = mongoose.model('Account', accountSchema);