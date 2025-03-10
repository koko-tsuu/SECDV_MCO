const express = require ("express");
const handlebars = require('handlebars');
const mongoose = require('mongoose');
const Post = require('../server/schema/Post');
const Tag = require('../server/schema/Tag');
const Account = require('../server/schema/Account');
const Comment = require('../server/schema/Comment');
const router = express.Router();


handlebars.registerHelper('checkUp', function(upArray, user, options){
 if (upArray){
    var len = upArray.length;

    for (var i = 0; i < len; i++) {
        var getName = upArray[i].username;
        console.log(getName === user);
          if (getName === user) {
            return options.fn(this);
        }

    } 
  }
  return options.inverse(this)
});

handlebars.registerHelper('checkDown', function(downArray, user, options){
  if (downArray){
      var len = downArray.length;

    for (var i = 0; i < len; i++) {
      var getName = downArray[i].username;

        if (getName == user) {
            return options.fn(this);
        }
        console.log(user);

    }
  }
  return options.inverse(this)
});

router.get('/', async (req, res) => {
    const maxTextLength = 100;
    const postsPerPage = 15;
    let page = parseInt(req.query.page) || 1;

    try {
        const listofposts = await Post.find()
        .populate({
            path: 'username',
        })
        .populate({
            path:'tags',
            select: 'tag_name'
        })
        .populate('upvotes')
        .populate('downvotes')
        .sort({post_date: 'desc'})
        .lean();

        listofposts.forEach((post) => {

            if (post.post_title && post.post_title.length > maxTextLength) {
                post.post_title = post.post_title.substring(0, maxTextLength) + '...';
            }

            if (post.tags && post.tags.length > 3) {
                post.tags = post.tags.slice(0, 3);
            }
        });

        // start for side-container content

        let logged_in = false;
        let listofTags;
        let navbar = 'navbar';

        if(req.session.username) {
          //user is logged in

          logged_in = true;
          
          const user = await Account.findOne({ "username" : req.session.username });

          const subscribedTags = user.subscribed_tags;
          listofTags = await Tag.find({ _id: { $in: subscribedTags } }).lean();
          
          navbar = 'logged-navbar';
        }


        console.log(listofTags);

        const latest_posts = await Post.find().populate('username').sort({post_date:'desc'}).limit(5).lean();

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

        const numOfPosts = listofposts.length;
        const totalPages = Math.ceil(numOfPosts / postsPerPage);

        const pagedPosts = listofposts.slice((page - 1) * postsPerPage, page * postsPerPage);
       
        res.render("index", {
        title: "Hot Posts",
        header: "Hot Posts",
        script: 'js/index.js',
        posts: pagedPosts,
        posts_latest: latest_posts,
        popular_tags: getPopularTags,
        sub_tags: listofTags,
        logged_in: logged_in,
        navbar: navbar,
        session_user: req.session.username,
        current: page,
        pages: totalPages,
        prev: page > 1 ? page - 1 : null,
        next: page < totalPages ? page + 1 : null,
        });
    } catch(error){
        console.log(error);
    }
});

router.post("/up/:post_id", async (req, res)=>{
  const getId = req.params.post_id;
  if(req.session.username) {

      const user = await Account.findOne({ "username" : req.session.username } );
      

      try{
          var isUpvoted = await Post.findOne({_id: getId,
              upvotes: new mongoose.Types.ObjectId(user._id)
               });
          var isDownvoted =  await Post.findOne({_id: getId,
              downvotes: new mongoose.Types.ObjectId(user._id)
          });
          if (!isUpvoted && !isDownvoted){
              await Post.findByIdAndUpdate(getId, 
                  {
                      $push: {
                      upvotes: new mongoose.Types.ObjectId(user._id)
                      }
                  }
              );
              return res.json({message:"User upvoted successfully"});
          }
          else if (isUpvoted){
              await Post.findByIdAndUpdate(getId, 
                  {
                      $pull: {
                      upvotes: new mongoose.Types.ObjectId(user._id)
                      }
                  }
              );
              return res.json({message:"User already upvoted, removing upvote"});
          }
          else if (isDownvoted){
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
          var isUpvoted = await Post.findOne({_id: getId,
              upvotes: new mongoose.Types.ObjectId(user._id)
               });
          var isDownvoted =  await Post.findOne({_id: getId,
              downvotes: new mongoose.Types.ObjectId(user._id)
          });

          if (!isUpvoted && !isDownvoted){
              await Post.findByIdAndUpdate(getId, 
                  {
                      $push: {
                      downvotes: new mongoose.Types.ObjectId(user._id)
                      }
                  }
              );
              return res.json({message:"User downvoted successfully"});
          }
          else if (isDownvoted){
              await Post.findByIdAndUpdate(getId, 
                  {
                      $pull: {
                      downvotes: new mongoose.Types.ObjectId(user._id)
                      }
                  }
              );
              return res.json({message:"User already downvoted, removing downvote"});
          }
          else if(isUpvoted){
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

module.exports = router;