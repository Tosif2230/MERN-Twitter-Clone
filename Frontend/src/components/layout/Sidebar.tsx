import TwitterLogo from "../TwitterLogo";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Bell,
  Bookmark,
  ChevronLeft,
  CreditCard,
  Home,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../language/LanguageSelector";
import { cn } from "@/src/lib/utils";

const Sidebar = ({
  currentPage = "home",
  onNavigate,
  onClose,
  isMobile = false,
}: any) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const isCompact = !isMobile;

  const navigation = [
    {
      name: t("sidebar.home"),
      icon: Home,
      current: currentPage === "home",
      page: "home",
    },
    {
      name: t("sidebar.explore"),
      icon: Search,
      current: currentPage === "explore",
      page: "explore",
    },
    {
      name: t("sidebar.notifications"),
      icon: Bell,
      current: currentPage === "notifications",
      page: "notifications",
      badge: true,
    },
    {
      name: t("sidebar.messages"),
      icon: Mail,
      current: currentPage === "messages",
      page: "messages",
    },
    {
      name: t("sidebar.bookmarks"),
      icon: Bookmark,
      current: currentPage === "bookmarks",
      page: "bookmarks",
    },
    {
      name: t("sidebar.subscription"),
      icon: CreditCard,
      current: currentPage === "subscription",
      page: "subscription",
    },
    {
      name: t("sidebar.profile"),
      icon: User,
      current: currentPage === "profile",
      page: "profile",
    },
    {
      name: t("sidebar.more"),
      icon: MoreHorizontal,
      current: currentPage === "more",
      page: "more",
    },
  ];

  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-black px-2",
        isMobile ? "w-72" : "sticky top-0 w-20 lg:w-64",
      )}
    >
      <div className="flex items-center justify-between p-2">
        <TwitterLogo size="lg" className="text-white" />
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-white hover:bg-stone-900"
            onClick={onClose}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
      <nav className="flex-1 px-2">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.page}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-xl py-4 lg:py-6 px-2 rounded-full hover:bg-stone-900 ${
                  item.current ? "font-bold" : "font-normal"
                } text-white hover:text-white`}
                onClick={() => {
                  onNavigate(item.page);
                  if (isMobile && onClose) onClose();
                }}
              >
                <item.icon className="h-7 w-7 mr-4" />
                <span className={cn(isCompact && "hidden lg:inline")}>
                  {item.name}
                </span>
                {item.badge && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    1
                  </span>
                )}
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 px-2 py-2">
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-full text-lg">
            {isCompact ? (
              <Menu className="h-5 w-5 lg:hidden" />
            ) : (
              t("sidebar.post")
            )}
            <span className={cn(isCompact && "hidden lg:inline")}>
              {isCompact ? t("sidebar.post") : ""}
            </span>
          </Button>
        </div>
      </nav>
      {user && (
        <div className="p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-3 h-auto rounded-full hover:bg-stone-900"
              >
                <Avatar className={cn("h-10 w-10", !isCompact && "mr-3")}>
                  <AvatarImage src={user.avatar} alt={user.displayName} />
                  <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "flex-1 text-left",
                    isCompact && "hidden lg:block",
                  )}
                >
                  <div className="text-white font-semibold">
                    {user.displayName}
                  </div>
                  <div className="text-gray-400 text-sm">@{user.userName}</div>
                </div>
                <MoreHorizontal
                  className={cn(
                    "h-5 w-5 text-gray-400",
                    isCompact && "hidden lg:block",
                  )}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-gray-800 bg-black">
              <DropdownMenuItem className="text-white hover:bg-gray-900">
                <Settings className="mr-2 h-4 w-4" />
                {t("sidebar.settings")}
              </DropdownMenuItem>
              <LanguageSelector type="dropdownMenu" />
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem
                className="text-white hover:bg-gray-900"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("sidebar.logout", { username: user.userName })}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
