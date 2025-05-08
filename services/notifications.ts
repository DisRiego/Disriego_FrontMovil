import axios from "axios";
import { API_URL } from "@/services/config";
import { getToken } from "@/services/auth";

const NOTIF_ENDPOINT = `${API_URL}/users/notifications/`;

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  estado: "leida" | "no_leida";
}

// Obtener notificaciones y cantidad no leídas
export const fetchNotifications = async (): Promise<{
  notifications: Notificacion[];
  unreadCount: number;
}> => {
  const token = await getToken();
  if (!token) {
    console.warn("Token ausente o expirado en fetchNotifications");
    return { notifications: [], unreadCount: 0 };
  }

  const res = await axios.get(NOTIF_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.data?.success) {
    console.warn("Respuesta inesperada en fetchNotifications");
    return { notifications: [], unreadCount: 0 };
  }

  const notifications: Notificacion[] = res.data.data.map((n: any) => ({
    id: n.id,
    titulo: n.title,
    mensaje: n.message,
    fecha: new Date(n.created_at).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    estado: n.read ? "leida" : "no_leida",
  }));

  return {
    notifications,
    unreadCount: res.data.count,
  };
};

// Marcar TODAS las notificaciones como leídas
export const markAllAsRead = async (): Promise<void> => {
  const token = await getToken();
  if (!token) {
    console.warn("Token ausente o expirado en markAllAsRead");
    return;
  }

  await axios.post(
    `${NOTIF_ENDPOINT}mark-read`,
    { mark_all: true },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Marcar una o varias notificaciones como leídas
export const markAsRead = async (notificationIds: number[]): Promise<void> => {
  const token = await getToken();
  if (!token) {
    console.warn("Token ausente o expirado en markAsRead");
    return;
  }

  await axios.post(
    `${NOTIF_ENDPOINT}mark-read`,
    {
      mark_all: false,
      notification_ids: notificationIds,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Obtener solo el contador
export const getUnreadCount = async (): Promise<number> => {
  const token = await getToken();
  if (!token) {
    console.warn("Token ausente o expirado en getUnreadCount");
    return 0;
  }

  const res = await axios.get(`${NOTIF_ENDPOINT}unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data.count;
};
