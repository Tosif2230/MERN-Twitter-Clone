"use client";

import { Search } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTranslation } from "react-i18next";

const suggestions = [
  {
    id: "1",
    username: "sundarpichai",
    displayName: "Sundar Pichai",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgp4qIL8CFf3EnxyBSy_XtfTJtyFcTjgqFhTyYChGvvRN84E2vKKDDMYqjmYdmG-wz9imNa51bvpxLdZnsI5nfYO9kCzLYwBAqKXeLxyU&s=10",
    verified: true,
  },
  {
    id: "2",
    username: "akshaykumar",
    displayName: "Akshay Kumar",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtwLb9AB8202TdJiNi-6FECamws9TrFhBN4AARfOVl__H5WJ0upmUImS-QYDFGGm8DbBnzI9NXzJxdTiFE3TAhJaZAuegoAV62MQSnWozQ&s=10",
    verified: true,
  },
  {
    id: "3",
    username: "rashtrapatibhvn",
    displayName: "President of India",
    avatar:
      "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEw8eC36g_V4j0JohhCJ2GE7z1RC8g92wW5lr-e309XJAKqHf3qA_v5ULlY15Qw1ipJ6d42f6qjZIeTo-X-giL8c1EOpYE2cyaYH9bJseV5YO_IPdsBdBWLdtr_Dfyhu-f0-SM=w270-h312-n-k-no",
    verified: true,
  },
];

export default function RightSidebar() {
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 w-full max-w-[20rem] space-y-2">
      {/* Search */}
      <div className="sticky top-2 z-50 w-full space-y-4 bg-black">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder={t("rightSidebar.search")}
          className="pl-12 bg-black border-gray-800 text-white placeholder-gray-400 rounded-full py-5"
        />
      </div>
      {/* Subscribe to Premium */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-4 ">
          <h3 className="text-white text-xl font-bold mb-2">
            {t("rightSidebar.premiumTitle")}
          </h3>
          <p className="mb-4 text-sm text-gray-400">
            {t("rightSidebar.premiumText")}
          </p>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full">
            {t("rightSidebar.subscribe")}
          </Button>
        </CardContent>
      </Card>
      {/* Who to follow */}
      <Card className="bg-black border-gray-800">
        <CardContent className="p-4">
          <h3 className="text-xl font-bold mb-4 text-white">{t("rightSidebar.likeTitle")}</h3>
          <div className="space-y-4">
            {suggestions.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between hover:bg-stone-950 rounded"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.displayName} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="text-white font-semibold">
                        {user.displayName}
                      </span>
                      {user.verified && (
                        <div className="bg-blue-500 rounded-full p-0.5">
                          <svg
                            className="h-3 w-3 text-white fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-gray-400 text-sm">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="bg-white text-black hover:bg-gray-200 font-semibold rounded-full px-4"
                >
                  {t("rightSidebar.follow")}
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="text-blue-400 hover:text-blue-300 p-0 mt-4 hover:bg-transparent "
          >
            {t("rightSidebar.showMore")}
          </Button>
        </CardContent>
      </Card>
      {/* Footer */}
      <div className="p-4 text-xs text-gray-500 space-y-2">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <a href="#" className="hover:underline">
            {t("rightSidebar.terms")}
          </a>
          <a href="#" className="hover:underline">
            {t("rightSidebar.privacy")}
          </a>
          <a href="#" className="hover:underline">
            {t("rightSidebar.cookie")}
          </a>
          <a href="#" className="hover:underline">
            {t("rightSidebar.accessibility")}
          </a>
          <a href="#" className="hover:underline">
            {t("rightSidebar.ads")}
          </a>
        </div>
        <div>© 2026 X Corp.</div>
      </div>
    </div>
  );
}
