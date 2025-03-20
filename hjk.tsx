import React, { useEffect, useState } from "react";
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import axios from "axios";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { API_URL } from "@/services/config";
import CustomHeader from "@/components/CustomHeader";
import SearchBar from "@/components/SearchBar";
import FilterButton from "@/components/FilterButton";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetailsModal from "@/components/PropertyDetailsModal";

// Expo Print, Sharing, FileSystem
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

// Función para obtener datos del usuario
import { getUserData } from "@/services/auth";

// Interfaces
interface Property {
    id: string;
    name: string;
    real_estate_registration_number: string;
    latitude: string;
    longitude: string;
    extension: string;
}

interface User {
    name: string;          // Nombre
    first_last_name: string;
    address: string;        // Ojo a la ortografía: 'adress' -> 'address'
    document_number: string;
    phone: string;
}

export default function MyProperties() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [searchText, setSearchText] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    // Datos del usuario
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Cargar datos del usuario
        const fetchUser = async () => {
            try {
                const userData = await getUserData();
                if (userData) {
                    const fullName = ${ userData.name } ${ userData.first_last_name || ""
                }.trim();
                setUser({ ...userData, name: fullName });
            }
      } catch (error) {
            console.error("Error cargando usuario", error);
        }
    };

    // Cargar propiedades
    const fetchProperties = async () => {
        try {
            const response = await axios.get(${ API_URL } / properties);
            setProperties(response.data.data as Property[]);
        } catch (error) {
            console.error("Error cargando propiedades", error);
        }
    };

    fetchUser();
    fetchProperties();
}, []);

// Filtrar propiedades según búsqueda
const filteredProperties = properties.filter((property) =>
    [property.name, property.real_estate_registration_number, property.id].some(
        (value) => value && String(value).toLowerCase().includes(searchText.toLowerCase())
    )
);

// Abrir/Cerrar Modal
const openModal = (property: Property) => {
    setSelectedProperty(property);
    setModalVisible(true);
};

const closeModal = () => {
    setSelectedProperty(null);
    setModalVisible(false);
};

// Función para generar PDF
const generatePDF = async () => {
    if (!selectedProperty) return;

    const userName = user ? user.name : "Usuario desconocido";
    const userDocument = user?.document_number || "Sin documento";
    const userAddress = user?.address || "Sin dirección";
    const userPhone = user?.phone || "Sin teléfono";

    // Aquí, podrías obtener el número de lotes si lo tuvieras:
    const numberOfLots = 0; // Ejemplo estático. Reemplaza con tu lógica.

    // Nombre del archivo, reemplazando espacios del nombre de la propiedad
    const propertyFileName = selectedProperty.name.replace(/\s+/g, "_");

    // Construimos el HTML
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #333;
              margin-bottom: 20px;
            }
            .info-line {
              margin-bottom: 8px;
              font-size: 14px;
            }
            .info-line strong {
              width: 170px;
              display: inline-block;
            }
            h2 {
              font-size: 16px;
              margin-top: 20px;
              margin-bottom: 10px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
              font-size: 14px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              text-align: right;
              color: #777;
            }
          </style>
        </head>
        <body>
          <h1>REPORTE PREDIAL</h1>

          <!-- Fecha y usuario que generó el reporte -->
          <div class="info-line">
            <strong>Fecha de generación:</strong> ${new Date().toLocaleString()}
          </div>
          <div class="info-line">
            <strong>Generado por:</strong> ${userName}
          </div>

          <!-- Datos del dueño -->
          <h2>Datos del dueño</h2>
          <div class="info-line">
            <strong>Nombre completo:</strong> ${userName}
            <strong>Número de documento:</strong> ${userDocument}
          </div>
          <div class="info-line">
            <strong>Dirección:</strong> ${userAddress}
            <strong>Teléfono:</strong> ${userPhone}
          </div>

          <!-- Datos del predio -->
          <h2>Datos del predio</h2>
          <table>
            <tr>
              <th>ID</th>
              <th>Nombre del predio</th>
              <th>Folio de matrícula</th>
              <th>Extensión (m²)</th>
              <th>Latitud</th>
              <th>Longitud</th>
              <th>Número de lotes</th>
            </tr>
            <tr>
              <td>${selectedProperty.id}</td>
              <td>${selectedProperty.name}</td>
              <td>${selectedProperty.real_estate_registration_number}</td>
              <td>${selectedProperty.extension}</td>
              <td>${selectedProperty.latitude}</td>
              <td>${selectedProperty.longitude}</td>
              <td>${numberOfLots}</td>
            </tr>
          </table>

          <!-- Pie de página -->
          <div class="footer">
            Página 1 / 1
          </div>
        </body>
      </html>
    `;

    try {
        // Generar el PDF
        const { uri } = await Print.printToFileAsync({ html });
        // Renombrar para que lleve el nombre del predio
        const newFileUri = ${ FileSystem.documentDirectory }reporte_predio_${ propertyFileName }.pdf;
        await FileSystem.moveAsync({ from: uri, to: newFileUri });

        // Compartir el PDF
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(newFileUri);
        } else {
            alert("No se puede compartir el archivo en este dispositivo.");
        }
    } catch (error) {
        console.error("Error generando PDF:", error);
        alert("No se pudo generar el PDF");
    }
};

return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <CustomHeader title="Mis predios y lotes" backRoute="/(tabs)/home" />
                <View style={styles.textContainer}>
                    <Text style={[typography.regular.big, { color: colors.gray }]}>
                        En esta sección podrás visualizar la información de los predios y
                        lotes vinculados a su documento.
                    </Text>
                    <View style={styles.searchContainer}>
                        <SearchBar
                            searchText={searchText}
                            onSearchChange={setSearchText}
                        />
                        <FilterButton onPress={() => console.log("Abrir filtros")} />
                    </View>
                    <View style={styles.formContainer}>
                        {filteredProperties.length > 0 ? (
                            filteredProperties.map((property) => (
                                <PropertyCard
                                    key={property.id}
                                    name={property.name}
                                    id={property.id}
                                    folio={property.real_estate_registration_number}
                                    extension={property.extension}
                                    onPress={() => openModal(property)}
                                />
                            ))
                        ) : (
                            <Text style={typography.regular.medium}>
                                No hay propiedades registradas.
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>

        {selectedProperty && (
            <PropertyDetailsModal
                isVisible={modalVisible}
                onClose={closeModal}
                onDownload={generatePDF}
                {...selectedProperty}
            />
        )}
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.base,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 24,
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: colors.base,
        paddingBottom: 16,
    },
    textContainer: {
        gap: 14,
        width: "100%",
        paddingTop: 10,
        paddingHorizontal: 20,
        alignItems: "flex-start",
    },
    formContainer: {
        gap: 14,
        width: "100%",
        paddingTop: 8,
        alignItems: "stretch",
    },
    searchContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
});