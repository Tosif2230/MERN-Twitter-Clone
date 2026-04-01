import TweetModel from "../models/tweet.model.js";

//Post Tweet
export async function postTweet(req, res) {
  try {
    const tweet = new TweetModel(req.body);
    await tweet.save();
    return res.status(201).json(tweet);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

//get all tweet
export async function getTweet(req,res) {
  try {
    const tweet = await TweetModel.find()
      .sort({ timestamp: -1 })
      .populate("author");
    return res.status(200).json(tweet);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
