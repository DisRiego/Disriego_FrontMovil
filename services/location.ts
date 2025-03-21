import axios from "axios";

const API_KEY = "SThkSGZBV3Z4amdiSVduRlp0SkE4MEpwMnU4UWhpM2xOdDJERE5uWA==";
const BASE_URL = "https://api.countrystatecity.in/v1";

const headers = { "X-CSCAPI-KEY": API_KEY };

export const getCountries = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/countries`, { headers });
    //console.log("Respuesta de la API:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo países:", error);
    return [];
  }
};

export const getStates = async (countryCode: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/countries/${countryCode}/states`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error("Error obteniendo estados:", error);
    return [];
  }
};

export const getCities = async (countryCode: string, stateCode: string) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/countries/${countryCode}/states/${stateCode}/cities`,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error("Error obteniendo ciudades:", error);
    return [];
  }
};

export const getCountryPhoneCode = async (countryCode: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/countries/${countryCode}`, {
      headers,
    });

    return response.data.phonecode;
  } catch (error) {
    console.error("Error obteniendo código de país:", error);
    return null;
  }
};

export const fetchLocationNames = async (
  countryCode: string,
  stateCode: string,
  cityCode: string
) => {
  try {
    const countryRes = await axios.get(`${BASE_URL}/countries/${countryCode}`, {
      headers,
    });
    const countryName = countryRes.data?.name || "Desconocido";

    const stateRes = await axios.get(
      `${BASE_URL}/countries/${countryCode}/states/${stateCode}`,
      { headers }
    );
    const stateName = stateRes.data?.name || "Desconocido";

    const citiesRes = await axios.get(
      `${BASE_URL}/countries/${countryCode}/states/${stateCode}/cities`,
      { headers }
    );

    const cityName =
      citiesRes.data?.find((city: any) => String(city.id) === String(cityCode))
        ?.name || "Desconocido";

    return { country: countryName, department: stateName, city: cityName };
  } catch (error) {
    console.error("Error obteniendo nombres de ubicación:", error);
    return {
      country: "Desconocido",
      department: "Desconocido",
      city: "Desconocido",
    };
  }
};
