const express = require ("express");
const mongoose = require('mongoose');
const handlebars = require('handlebars');
const router = express.Router();
const Tag = require('../server/schema/Tag');
const Account = require('../server/schema/Account');
const Postschema = require('../server/schema/Post');

handlebars.registerHelper('log', function(something){
    console.log("test " + something);
})
router.get("/:tagname", async (req, res)=>{
    
    try {
        //gets the list of posts that contains tag
        const getTagName = req.params.tagname;

        let logged_in = false;
        let user;
        let navbar = 'navbar';
        let listofTagsLogged;

        if(req.session.username) {
            //loggedin
            logged_in = true;
            navbar = 'logged-navbar';
            user = await Account.findOne({ "username" : req.session.username } );
            const subscribedTagsLogged = user.subscribed_tags;
            listofTagsLogged = await Tag.find({ _id: { $in: subscribedTagsLogged } }).lean();
        }

        const getTag = await Tag.find({
            tag_name: getTagName
        }).lean();
        
        //list of posts under that tag
        const postList =  await Postschema.find({
            tags: {$in: getTag}
        }).populate({
            path: 'username'
        }).populate({
            path: 'tags',
            select: 'tag_name _id'
        }).lean();

        const postListLength = postList.length;

        //how many users are subscribed to a tag
        const accountList = Account.find({
            subscribed_tags: {$in: getTag}
        }).lean();

        let accountListLength = (await accountList).length;
        if (accountListLength == null){
            accountListLength = 0;
        }

        //get netvotecount for each post
        let postWithNetVote = [];

        //sums up how many posts are under every tag into an array
        for (i = 0; i < postListLength; i++){
            let currPostID = postList[i]._id;
            var isUpvoted = false;
            var isDownvoted = false;
            var getAPost = await Postschema.findOne({_id: currPostID});
            if(logged_in) {
               
                var isUpvoted = await Postschema.findOne({_id: currPostID,
                    upvotes: new mongoose.Types.ObjectId(user._id)
                     });
                var isDownvoted =  await Postschema.findOne({_id: currPostID,
                    downvotes: new mongoose.Types.ObjectId(user._id)
                });
                
    
                if (isUpvoted)
                    isUpvoted = true;
                else
                    isUpvoted = false;
                if(isDownvoted)
                    isDownvoted = true;
                else
                    isDownvoted = false;
            }
            //getting votes
            var updoots = 0;
            try{
                updoots = getAPost.upvotes.length;
            
             }catch(error){
                console.log(error);
                updoots = 0;
             }
             console.log(updoots);
            var downdoots = 0;
            try{
                downdoots = getAPost.downvotes.length;
            
             }catch(error){
                console.log(error);
                downdoots = 0;
             }
             console.log(downdoots);
            console.log("up " + isUpvoted);
            console.log("down " + isDownvoted);
            //add current info + new info

            // Limit the tags for each post into 2
            let displayTags = []

            if(postList[i].tags.length > 2) {
                displayTags = postList[i].tags.slice(0, 2);     // Display only the first two tags
            }
            else {
                displayTags = postList[i].tags;
            }

            const postData = ({
                _id: postList[i]._id,
                username: postList[i].username,
                post_title: postList[i].post_title,
                
                // Limit the contents of each post into 30 characters
                post_content: postList[i].post_content.length > 30 ? postList[i].post_content.substring(0, 30) + '...' : postList[i].post_content,

                post_edited: postList[i].post_edited,
                post_date: postList[i].post_date,
                post_date_modified: postList[i].post_date_modified,
                comments: postList[i].comments,

                tags: displayTags,

                upvoted: isUpvoted,
                downvoted: isDownvoted,
                net_vote_count: updoots-downdoots,
            })

            postWithNetVote.push(postData);
        }

        res.render("tag-posts", {
            title: "Tag | " + getTagName,
            tag_name: getTagName,
            tag_id: getTag[0]._id,
            post_cnt: postListLength, 
            subscribers: accountListLength,
            post:postWithNetVote,
            sub_tags: listofTagsLogged,
            script: "js/tag.js",
            navbar: navbar,
            logged_in: logged_in,
            session_user: req.session.username
        })
    } catch (error){
        console.log(error);
        res.redirect('/404');
    }
})


