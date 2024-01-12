import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  console.log("child",children)
  const [notifications, setNotifications] = useState([
    // ... initial notifications
  ]);

  // Add logic to modify notifications if necessary

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
