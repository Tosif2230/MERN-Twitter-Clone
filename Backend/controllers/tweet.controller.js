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
export async function getTweet(req, res) {
  try {
    const tweet = await TweetModel.find()
      .sort({ timestamp: -1 })
      .populate("author");
    return res.status(200).json(tweet);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
// Liked Tweet
export async function likedTweet(req, res) {
  try {
    const { userId } = req.body;
    const tweet = await TweetModel.findById(req.params.tweetId);
    if (!tweet.likedBy.includes(userId)) {
      tweet.likes += 1;
      tweet.likedBy.push(userId);
      await tweet.save();
    }
    return res.status(200).json(tweet)
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// Re-Tweet
export async function reTweet(req, res) {
  try {
    const { userId } = req.body;
    const tweet = await TweetModel.findById(req.params.tweetId);
    if (!tweet.retweetedBy.includes(userId)) {
      tweet.retweets += 1;
      tweet.retweetedBy.push(userId);
      await tweet.save();
    }
    return res.status(200).json(tweet)
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