router.get("/", async  (req, res)=>{

    let navbar = 'navbar';
    if(req.session.username) {
        navbar = 'logged-navbar';
    } 

    try {
        //sums up how many posts are under every tag into an array
        const tagCounts = await Postschema.aggregate([
            {
              $unwind: '$tags' 
            },
            {
              $group: {
                _id: '$tags', 
                count: { $sum: 1 } 
              }
            }
        ]).sort({count: 'desc'});

        const tagListWithCount = [];

        //making an object that contains tagname and count
        for (var i = 0; i < tagCounts.length; i++){
            var newTag = await Tag.findById(tagCounts[i]._id).lean();
            var tag = ({
                // limit the characters of each tag name into 10 and add "..." if it is greater than 10
                tag_name: newTag.tag_name,
                limit_tag_name: newTag.tag_name.length > 10 ? newTag.tag_name.substring(0, 10) + '...' : newTag.tag_name,
                photo: newTag.photo,
                count: tagCounts[i].count
            });
            tagListWithCount.push(tag);
        }
        res.render("tag", {
            title: "View tags",
            header: "View tags",
            tag: tagListWithCount,
            script: "js/tag.js",
            navbar: navbar,
            session_user: req.session.username
        });
    }catch(error){
        console.log(error);
        res.redirect('/404');
    }
    

});

router.post("/up/:post_id", async (req, res)=>{
    const getId = req.params.post_id;
    if(req.session.username) {

        const user = await Account.findOne({ "username" : req.session.username } );
        

        try{
            var isUpvoted = await Postschema.findOne({_id: getId,
                upvotes: new mongoose.Types.ObjectId(user._id)
                 });
            var isDownvoted =  await Postschema.findOne({_id: getId,
                downvotes: new mongoose.Types.ObjectId(user._id)
            });
            if (!isUpvoted && !isDownvoted){
                await Postschema.findByIdAndUpdate(getId, 
                    {
                        $push: {
                        upvotes: new mongoose.Types.ObjectId(user._id)
                        }
                    }
                );
                return res.json({message:"User upvoted successfully"});
            }
            else if (isUpvoted){
                await Postschema.findByIdAndUpdate(getId, 
                    {
                        $pull: {
                        upvotes: new mongoose.Types.ObjectId(user._id)
                        }
                    }
                );
                return res.json({message:"User already upvoted, removing upvote"});
            }
            else if (isDownvoted){
                await Postschema.findByIdAndUpdate(getId, 
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
        } catch(error){
            console.log(error);
        }
    }
});

router.post("/down/:post_id", async (req, res)=>{
    const getId = req.params.post_id;
   
    if(req.session.username) {

        const user = await Account.findOne({ "username" : req.session.username } );

        try{
            var isUpvoted = await Postschema.findOne({_id: getId,
                upvotes: new mongoose.Types.ObjectId(user._id)
                 });
            var isDownvoted =  await Postschema.findOne({_id: getId,
                downvotes: new mongoose.Types.ObjectId(user._id)
            });

            if (!isUpvoted && !isDownvoted){
                await Postschema.findByIdAndUpdate(getId, 
                    {
                        $push: {
                        downvotes: new mongoose.Types.ObjectId(user._id)
                        }
                    }
                );
                return res.json({message:"User downvoted successfully"});
            }
            else if (isDownvoted){
                await Postschema.findByIdAndUpdate(getId, 
                    {
                        $pull: {
                        downvotes: new mongoose.Types.ObjectId(user._id)
                        }
                    }
                );
                return res.json({message:"User already downvoted, removing downvote"});
            }
            else if(isUpvoted){
                await Postschema.findByIdAndUpdate(getId, 
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

module.exports = router;