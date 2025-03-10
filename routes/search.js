const express = require ("express");
const handlebars = require('handlebars');
const mongoose = require('mongoose');
const router = express.Router();
const Post =  require('../server/schema/Post');
const Account =  require('../server/schema/Account');
const Tag =  require('../server/schema/Tag');

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

router.get('/', async (req, res) =>{

    let navbar = 'navbar';
    let logged_in = false;

    if(req.session.username) {
      logged_in = true;
      navbar = 'logged-navbar';
    } 
    try
    {
        var searchTerm = req.query.text;
    console.log("query term: " + searchTerm)
    // REFERENCE: https://codingbeautydev.com/blog/javascript-remove-special-characters-from-string/
    const search = searchTerm.replace(/[^a-zA-Z0-9 ]/, '')
    console.log("search term: " + search)

    const searchResults_Post = await Post.find({
      $or: [
        { post_title: {$regex: new RegExp(search, 'i')}},
        { post_content: {$regex: new RegExp(search, 'i')}},
    ]}).populate('username').populate( { path: 'tags', match: { type: search}},).populate({path: 'upvotes'}).populate({path: 'downvotes'}).lean();
   

    const searchResults_Account = await Account.find({
        $or: [
            { username: {$regex: new RegExp(search, 'i')}},
            ]
    }).lean();

    const searchTag = await Tag.find({
        tag_name: {$regex: new RegExp(search, 'i')}
    }).lean();

    var searchResults_Tag = [];

   
    for (var i = 0; i < searchTag.length; i++){
     
      
    var tagCounts = await Post.aggregate([
      {
        $unwind: '$tags' 
      },
      {
        $match: {tags: searchTag[i]._id}
      },
      {
        $count: "count"
      }
      ]);

      console.log(tagCounts)
      var getTagNames = await Tag.findById(searchTag[i]._id).lean();
      var jsonfile = JSON.stringify(tagCounts)
      var filteredPostNum = jsonfile.replace(/\D/g,'');
      var newSearchTag = ({
        tag_name: getTagNames.tag_name,
        count: filteredPostNum
      })
      
      if(tagCounts.length != 0)
      await searchResults_Tag.push(newSearchTag);

    }
    console.log(searchResults_Tag);

    

    // need to output the results to here
    res.render("search", {
        title: "search | " + searchTerm,
        header: "Search Results for " + searchTerm,
        searched_post: searchResults_Post,
        searched_accounts: searchResults_Account,
        searched_tags: searchResults_Tag,
        script: 'js/index.js',
        add_style: '<link rel="stylesheet" type="text/css" href="css/style1.css">',
        navbar: navbar,
        logged_in: logged_in,
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
