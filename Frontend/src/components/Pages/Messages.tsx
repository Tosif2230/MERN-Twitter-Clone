import { MessageSquare } from "lucide-react";
import React from "react";

const Messages = () => {
  return (
    <div className='min-h-screen'>
       <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-800 text-xl font-bold">
        Messages
        <MessageSquare />
      </div>
    </div>
  );
};

export default Messages;
