import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "./config";

interface Company {
  name: string;
  nit: number;
  phone: string;
  state: string;
  address: string;
  country: string;
  city: string;
  email: string;
}

export const getCompanyData = async (): Promise<Company | null> => {
  try {
    // Verificar si ya hay datos guardados
    const storedData = await AsyncStorage.getItem("companyData");

    if (storedData) {
      const parsed = JSON.parse(storedData) as Company;

      // Verifica que tenga email antes de usarlo
      if (parsed.email && parsed.email.trim() !== "") {
        return parsed;
      }
    }

    // Si no hay datos válidos, hacer la llamada a la API
    const response = await axios.get(`${API_URL}/my-company/company`);

    if (!response.data?.data)
      throw new Error("Datos de la empresa no encontrados");

    const { name, nit, phone, state, address, country, city, email } =
      response.data.data;

    const companyData: Company = {
      name,
      nit,
      phone,
      state,
      address,
      country,
      city,
      email,
    };

    // Solo guardar si tiene email válido
    if (email && email.trim() !== "") {
      await AsyncStorage.setItem("companyData", JSON.stringify(companyData));
    }

    return companyData;
  } catch (error: any) {
    console.error(
      "Error obteniendo datos de la empresa:",
      error.response?.data || error.message
    );
    return null;
  }
};
