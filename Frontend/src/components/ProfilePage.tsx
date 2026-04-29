import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar,
  Camera,
  LinkIcon,
  MapPin,
  Phone,
  Settings,
} from "lucide-react";

import { Avatar, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import TweetCard from "./TweetCard";
import Editprofile from "./Editprofile";
import axiosInstance from "../lib/axiosInstance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTranslation } from "react-i18next";

interface Tweet {
  _id: string;
  author: {
    _id: string;
    userName: string;
    displayName: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: number;
  liked?: boolean;
  retweeted?: boolean;
  image?: string;
}
const tweets: Tweet[] = [
  {
    _id: "1",
    author: {
      _id: "1",
      userName: "elonmusk",
      displayName: "Elon Musk",
      avatar:
        "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: true,
    },
    content:
      "Just had an amazing conversation about the future of AI. The possibilities are endless!",
    timestamp: "2h",
    likes: 1247,
    retweets: 324,
    comments: 89,
    liked: false,
    retweeted: false,
  },
  {
    _id: "2",
    author: {
      _id: "1",
      userName: "sarahtech",
      displayName: "Sarah Johnson",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: false,
    },
    content:
      "Working on some exciting new features for our app. Can't wait to share what we've been building! 🚀",
    timestamp: "4h",
    likes: 89,
    retweets: 23,
    comments: 12,
    liked: true,
    retweeted: false,
  },
  {
    _id: "3",
    author: {
      _id: "4",
      userName: "designguru",
      displayName: "Alex Chen",
      avatar:
        "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: true,
    },
    content:
      "The new design system is finally complete! It took 6 months but the results are incredible. Clean, consistent, and accessible.",
    timestamp: "6h",
    likes: 456,
    retweets: 78,
    comments: 34,
    liked: false,
    retweeted: true,
    image:
      "https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];
const ProfilePage = () => {
  const { user, notificationsEnabled, setNotificationsEnabled } = useAuth();
  const { i18n, t } = useTranslation();
  const [activeTab, setActiveTab] = useState("posts");
  const [showEditModal, setShowEditModal] = useState(false);
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTweets = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/post");
      setTweets(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  if (!user) return null;

  const locale = i18n.resolvedLanguage || "en";
  const userTweets = tweets.filter(
    (tweet: any) => tweet?.author?._id === user._id,
  );
  const loginHistory = (user.loginHistory || []).filter(
    (session: any, index: number, history: any[]) => {
      const previous = history[index - 1];
      if (!previous) return true;

      const loggedInAt = new Date(session.loggedInAt).getTime();
      const previousLoggedInAt = new Date(previous.loggedInAt).getTime();

      return !(
        session.browser === previous.browser &&
        session.operatingSystem === previous.operatingSystem &&
        session.deviceCategory === previous.deviceCategory &&
        session.ipAddress === previous.ipAddress &&
        Math.abs(loggedInAt - previousLoggedInAt) < 10000
      );
    },
  );
  const formatLoginDate = (date: string) =>
    new Date(date).toLocaleString(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit"
    });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-black/90 backdrop-blur-md">
        <div className="flex min-w-0 items-center space-x-3 px-3 py-2 sm:space-x-6 sm:px-4">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-full hover:bg-gray-900"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-white sm:text-xl">
              {user.displayName}
            </h1>
            <p className="text-xs text-gray-400 sm:text-sm">
              {t("profile.postsCount", { count: userTweets.length })}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="m-2 rounded-full p-2 hover:bg-gray-900 sm:m-4"
            >
              <Settings className="text-white h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 bg-black border border-gray-800 rounded-xl shadow-lg p-2"
          >
            <DropdownMenuItem className="text-white hover:bg-gray-900 rounded-md cursor-pointer">
              {" "}
              {t("sidebar.settings")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cover Photo */}
      <div className="relative">
        <div className="relative h-36 bg-stone-800 sm:h-48">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70"
          >
            <Camera className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Profile Picture */}
        <div className="absolute bottom-0 left-3 sm:left-5">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-black sm:h-36 sm:w-36">
              <AvatarImage src={user.avatar} />
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2 rounded-full bg-black/70 p-2 hover:bg-black/90"
            >
              <Camera className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>
        {/* Edit Profile Button */}
        <div className="flex justify-end p-3 sm:p-4">
          <Button
            variant="outline"
            className="rounded-full border-gray-600 bg-transparent px-4 text-xs font-semibold text-white hover:bg-stone-800 hover:text-white sm:px-6 sm:text-sm"
            onClick={() => setShowEditModal(true)}
          >
            {t("profile.editProfile")}
          </Button>
        </div>
      </div>
      {/* Profile Info */}
      <div className="mt-2 px-4 pb-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {user.displayName}
            </h1>
            <p className="text-gray-400">@{user.userName}</p>
          </div>
        </div>

        {user.bio && (
          <p className="text-white mb-3 leading-relaxed">{user.bio}</p>
        )}

        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{user.location || t("profile.defaultLocation")}</span>
          </div>
          <div className="flex items-center space-x-1">
            <LinkIcon className="h-4 w-4" />
            <span className="text-blue-400">
              {user.website || t("profile.defaultWebsite")}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>
              {t("profile.joined")}
              {user.joinedDate &&
                new Date(user.joinedDate).toLocaleDateString(locale, {
                  month: "long",
                  year: "numeric",
                })}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Phone className="h-4 w-4" />
            <span>{user.phone}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-3">
            <span className="cursor-pointer text-sm text-gray-400 hover:border-b hover:border-white">
              {t("profile.following", { count: 0 })}
            </span>
            <span className="text-sm text-gray-400 cursor-pointer hover:border-b hover:border-white">
              {t("profile.followers", { count: 0 })}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="items-center rounded-lg bg-transparent p-2 hover:border-b hover:bg-transparent"
            onClick={() => setNotificationsEnabled((prev: any) => !prev)}
          >
            {notificationsEnabled ? (
              <Bell className="text-white" />
            ) : (
              <BellOff className="text-red-500" />
            )}
          </Button>
        </div>
      </div>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex h-auto w-full justify-start overflow-x-auto rounded-none border-b border-gray-800 bg-transparent">
          <TabsTrigger
            value="posts"
            className="min-w-max px-4 py-4 font-semibold text-gray-400 hover:bg-gray-900/50 data-[state=active]:rounded-none data-[state=active]:border-b-4 data-[state=active]:border-b-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-white"
          >
            {t("profile.posts")}
          </TabsTrigger>
          <TabsTrigger
            value="loginHistory"
            className="min-w-max px-4 py-4 font-semibold text-gray-400 hover:bg-gray-900/50 data-[state=active]:rounded-none data-[state=active]:border-b-4 data-[state=active]:border-b-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-white"
          >
            {t("profile.history")}
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="min-w-max px-4 py-4 font-semibold text-gray-400 hover:bg-gray-900/50 data-[state=active]:rounded-none data-[state=active]:border-b-4 data-[state=active]:border-b-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-white"
          >
            {t("profile.replies")}
          </TabsTrigger>
          <TabsTrigger
            value="highlights"
            className="min-w-max px-4 py-4 font-semibold text-gray-400 hover:bg-gray-900/50 data-[state=active]:rounded-none data-[state=active]:border-b-4 data-[state=active]:border-b-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-white"
          >
            {t("profile.highlights")}
          </TabsTrigger>
          <TabsTrigger
            value="articles"
            className="min-w-max px-4 py-4 font-semibold text-gray-400 hover:bg-gray-900/50 data-[state=active]:rounded-none data-[state=active]:border-b-4 data-[state=active]:border-b-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-white"
          >
            {t("profile.articles")}
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="min-w-max px-4 py-4 font-semibold text-gray-400 hover:bg-gray-900/50 data-[state=active]:rounded-none data-[state=active]:border-b-4 data-[state=active]:border-b-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-white"
          >
            {t("profile.media")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          {loading || userTweets.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              {t("profile.noPosts")}
            </div>
          ) : (
            userTweets.map((tweet: any) => (
              <TweetCard key={tweet._id} tweet={tweet} />
            ))
          )}
        </TabsContent>
        <TabsContent value="loginHistory">
          <div className="divide-y divide-gray-800">
            {loginHistory.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                {t("profile.noLoginHistory")}
              </div>
            ) : (
              loginHistory.map((session: any, index: number) => (
                <div
                  key={`${session.loggedInAt}-${index}`}
                  className="space-y-2 px-4 py-4 text-sm"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="capitalize text-gray-400">
                      {t("profile.deviceInfo")}:{" "}
                      {session.deviceCategory || t("profile.defaultDevice")}
                    </p>
                    <p className="font-semibold text-white">
                      {formatLoginDate(session.loggedInAt)}
                    </p>
                  </div>
                  <div className="text-gray-400">
                    {t("profile.browser")}:{" "}
                    {session.browser || t("profile.unknownBrowser")}
                  </div>
                  <div className="text-gray-400">
                    {t("profile.operatingSystem")}:{" "}
                    {session.operatingSystem || t("profile.unknownOS")}
                  </div>
                  <div className="break-all font-mono text-gray-300">
                    {t("profile.ipAddress")}:{" "}
                    {session.ipAddress || t("profile.unknownIp")}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Editprofile
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
};

export default ProfilePage;
