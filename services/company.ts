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
}

export const getCompanyData = async (): Promise<Company | null> => {
    try {
        // Revisar si los datos ya están en AsyncStorage
        const storedData = await AsyncStorage.getItem("companyData");
        if (storedData) {
            return JSON.parse(storedData) as Company;
        }

        // Llamar a la API sin token
        const response = await axios.get(`${API_URL}/my-company/company`);

        if (!response.data?.data)
            throw new Error("Datos de la empresa no encontrados");

        // Filtrar solo los campos necesarios
        const { name, nit, phone, state, address, country, city } =
            response.data.data;
        const companyData: Company = {
            name,
            nit,
            phone,
            state,
            address,
            country,
            city,
        };

        // Guardar en AsyncStorage
        await AsyncStorage.setItem("companyData", JSON.stringify(companyData));

        return companyData;
    } catch (error: any) {
        console.error(
            "Error obteniendo datos de la empresa:",
            error.response?.data || error.message
        );
        return null;
    }
};