

export const API_URL = "http://192.168.1.8:8000";
// Configuración de endpoints de la API

// --- DESARROLLO LOCAL ---
// Si trabajas en local, reemplaza "ip" por tu IP local y asegúrate de que el backend esté corriendo.
// export const API_URL = "http://ip:port";           // API general
// export const API_URL_IOT = "http://ip:port";       // API de IoT
// export const API_URL_MAINT = "http://ip:port";     // API de mantenimiento

// --- PRODUCCIÓN ---
// Si trabajas conectado a la nube (onrender), utiliza las siguientes URLs:
//export const API_URL = "https://disriego-backend.onrender.com";        // API general
//export const API_URL_IOT = "https://backend-iot-2377.onrender.com";    // API de IoT
//export const API_URL_MAINT = "";                                     // API de mantenimiento

export const API_FRONT = "https://disriegos.vercel.app"; // Frontend de producción
