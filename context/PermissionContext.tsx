import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken } from "@/services/auth";
import { jwtDecode } from "jwt-decode";

// Interfaces
interface Permiso {
  id: number;
  name: string;
}

interface Rol {
  id: number;
  name: string;
  permisos: Permiso[];
}

interface DecodedToken {
  rol: Rol[];
}

interface PermissionContextProps {
  permissions: string[];
  hasPermission: (name: string) => boolean;
  isLoaded: boolean; // ← nuevo campo
}

// Contexto
const PermissionContext = createContext<PermissionContextProps>({
  permissions: [],
  hasPermission: () => false,
  isLoaded: false,
});

// Hook
export const usePermission = () => useContext(PermissionContext);

// Provider
export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadPermissions = async () => {
      const token = await getToken();
      if (!token) return;

      try {
        const decoded: DecodedToken = jwtDecode(token);
        const permisos =
          decoded.rol?.flatMap((r) => r.permisos.map((p) => p.name)) || [];
        setPermissions(permisos);
      } catch (error) {
        console.error("Error decodificando permisos:", error);
      } finally {
        setIsLoaded(true); // ← se marca como cargado
      }
    };

    loadPermissions();
  }, []);

  const hasPermission = (name: string) => permissions.includes(name);

  return (
    <PermissionContext.Provider
      value={{ permissions, hasPermission, isLoaded }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
