import TweetModel from "../models/tweet.model.js";

//Post Tweet
export async function postTweet(req, res) {
  try {
    const tweet = new TweetModel(req.body);
    await tweet.save();
    await tweet.populate("author");
    return res.status(201).json(tweet);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

//Delete tweet
export async function deleteTweet(req, res) {
  try {
    const { tweetId } = req.params;
    const { userId } = req.body;

    const tweet = await TweetModel.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    if (tweet.author.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await tweet.deleteOne();

    return res.status(200).json({ message: "Tweet deleted successfully" });
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
// Liked Tweet (Toggle mode)
export async function likedTweet(req, res) {
  try {
    const { userId } = req.body;
    const tweet = await TweetModel.findById(req.params.tweetId).populate(
      "author",
    );
    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    const Liked = tweet.likedBy.includes(userId);

    if (Liked) {
      // Unlike
      tweet.likes -= 1;
      tweet.likedBy = tweet.likedBy.filter((id) => id.toString() !== userId);
    } else {
      // Like
      tweet.likes += 1;
      tweet.likedBy.push(userId);
    }

    await tweet.save();

    return res.status(200).json(tweet);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// Re-Tweet
export async function reTweet(req, res) {
  try {
    const { userId } = req.body;
    const tweet = await TweetModel.findById(req.params.tweetId).populate(
      "author",
    );
    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }
    const ReTweet = tweet.retweetedBy.includes(userId);

    if (ReTweet) {
      // Unretweet
      tweet.retweets -= 1;
      tweet.retweetedBy = tweet.retweetedBy.filter(
        (id) => id.toString() !== userId,
      );
    } else {
      // Retweet
      tweet.retweets += 1;
      tweet.retweetedBy.push(userId);
    }
    await tweet.save();
    return res.status(200).json(tweet);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
