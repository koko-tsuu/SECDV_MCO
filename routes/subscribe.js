const express = require ("express");
const mongoose = require("mongoose");
const handlebars = require('handlebars');
const router = express.Router();
const Account = require('../server/schema/Account');
const Tag = require('../server/schema/Tag');

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

handlebars.registerHelper('isInSubscribedTags', function(tagId, options) {
  // Access the subscribedTags array from the current context
  const subscribedTags = options.data.root.sub_tags;
  
  const subscribedTagIds = subscribedTags.map((tag) => tag._id);

  const tagObjectId = new mongoose.Types.ObjectId(tagId);
  
  // Check if the current tagId exists in the subscribedTags array
  const isSubscribed = subscribedTagIds.some((subscribedTagId) => subscribedTagId.equals(tagObjectId));
  
  // Return the result of the check
  return isSubscribed;
});

router.post('/', async (req, res) =>{

  if(req.session.username) {

    const user = await Account.findOne({ "username" : req.session.username });
    const user_id = user._id;

    try {
      const { subscribe, action} = req.body;

      const tag = await Tag.findOne({ tag_name: subscribe }).lean();
      
      if(action == "Subscribe") {
        const updatedUser = await Account.findOneAndUpdate(
          { _id: user_id },
          { $push: { subscribed_tags: tag._id } },
          { new: true } 
        ).lean();
          console.log('User subscription updated:', updatedUser);
          return res.json({ message: 'Successfully subscribed!', subscribedTags: updatedUser.subscribed_tags});
      } else {
        const updatedUser = await Account.findOneAndUpdate(
          { _id: user_id },
          { $pull: { subscribed_tags: tag._id } },
          { new: true } 
        ).lean();
          console.log('User subscription updated:', updatedUser);
          return res.json({ message: 'Successfully unsubscribed!', subscribedTags: updatedUser.subscribed_tags});
      }

  } catch (error) {
      console.error('Error sub:', error);
      return res.status(500).send('Error sub.');
  }
  }

});

module.exports = router;
