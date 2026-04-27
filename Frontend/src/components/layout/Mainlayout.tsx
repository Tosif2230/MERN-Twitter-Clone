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
import {
  Bell,
  CreditCard,
  Home,
  Menu,
  MessagesSquare,
  User,
  X,
} from "lucide-react";
import TwitterLogo from "../TwitterLogo";
import Subscription from "../Pages/Subscription";
import { Button } from "../ui/button";

const Mainlayout = ({ children }: any) => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsMobileSidebarOpen(false);
  };

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
    <div className="min-h-screen w-full overflow-x-clip bg-black text-white flex">
      <div className="hidden shrink-0 md:block w-20 lg:w-64 border-r border-gray-800">
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      </div>

      {isMobileSidebarOpen && (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/70 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close navigation"
          />
          <div className="fixed left-0 top-0 z-50 h-full md:hidden border-r border-gray-800 bg-black">
            <Sidebar
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onClose={() => setIsMobileSidebarOpen(false)}
              isMobile
            />
          </div>
        </>
      )}

      <main className="min-w-0 flex-1 w-full max-w-3xl border-x border-gray-800 px-2 sm:px-4 pb-16 md:pb-0">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-800 bg-black/95 px-2 py-2 backdrop-blur md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
            className="rounded-full text-white hover:bg-stone-900"
            aria-label="Toggle sidebar"
          >
            {isMobileSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <TwitterLogo size="sm" className="text-white" />
          <div className="h-9 w-9" />
        </div>

        {currentPage === "home" && children}
        {currentPage === "profile" && <ProfilePage />}
        {currentPage === "notifications" && <Notifications />}
        {currentPage === "messages" && <Messages />}
        {currentPage === "bookmarks" && <Bookmarks />}
        {currentPage === "subscription" && <Subscription />}
      </main>

      <div className="hidden shrink-0 xl:block w-[320px] p-4">
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
        <button className="p-2" onClick={() => handleNavigate("home")}>
          <Home />
        </button>
        <button className="p-2" onClick={() => handleNavigate("subscription")}>
          <CreditCard />
        </button>
        <button className="p-2" onClick={() => handleNavigate("notifications")}>
          <Bell />
        </button>
        <button className="p-2" onClick={() => handleNavigate("messages")}>
          <MessagesSquare />
        </button>
        <button className="p-2" onClick={() => handleNavigate("profile")}>
          <User />
        </button>
      </div>
    </div>
  );
};

export default Mainlayout;
