import { getTweet, postTweet } from "../controllers/tweet.controller.js";

// Tweet API Routes
export default function tweetRoute(app){
      //Post
      app.post("/api/post", postTweet );
    
      //get all Tweet
      app.get("/api/post", getTweet);
    
}




