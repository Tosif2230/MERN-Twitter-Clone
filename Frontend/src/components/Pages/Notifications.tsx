import { useAuth } from '@/src/context/AuthContext';
import React, { useState } from 'react'
import { Button } from '../ui/button';
import { Bell, BellOff } from 'lucide-react';

const Notifications = () => {
  const {user} = useAuth();
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  return (
    <div className='min-h-screen'>
       <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-800 text-xl font-bold">
        <h1>Notifications</h1>
        <Button
            variant="ghost"
            size="sm"
            className="p-2 text-white items-center rounded-full bg-transparent hover:bg-transparent"
            onClick={() => setNotificationEnabled((prev: any) => !prev)}
          >
            {notificationEnabled ? (
              <Bell className="text-white" />
            ) : (
              <BellOff className="text-red-500" />
            )}
          </Button>
      </div>
    </div>
  )
}

export default Notifications
