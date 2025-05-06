import React, { createContext, useContext, useEffect, useState } from "react";
import { getUnreadCount } from "@/services/notifications";

interface NotificationContextProps {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps>({
  unreadCount: 0,
  refreshUnreadCount: async () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUnreadCount = async () => {
    try {
      const count = await getUnreadCount(); // Ya no se pasa token
      setUnreadCount(count);
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn("Token expirado, omitiendo refreshUnreadCount");
        return;
      }

      console.warn("Error actualizando contador de notificaciones", error);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const setup = async () => {
      try {
        await refreshUnreadCount(); // carga inicial
        interval = setInterval(refreshUnreadCount, 30000);
      } catch {
        console.warn("No se pudo iniciar el refresco de notificaciones.");
      }
    };

    setup();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
