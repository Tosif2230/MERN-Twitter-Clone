import {
  getTweet,
  postTweet,
  likedTweet,
  reTweet,
} from "../controllers/tweet.controller.js";

// Tweet API Routes
export default function tweetRoute(app) {
  //Post
  app.post("/api/post", postTweet);

  //get all Tweet
  app.get("/api/post", getTweet);

  //Like Tweet
  app.post("/api/like/:tweetId", likedTweet);
  
  //Re Tweet
  app.post("/api/retweet/:tweetId", reTweet);
}
