import axios from "axios";
import { API_URL } from "@/services/config";

const NOTIF_ENDPOINT = `${API_URL}/users/notifications/`;

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  fecha: string;
  estado: "leida" | "no_leida";
}

// Obtener notificaciones y cantidad no leídas
export const fetchNotifications = async (
  token: string
): Promise<{ notifications: Notificacion[]; unreadCount: number }> => {
  if (!token) throw new Error("Token no proporcionado");

  const res = await axios.get(NOTIF_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.data?.success) {
    throw new Error("Respuesta inesperada del backend");
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
export const markAllAsRead = async (token: string) => {
  return axios.post(
    `${NOTIF_ENDPOINT}mark-read`,
    { mark_all: true },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Marcar una o varias notificaciones como leídas
export const markAsRead = async (
  token: string,
  notificationIds: number[]
): Promise<void> => {
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
export const getUnreadCount = async (token: string): Promise<number> => {
  const res = await axios.get(`${NOTIF_ENDPOINT}unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Respuesta /unread-count:", res.data);
  return res.data.count;
};
