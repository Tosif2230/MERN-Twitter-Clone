import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  ChartBar,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Repeat2,
  Share,
  Trash2Icon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../lib/axiosInstance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const TweetCard = ({ tweet }: any) => {
  const { user } = useAuth();
  const [tweetState,settweetState] = useState(tweet)
  const [deleted, setDeleted] = useState(false);
  const liketweet = async (tweetid: string) => {
    try {
      const res = await axiosInstance.post(`/api/like/${tweetid}`, {
        userId: user?._id,
      });
      settweetState(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  if (deleted) return null;
  const deleteTweet = async (tweetid: string) => {
    try {
      await axiosInstance.delete(`/api/delete/${tweetid}`, {
        data: { userId: user?._id },
      });
      setDeleted(true);
    } catch (error) {
      console.log(error);
    }
  };

  const retweet = async (tweetid: string) => {
    try {
      const res = await axiosInstance.post(`/api/retweet/${tweetid}`, {
        userId: user?._id,
      });
      settweetState(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const isLiked = tweetState.likedBy?.includes(user?._id);
  const isRetweet = tweetState.retweetedBy?.includes(user?._id);
  return (
    <Card className="bg-black border-gray-800 border-x-0 border-t-0 rounded-none hover:bg-gray-950/50 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
            <AvatarImage
              src={tweetState?.author?.avatar}
              alt={tweetState?.author?.displayName}
            />
            <AvatarFallback>
              {tweetState?.author?.displayName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start sm:items-center gap-1 sm:gap-2 mb-1 flex-wrap">
              <span className="font-bold text-white">
                {tweetState?.author?.displayName}
              </span>
              {tweetState?.author?.verified && (
                <div className="bg-blue-500 rounded-full p-0.5">
                  <svg
                    className="h-4 w-4 text-white fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
              )}
              <span className="text-gray-500 text-sm truncate max-w-[120px] sm:max-w-none">
                @{tweetState?.author?.userName}
              </span>
              <span className="text-gray-500 text-sm truncate max-w-[120px] sm:max-w-none">
                .
              </span>
              <span className="text-gray-500 text-sm truncate max-w-[120px] sm:max-w-none">
                {tweetState.timestamp &&
                  new Date(tweetState.timestamp).toLocaleDateString("en-us", {
                    month: "long",
                    year: "numeric",
                  })}
              </span>
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 rounded-full bg-transparent hover:bg-stone-900"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-5 h-5 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-black border border-gray-800 rounded-xl shadow-lg "
                  >
                    {user?._id === tweetState.author?._id && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTweet(tweetState._id);
                        }}
                        className="text-white hover:bg-gray-900 rounded-md cursor-pointer"
                      >
                        <Trash2Icon className="text-red-500" />
                        Delete
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="text-white hover:bg-gray-900 rounded-md cursor-pointer">
                      <Pin className="text-white" />
                      Pin to your profile
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-white hover:bg-gray-900 rounded-md cursor-pointer">
                      <ChartBar className="hover:text-black" />
                      View post activity
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="text-white mb-3 leading-relaxed text-sm sm:text-base break-words">
              {tweetState.content}
            </div>
            {tweetState.image && (
              <div className="mb-3 rounded-2xl overflow-hidden">
                <img
                  src={tweetState.image}
                  alt="Tweet image"
                  className="w-full h-auto max-h-80 sm:max-h-96 object-cover"
                />
              </div>
            )}
            {tweetState.audio && (
              <audio controls className="mt-2 w-full">
                <source src={tweetState.audio} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}

            <div className="flex items-center justify-between w-full max-w-md">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 p-2  rounded-full hover:bg-blue-900/20 text-gray-500 hover:text-blue-400 group"
              >
                <MessageCircle className="h-5 w-5 group-hover:text-blue-400" />
                <span className="text-sm">
                  {formatNumber(tweetState.comments)}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-1 sm:gap-2 p-2  rounded-full hover:bg-red-900/20 text-gray-500 group ${isRetweet ? "text-green-400" : " hover:text-green-400"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  retweet(tweetState._id);
                }}
              >
                <Repeat2 className="h-5 w-5 group-hover:text-green-400" />
                <span className="text-sm">
                  {formatNumber(tweetState.retweets)}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-1 sm:gap-2 p-2  rounded-full hover:bg-red-900/20 text-gray-500 group ${isLiked ? "text-red-500" : " hover:text-red-400"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  liketweet(tweetState._id);
                }}
              >
                <Heart className="h-5 w-5 group-hover:text-red-400" />
                <span className="text-sm">
                  {formatNumber(tweetState.likes)}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 p-2  rounded-full hover:bg-blue-900/20 text-gray-500 hover:text-blue-400 group"
              >
                <Share className="h-5 w-5 group-hover:text-blue-400" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TweetCard;
