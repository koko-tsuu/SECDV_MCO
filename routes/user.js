const express = require ("express");
const handlebars = require('handlebars');

const Account = require('../server/schema/Account');
const Post = require('../server/schema/Post');
const Tag = require('../server/schema/Tag');
const Comment = require('../server/schema/Comment');
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

handlebars.registerHelper('checkUp', function(upArray, user, options){
  var len = upArray.length;

  for (var i = 0; i < len; i++) {
    var getName = upArray[i].username;
    console.log(getName === user);
      if (getName === user) {
          return options.fn(this);
      }
      

  }
  return options.inverse(this);
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
  console.log("logged: " + something);
})

router.get("/:name", async (req, res)=> {

    // console.log(req.session.username);
    const getName = req.params.name;
    const maxTextLength = 50;

    console.log("current: " + req.session.username);

        const user = await Account.findOne({ "username" : getName });
        console.log(user);
        if (!user) {
            // Handle the case when the user is not found
            return res.status(404).send("User not found.");
        }

        const listofposts = await Post.find().where("username").equals(user._id).populate({
            path:'username',
            select: 'username'
        }).populate({
            path:'tags',
            select: 'tag_name'
        }).lean();

        listofposts.forEach((post) => {

            if (post.post_title && post.post_title.length > maxTextLength) {
              post.post_title = post.post_title.substring(0, maxTextLength) + '...';
            }

            if (post.tags && post.tags.length > 3) {
                post.tags = post.tags.slice(0, 3);
              }
        });

        const listofcomments = await Comment.find().where("username").equals(user._id).populate({
            path: 'post_commented',
            select: 'post_id tags post_title',
            populate: {
              path: 'tags',
              select: '_id tag_name',
            },
          }).populate({
            path:'username',
            select: 'username'
        }).populate({
            path: 'upvotes',
        }).populate({
          path: 'downvotes',
      }).lean();

          const listofExistingC = [];

          listofcomments.forEach(async (comment) => {
            
            if(comment.post_commented) {
              if(comment.parent_comment_id != null) {
                const parentId = await Comment.findOne({"_id" : comment.parent_comment_id}).lean();
                
                if(parentId) {
                  listofExistingC.push(comment);
                }
              } else {
                listofExistingC.push(comment);
              }
            }

            if (comment.post_title && comment.comment_content.length > maxTextLength) {
              comment.comment_content = comment.comment_content.substring(0, maxTextLength) + '...';
            }
            
            if (comment.post_commented && comment.post_commented.tags && comment.post_commented.tags.length > 3) {
              comment.post_commented.tags = comment.post_commented.tags.slice(0, 3);
            }

          });

          const subscribedTags = user.subscribed_tags;

          const listofTags = await Tag.find({ _id: { $in: subscribedTags } }).lean();



         // start for side-container content

         const latest_posts = await Post.find().populate('username').sort({post_date:'desc'}).limit(5).lean();

         let logged_in = false;
         let navbar = 'navbar';
         let listofTagsLogged;

      //if logged in 
     if(req.session.username) {
        navbar = 'logged-navbar';
        logged_in = true;
        const logged_user = await Account.findOne({ "username" : req.session.username } );

        const subscribedTagsLogged = logged_user.subscribed_tags;
        listofTagsLogged = await Tag.find({ _id: { $in: subscribedTagsLogged } }).lean();
     }

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
         
      res.render("user", {
        title: user.username,
        user_name: user.username,
        "profile_desc": user.profile_desc,
        "profile_pic": user.profile_pic,
        user_posts: listofposts,
        user_comments: listofExistingC,
        user_sub_tags: listofTags,
        sub_tags: listofTagsLogged,
        logged_in: logged_in,
        posts_latest: latest_posts,
        popular_tags: getPopularTags,
        script: "js/profile.js",
        add_script: "js/index.js",
        navbar: navbar,
        session_user: req.session.username
    });
        
})

router.get("/", (req, res)=>{
    res.redirect('/');
});

router.post('/:name', upload.single('getImg'), async function (req, res) {

  try {

    const getName = req.params.name;
    const user = await Account.findOne({ username: getName });
    const { bio_area } = req.body;

  if(req.file) {
    const newImg = "img/"+req.file.originalname;
    user.profile_pic = newImg;
  }

  if (bio_area === '') {
    user.profile_desc = null;
  } else {
    user.profile_desc = bio_area;
  }

  await user.save();

  return res.json({ message: 'success', profile_image: user.profile_pic, profile_bio: user.profile_desc} );


  } catch(error) {
    console.error('Error updating profile:', error);
    return res.status(500).send('Error updating profile.');
  }
  
});


module.exports = router;