const express = require ("express");
const handlebars = require('handlebars');
const mongoose = require('mongoose');
const Post = require('../server/schema/Post');
const Tag = require('../server/schema/Tag');
const Comment = require('../server/schema/Comment');
const Account = require('../server/schema/Account');
const router = express.Router();

const multer  = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img/'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

handlebars.registerHelper('ifCond', function(v1, v2, options) {
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

handlebars.registerHelper('checkUserOwner', function (username, sessionUsername, options) {
    return username === sessionUsername ? options.fn(this) : options.inverse(this);
  });

handlebars.registerHelper('thereExists', function(postId, postParentId, options){
    
    if (postId.equals(postParentId))
        return options.fn(this);

});

handlebars.registerHelper('checkUp', function(upArray, user, options){
    var len = upArray.length;
    

    for (var i = 0; i < len; i++) {
        var getName = upArray[i].username;
        console.log(getName === user);
          if (getName === user) {
            return options.fn(this);
        }

    }
    return options.inverse(this)
});

handlebars.registerHelper('checkDown', function(downArray, user, options){
    var len = downArray.length;

  for (var i = 0; i < len; i++) {
    var getName = downArray[i].username;
  
      if (getName == user) {
          return options.fn(this);
      }
      console.log(user);

  }
    return options.inverse(this)
});

handlebars.registerHelper('log', function(something){
    console.log(something);
})



router.get('/', async (req, res) =>{

    if(req.session.username) {
        //logged in
         
        const user = await Account.findOne({ "username" : req.session.username });

        // start for side-container content
        const tagCounts = await Post.aggregate([
            {
              $unwind: '$tags' 
            },
            {
              $group: {
                _id: '$tags', 
                count: { $sum: 1 } 
              }
            }
          ]).sort({count: 'desc'}).limit(6);
   
          
          const getPopularTags = [];
   
        for (var i = 0; i < tagCounts.length; i++){
            var newTag = await Tag.findById(tagCounts[i]._id).lean();
            var tag = ({
                tag_name: newTag.tag_name,
                tag_id: newTag._id,
                count: tagCounts[i].count
            });
           getPopularTags.push(tag);
   
        }

        const subscribedTags = user.subscribed_tags;
        const listofTags = await Tag.find({ _id: { $in: subscribedTags } }).lean();

        const latest_posts = await Post.find().populate('username').sort({post_date:'desc'}).limit(5).lean();
   
       res.render("create-post", {
           header: "Create a new post",
           title: "Create a new post",
           script: "js/post.js",
           post_username: req.session.username,
           post_date: new Date(),
           posts_latest: latest_posts,
           popular_tags: getPopularTags,
           sub_tags: listofTags,
           button_type: "create-post-btn",
           navbar: 'logged-navbar',
           session_user: req.session.username
       });

    } else {
        //not logged in

        res.redirect('/home');
    }

});


// add viewing of page for a specific post
router.get('/edit-:id', async (req, res) =>{

    if(req.session.username) {
        const getId = req.params.id;

        const user = await Account.findOne({ "username" : req.session.username });

        const getPost = await Post.findOne({_id: getId});

        if(user._id.toString() == getPost.username.toString()) {
            const getUser = await Account.findOne({_id: getPost.username});
            const getTags = await Tag.find({ _id: { $in: getPost.tags } }).lean();
            let post_attachment = "";
        
            if(getPost.post_attachment) {
                post_attachment = getPost.post_attachment.replace("img/", "");
            }
        
            // start for side-container content
        
            const latest_posts = await Post.find().populate('username').sort({post_date:'desc'}).limit(5).lean();
        
            const tagCounts = await Post.aggregate([
                {
                  $unwind: '$tags' 
                },
                {
                  $group: {
                    _id: '$tags', 
                    count: { $sum: 1 } 
                  }
                }
              ]).sort({count: 'desc'}).limit(6);
                
              const subscribedTags = user.subscribed_tags;
              const listofTags = await Tag.find({ _id: { $in: subscribedTags } }).lean();
        
              const getPopularTags = [];
        
            for (var i = 0; i < tagCounts.length; i++){
                var newTag = await Tag.findById(tagCounts[i]._id).lean();
                var tag = ({
                    tag_name: newTag.tag_name,
                    tag_id: newTag._id,
                    count: tagCounts[i].count
                });
               getPopularTags.push(tag);
        
            }
         
            try{
                res.render("create-post", {
                    title: "Edit post",
                    header: "Edit post",
                    script: "js/post.js",
                    post_title: getPost.post_title,
                    post_content:  getPost.post_content,
                    post_date:  getPost.post_date,
                    post_username: getUser.username,
                    post_attachment: post_attachment,
                    tags: getTags,
                    posts_latest: latest_posts,
                    sub_tags: listofTags,
                    popular_tags: getPopularTags,
                    id: getId,
                    button_type: "edit-post-btn",
                    navbar: 'logged-navbar',
                    session_user: req.session.username
                });
            } catch(error){
                console.log(error);
            }
        } else {
            //not allowed
            res.redirect('/home');
    } 
    } else {
            //not allowed
            res.redirect('/home');
    }
   
});


//delete post
router.delete('/edit-:id', async (req, res) =>{
    const postId = req.params.id;

    try {
        const getPost = await Post.findOne({_id: postId});
        const getTags = await Tag.find({ _id: { $in: getPost.tags } }).lean();

        for (const originalTag of getTags) {
                const postCountWithCurrentTag = await Post.countDocuments({ tags: originalTag._id });
                if (postCountWithCurrentTag === 0) {
                    //delete the tag
                    await Tag.findByIdAndDelete({ _id: originalTag._id });
                  }
        }

        const result = await Post.findByIdAndDelete(postId);

        if (result) {
          res.status(200).json({ message: 'Successfully deleted.' });
        } else {
          res.status(404).json({ message: 'Document not found.' });
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Internal server error.' });
      }
});

//delete comment
router.delete('/:id', async (req, res) => {
    const postId = req.params.id;
    try {

        const result = await Comment.findByIdAndDelete(postId);

        if (result) {
          res.status(200).json({ message: 'Successfully deleted.' });
        } else {
          res.status(404).json({ message: 'Document not found.' });
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Internal server error.' });
      }
});

//comment
router.post('/comment', async (req, res) => {

    if(req.session.username) {
        //logged in
        try {

            const {comment_textarea, id} = req.body;
            
            if(comment_textarea != "") {
    
            const user = await Account.findOne({ "username" : req.session.username });

            const comment_date = new Date();
        
            //add comment in collection
                const newComment = new Comment({
                    username: user._id,
                    post_commented: id,
                    comment_content: comment_textarea,
                    comment_date: comment_date
                });
    
                // Save the new comment to the database
                const savedComment = await newComment.save();
                
                console.log('New Comment created:', savedComment._id);
                console.log('New Comment created:', savedComment);
    
                //update post
                const updatedPost = await Post.findOneAndUpdate(
                    { _id: id },
                    { $push: { comments: savedComment._id } });
    
                console.log('Saved', updatedPost);
    
                return res.json({ message: 'Successfully commented!'});
            }
    
        } catch(error) {
            console.error('Error creating comment:', error);
            return res.status(500).send('Error creating comment.');
        }
    } 



});
router.post('/up_comment/', async(req, res)=>{

    if(req.session.username) {
        //logged in

        const user = await Account.findOne({ "username" : req.session.username });

        try{
        
            var getId = req.body.comment_id;
            console.log("comment id: " + getId);
    
            var isUpvoted = await Comment.findOne({_id: getId, username: user._id,
            upvotes: new mongoose.Types.ObjectId(user._id)
             });
            var isDownvoted =  await Comment.findOne({_id: getId, username: user._id,
            downvotes: new mongoose.Types.ObjectId(user._id)
            });
        console.log(isUpvoted);
        console.log(isDownvoted)
        
        if (!isUpvoted && !isDownvoted){
            await Comment.findByIdAndUpdate(getId, 
               { $inc: { 
                    votes: 1 
                },
                $push: {
                    upvotes: new mongoose.Types.ObjectId(user._id)
                }
            });
            return res.json({message:"User downvoted successfully"});
        }
        else if (isUpvoted){
            await Comment.findByIdAndUpdate(getId, 
                { $inc: { 
                     votes: -1
                 },
                 $pull: {
                     upvotes: new mongoose.Types.ObjectId(user._id)
                 }
             });
            return res.json({message:"User already downvoted, removing downvote"});
        }
        else if(isDownvoted){
                await Comment.findByIdAndUpdate(getId, 
                    { $inc: { 
                         votes: 1
                     },
                     $push: {
                         upvotes: new mongoose.Types.ObjectId(user._id)
                     }
                 });
                await Comment.findByIdAndUpdate(getId, 
                    { $inc: { 
                         votes: 1
                     },
                     $pull: {
                         downvotes: new mongoose.Types.ObjectId(user._id)
                     }
                 });
           return res.json({message: "User previously upvoted, removing upvote for downvote"});
        }
        } catch(error){
            console.log(error);
        }
    }
  
});


router.post('/down_comment', async(req, res)=>{

    if(req.session.username) {
        //logged in

        const user = await Account.findOne({ "username" : req.session.username });

        try{
            var getId = req.body.comment_id;
            console.log("comment id: " + getId);

            var isUpvoted = await Comment.findOne({_id: getId, username: user._id,
                upvotes: new mongoose.Types.ObjectId(user._id)
            });
            var isDownvoted =  await Comment.findOne({_id: getId, username: user._id,
            downvotes: user._id
            });
            console.log(isUpvoted);
            console.log(isDownvoted)
            
            if (!isUpvoted && !isDownvoted){
                await Comment.findByIdAndUpdate(getId, 
                { $inc: { 
                        votes: -1 
                    },
                    $push: {
                        downvotes: new mongoose.Types.ObjectId(user._id)
                    }
                });
                return res.json({message:"User downvoted successfully"});
            }
            else if (isDownvoted){
                await Comment.findByIdAndUpdate(getId, 
                    { $inc: { 
                        votes: 1
                    },
                    $pull: {
                        downvotes: new mongoose.Types.ObjectId(user._id)
                    }
                });
                return res.json({message:"User already downvoted, removing downvote"});
            }
            else if(isUpvoted){
                    await Comment.findByIdAndUpdate(getId, 
                        { $inc: { 
                            votes: -1
                        },
                        $push: {
                            downvotes: new mongoose.Types.ObjectId(user._id)
                        }
                    });
                    await Comment.findByIdAndUpdate(getId, 
                        { $inc: { 
                            votes: -1
                        },
                        $pull: {
                            upvotes: new mongoose.Types.ObjectId(user._id)
                        }
                    });
            return res.json({message: "User previously upvoted, removing upvote for downvote"});
            }
        } catch(error){
            console.log(error);
        }
}
})
//reply
router.post('/reply', async (req, res) =>{

    if(req.session.username) {
        //logged in

        const user = await Account.findOne({ "username" : req.session.username });
        try {

            const {parent_comment_id, reply_content} = req.body;
    
            if(reply_content != "") {
            
                console.log(parent_comment_id);
                console.log(reply_content);
                
            const comment_date = new Date();
            
            //find the comment using the comment id
            const getComment = await Comment.findOne({_id: parent_comment_id});
    
            console.log(getComment);
            //const getPost = await Post.find({ parent_comment_id: { $in: listOfcomments } }).lean();
              
            //add comment in collection
                const newComment = new Comment({
                    username: user._id,
                    post_commented: getComment.post_commented,
                    comment_content: reply_content,
                    comment_date: comment_date,
                    parent_comment_id: parent_comment_id
                });
    
                // Save the new comment to the database
                const savedComment = await newComment.save();
                
                console.log('New Comment created:', savedComment._id);
                console.log('New Comment created:', savedComment);
    
                //update post
                const updatedPost = await Post.findOneAndUpdate(
                    { _id: getComment.post_commented },
                    { $push: { comments: savedComment._id } });
    
             //update comment with replies
    
            const updatedComment = await Comment.findOneAndUpdate(
                { _id: getComment._id },
                { $push: { replies: savedComment._id } });
    
                 console.log('Saved', updatedPost);
                 console.log('Saved', updatedComment);
                return res.json({ message: 'Successfully commented!'});
            }
    
        } catch(error) {
            console.error('Error creating comment:', error);
            return res.status(500).send('Error creating comment.');
        }
    }

});

router.post('/edit-:id', upload.single('post_attachment'), async (req, res) =>{
    const getId = req.params.id;

    console.log("HERE");
    try {
        var post_attachment = "";

        if(req.file) {
            //check if same file 
            post_attachment = "img/"+req.file.originalname;
        } 
            const { deleted_attachment, post_title, post_content, tags } = req.body;
            
            const getPost = await Post.findOne({_id: getId});
            const unchangedTags = [];

            //get the names of the tags
            const getTags = await Tag.find({ _id: { $in: getPost.tags } }).lean();
            const tagNames = tags.split(',').map(tag => tag.trim());
            const tagIds = [];

            for (const tagName of tagNames) {
                let tag = await Tag.findOne({ tag_name: tagName });

                if (!tag) {
                    // Create a new tag if it doesn't exist

                    if(post_attachment != "") {
                        tag = new Tag({ tag_name: tagName, photo: post_attachment });
                    } else {
                        tag = new Tag({ tag_name: tagName });
                    }
                    await tag.save();
                } else {
                    //update the photo with the latest one
                    if(post_attachment != "") {
                        tag.photo = post_attachment;
                        await tag.save();
                    } 
                }

                tagIds.push(tag._id);

                const isUnchanged = getPost.tags.some((originalTag) => originalTag.equals(tag._id));
                if (isUnchanged) {
                  unchangedTags.push(tag);
                }
            }

            for (const originalTag of getTags) {
                const isUnused = !tagNames.includes(originalTag.tag_name);
                if (isUnused) {
                    const postCountWithCurrentTag = await Post.countDocuments({ tags: originalTag._id });
                    if (postCountWithCurrentTag === 0) {
                        //delete the tag
                        await Tag.findByIdAndDelete({ _id: originalTag._id });
                      }
                }
            }

            //update post
            //post title
            getPost.post_title = post_title;
            //post content
            getPost.post_content = post_content;
            //post attachment
            if(post_attachment != "") {
                getPost.post_attachment = post_attachment;
            } else if(deleted_attachment == "0") {
                getPost.post_attachment = "";
            }

            //post edited
            getPost.post_edited = true;
            //tags
            getPost.tags = tagIds;

            
           const savedPost = await getPost.save();
           ('Post updated:', savedPost);
          
            return res.json({ message: 'Successfully updated! You will be redirected shortly.', id: getId});
       

    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).send('Error creating post.');
    }

});

router.get('/editc-:id', async (req, res) =>{

    if(req.session.username) {
        //logged in

        const user = await Account.findOne({ "username" : req.session.username });

        const getId = req.params.id;

        const getComment = await Comment.findOne({_id: getId}).populate({
            path: "username",
        }).lean();

        const getPost = await Post.findOne({_id: getComment.post_commented}).lean();

        if(req.session.username.toString() == getComment.username.username.toString()) {
            //if owner

                    // start for side-container content

                const latest_posts = await Post.find().populate('username').sort({post_date:'desc'}).limit(5).lean();

                const tagCounts = await Post.aggregate([
                    {
                    $unwind: '$tags' 
                    },
                    {
                    $group: {
                        _id: '$tags', 
                        count: { $sum: 1 } 
                    }
                    }
                ]).sort({count: 'desc'}).limit(6);

                const subscribedTags = user.subscribed_tags;
                const listofTags = await Tag.find({ _id: { $in: subscribedTags } }).lean();
                
                const getPopularTags = [];

                for (var i = 0; i < tagCounts.length; i++){
                    var newTag = await Tag.findById(tagCounts[i]._id).lean();
                    var tag = ({
                        tag_name: newTag.tag_name,
                        tag_id: newTag._id,
                        count: tagCounts[i].count
                    });
                    getPopularTags.push(tag);

                }


                res.render("edit-comment", {
                    title: "Edit comment",
                    header: "Edit comment",
                    script: "js/post.js",
                    username: getComment.username.username,
                    post_title: getPost.post_title,
                    post_id: getPost._id,
                    comment_date: getComment.comment_date,
                    comment_content: getComment.comment_content,
                    posts_latest: latest_posts,
                    popular_tags: getPopularTags,
                    sub_tags: listofTags,
                    id: getComment._id,
                    button_type: 'edit-comment-btn',
                    navbar: 'logged-navbar',
                    session_user: req.session.username

                });
                
        } else {
            //if not owner
            res.redirect('/home');
        }

    } else {
        //not logged in
        res.redirect('/home');
    }
    
});


router.post('/editc-:id', async (req, res) =>{

    try{
    const getId = req.params.id;
    

    const getComment = await Comment.findOne({_id: getId});

    const { comment_content } = req.body;

    if(comment_content != "") {
        getComment.comment_content = comment_content;
    }

    getComment.is_edited = true;
    
    console.log(getId);

    const saveComment = await getComment.save();
    console.log("Saved", saveComment);

    return res.redirect(`/post/${saveComment.post_commented}`);
} catch(error){
    console.log(error);
    return res.status(500).send('Error creating post.');

}
});

// add viewing of page for a specific post
router.get('/:id', async (req, res) =>{
    const getName = req.params.id;
    try{
        const getPost = await Post.findOne({_id: getName}).populate({
            path: "username"
        }).populate({
            path: 'tags'
        }).lean();

        const getComments = await Comment.find({post_commented: getName, parent_comment_id: null}).sort({votes: -1}).lean();

        const latest_posts = await Post.find().populate('username').sort({post_date:'desc'}).limit(5).lean();

        const tagCounts = await Post.aggregate([
            {
              $unwind: '$tags' 
            },
            {
              $group: {
                _id: '$tags', 
                count: { $sum: 1 } 
              }
            }
          ]).sort({count: 'desc'}).limit(6);

          //if user is logged in 
          //do all the stuff

          let logged_in = false;
          let is_user_post = false;
          let listofTags;
          let navbar = 'navbar';

          if(req.session.username) {
            //user is logged in

            logged_in = true;

            console.log(req.session.username);

            if(getPost.username.username == req.session.username) {
                is_user_post = true;
            } 
            
            const user = await Account.findOne({ "username" : req.session.username });

            var isUpvoted = await Post.exists({_id: getName,
                upvotes: new mongoose.Types.ObjectId(user._id)
                 });
            var isDownvoted =  await Post.exists({_id: getName,
                downvotes: new mongoose.Types.ObjectId(user._id)
            });

            
            const subscribedTags = user.subscribed_tags;
            listofTags = await Tag.find({ _id: { $in: subscribedTags } }).lean();

            navbar = 'logged-navbar'

          } 

        const getPopularTags = [];

        for (var i = 0; i < tagCounts.length; i++){
            var newTag = await Tag.findById(tagCounts[i]._id).lean();
            var tag = ({
                tag_name: newTag.tag_name,
                tag_id: newTag._id,
                count: tagCounts[i].count
            });
           getPopularTags.push(tag);

        }

        var upvoteC = getPost.upvotes.length;
        var downvoteC = getPost.downvotes.length;


        var comment_amount = await Comment.find({post_commented: getName}).count();
       

        res.render("view-post", {
            title: "post | " + getPost.post_title,
            post_title: getPost.post_title,
            _id: getPost._id,
            post_content: getPost.post_content,
            post_username: getPost.username,
            post_date: getPost.post_date,
            tags_post: getPost.tags,
            post_attachment:getPost.post_attachment,
            posts_latest: latest_posts,
            popular_tags: getPopularTags,
            post_edited: getPost.post_edited,
            sub_tags: listofTags,
            comment: getComments,
            comment_amount: comment_amount,
            id: getName,
            is_upvoted: isUpvoted,
            is_downvoted: isDownvoted,
            upvote_count: upvoteC,
            downvote_count: downvoteC,
            is_user_post: is_user_post,
            logged_in: logged_in,
            script: "js/view-post.js",
            navbar: navbar,
            session_user: req.session.username
        });
    } catch(error){
        console.log(error);
        res.redirect('/404');
    }
   
});

router.post('/:id', async (req, res) =>{
    const getId = req.params.id;

    if(req.session.username) {
        //logged in

        const user = await Account.findOne({ "username" : req.session.username });

        try{
            const getPost = await Post.findOne({_id: getId}).populate({
                path: "username"
            }).populate({
                path: 'tags'
            }).lean();
    
            const {action} = req.body;
           
            var isUpvoted = await Post.findOne({_id: getId,
                upvotes: new mongoose.Types.ObjectId(user._id)
                 });
            var isDownvoted =  await Post.findOne({_id: getId,
                downvotes: new mongoose.Types.ObjectId(user._id)
            });

            if (action === 'upvoted' && !isUpvoted && !isDownvoted){
                await Post.findByIdAndUpdate(getId, 
                    {
                        $push: {
                        upvotes: new mongoose.Types.ObjectId(user._id)
                        }
                    }
                );
                return res.json({message:"User upvoted successfully"});
            }
            else if (action === 'upvoted' && isUpvoted){
                await Post.findByIdAndUpdate(getId, 
                    {
                        $pull: {
                        upvotes: new mongoose.Types.ObjectId(user._id)
                        }
                    }
                    );
                return res.json({message:"User already upvoted, removing upvote"});
            }
            else if (action === 'upvoted' && isDownvoted){
                await Post.findByIdAndUpdate(getId, 
                {
                    $push: {
                    upvotes: new mongoose.Types.ObjectId(user._id)
                     },
                    $pull: {
                    downvotes: new mongoose.Types.ObjectId(user._id)
                    }
                }
                );
                return res.json({message:"User previously downvoted, removing downvote for upvote"});
            }
            else if (action === 'downvoted' && !isUpvoted && !isDownvoted){
                await Post.findByIdAndUpdate(getId, 
                    {
                        $push: {
                        downvotes: new mongoose.Types.ObjectId(user._id)
                        }
                    }
                );
                return res.json({message:"User downvoted successfully"});
            }
            else if (action === 'downvoted' && isDownvoted){
                await Post.findByIdAndUpdate(getId, 
                    {
                        $pull: {
                        downvotes: new mongoose.Types.ObjectId(user._id)
                        }
                    });
                return res.json({message:"User already downvoted, removing downvote"});
            }
            else if(action === 'downvoted' && isUpvoted){
                await Post.findByIdAndUpdate(getId, 
                    {
                        $push: {
                        downvotes: new mongoose.Types.ObjectId(user._id)
                         },
                        $pull: {
                        upvotes: new mongoose.Types.ObjectId(user._id)
                        }
                    }
                    );
               return res.json({message: "User previously upvoted, removing upvote for downvote"});
            }
            
        } catch(error){
            console.log(error);
        }
    } 
   
});

router.post('/', upload.single('post_attachment'), async (req, res) => {

    if(req.session.username) {

        const user = await Account.findOne({ "username" : req.session.username });

        try {
            const { action } = req.body;
            var post_attachment = "";
    
            if(req.file) {
                post_attachment = "img/"+req.file.originalname;
            }
    
            if (action === 'post-act') {
                const { post_title, post_content, tags } = req.body;
    
                
                const post_date = new Date();
                
                const tagNames = tags.split(',').map(tag => tag.trim());
                const tagIds = [];
    
                for (const tagName of tagNames) {
                    let tag = await Tag.findOne({ tag_name: tagName });
    
                    if (!tag) {
                        // Create a new tag if it doesn't exist
    
                        if(post_attachment != "") {
                            tag = new Tag({ tag_name: tagName, photo: post_attachment });
                        } else {
                            tag = new Tag({ tag_name: tagName });
                        }
                        await tag.save();
                    } else {
                        //update the photo with the latest one
                        if(post_attachment != "") {
                            tag.photo = post_attachment;
                            await tag.save();
                        }
                    }
    
    
                    tagIds.push(tag._id);
                }
    
                // Create a new post document
                const newPost = new Post({
                    username: user._id,
                    post_title: post_title,
                    post_content: post_content,
                    post_date: post_date,
                    post_attachment: post_attachment,
                    tags: tagIds
                });
    
                // Save the new post to the database
                const savedPost = await newPost.save();
                console.log('New Post created:', savedPost);
                return res.json({ message: 'Successfully posted! You will be redirected shortly.', id: savedPost._id });
            }
    
        } catch (error) {
            console.error('Error creating post:', error);
            return res.status(500).send('Error creating post.');
        }
    }
});

module.exports = router;