import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken } from "@/services/auth";
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
      const token = await getToken();
      if (!token) return;

      const count = await getUnreadCount(token);
      setUnreadCount(count);
    } catch (error: any) {
      // Verifica si el error es de tipo Axios y es un 401
      if (error.response?.status === 401) {
        console.warn("Token expirado, omitiendo refreshUnreadCount");
        return;
      }

      console.error("Error actualizando contador de notificaciones", error);
      setUnreadCount(0);
    }
  };

  // Refresco automático cada 30 segundos
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const setup = async () => {
      const token = await getToken();
      if (!token) return; // Si no hay sesión, no se configura el intervalo

      await refreshUnreadCount(); // carga inicial
      interval = setInterval(() => {
        refreshUnreadCount();
      }, 30000);
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
