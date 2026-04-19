"use client";
import { useAuth } from "@/src/context/AuthContext";
import React, { useState } from "react";
import LoadingSpinner from "../Loading-spinner";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import ProfilePage from "../ProfilePage";
import Notifications from "../Pages/Notifications";
import Messages from "../Pages/Messages";
import Bookmarks from "../Pages/Bookmarks";
import { Bell, CreditCard, Home, MessagesSquare, User } from "lucide-react";
import TwitterLogo from "../TwitterLogo";
import Subscription from "../Pages/Subscription";

const Mainlayout = ({ children }: any) => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-4xl font-bold mb-4">
            <TwitterLogo />
          </div>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }
  if (!user) {
    return <>{children}</>;
  }
  return (
    <div className="min-h-screen bg-black text-white flex">
      <div className="hidden md:block w-20 lg:w-64 border-r border-gray-800">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
      <main className="flex-1 w-full max-w-3xl mx-auto border-x border-gray-800 px-2 sm:px-4 pb-16 md:pb-0">
        {currentPage === "home" && children}
        {currentPage === "profile" && <ProfilePage />}
        {currentPage === "notifications" && <Notifications />}
        {currentPage === "messages" && <Messages />}
        {currentPage === "bookmarks" && <Bookmarks />}
        {currentPage === "subscription" && <Subscription />}
      </main>
      <div className="hidden xl:block w-80 p-4">
        <RightSidebar />
      </div>

      {/* Mobile Nav Layout  */}
      <div
        className="
        fixed bottom-0 left-0 right-0 
        flex justify-around 
        border-t border-gray-800 
        bg-black p-2 
        md:hidden z-50
      "
      >
        <button className="p-2" onClick={() => setCurrentPage("home")}>
          <Home />
        </button>
        <button className="p-2" onClick={() => setCurrentPage("subscription")}>
          <CreditCard />
        </button>
        <button className="p-2" onClick={() => setCurrentPage("notifications")}>
          <Bell />
        </button>
        <button className="p-2" onClick={() => setCurrentPage("messages")}>
          <MessagesSquare />
        </button>
        <button className="p-2" onClick={() => setCurrentPage("profile")}>
          <User />
        </button>
      </div>
    </div>
  );
};

export default Mainlayout;
