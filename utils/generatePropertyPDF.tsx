import axios from "axios";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import { StorageAccessFramework } from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { Alert, Platform } from "react-native";
import { API_URL } from "@/services/config";
import { getUserData } from "@/services/auth"; // Obtener datos del usuario

import { Image } from 'react-native';


async function sendDownloadNotification(fileUri: string) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Descarga completada",
            body: "El archivo PDF se ha guardado en la carpeta Descargas.",
            data: { fileUri },
        },
        trigger: null,
    });
}

export async function generatePropertyPDF(propertyData: {
    id: string;
    name: string;
    real_estate_registration_number: string;
    latitude: string;
    longitude: string;
    extension: string;
}) {
    const { id, name, real_estate_registration_number, latitude, longitude, extension } = propertyData;

    // Obtener datos del dueño
    const user = await getUserData();
    if (!user) {
        Alert.alert("Error", "No se pudo obtener la información del usuario.");
        return;
    }

    // Obtener los lotes del predio
    let lotsHTML = "";
    try {
        const response = await axios.get(`${API_URL}/properties/${id}/lots/`);
        const lots: Array<{
            id: string;
            name: string;
            real_estate_registration_number?: string;
            extension: string;
            latitude: string;
            longitude: string;
            cropType?: string;
            paymentInterval?: string;
        }> = response.data.data || [];

        if (lots.length > 0) {
            lotsHTML = `
            <div class="section-title">Lotes Asociados al Predio</div>
            <table class="custom-table">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Matrícula</th>
                <th>Extensión (m²)</th>
                <th>Latitud</th>
                <th>Longitud</th>
                <th>Tipo de Cultivo</th>
                <th>Intervalo de Pago</th>
              </tr>
              ${lots.map(lot => `
                <tr>
                  <td>${lot.id}</td>
                  <td>${lot.name}</td>
                  <td>${lot.real_estate_registration_number || "N/A"}</td>
                  <td>${lot.extension}</td>
                  <td>${lot.latitude}</td>
                  <td>${lot.longitude}</td>
                  <td>${lot.cropType || "No disponible"}</td>
                  <td>${lot.paymentInterval || "No disponible"}</td>
                </tr>`).join("")}
            </table>`;
        } else {
            lotsHTML = "<p>No hay lotes asociados a este predio.</p>";
        }
    } catch (error) {
        console.error("Error al obtener los lotes:", error);
        lotsHTML = "<p>Error al cargar los lotes.</p>";
    }

    // Contenido HTML del PDF
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte del Lote</title>
    <style>
        body {
            font-family: roboto;
            padding: 40px;
            background-color:rgb(255, 255, 255);
        }

        h2 {
            color: #000000;
            margin-bottom: 10px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        .company-info {
            text-align: right;
            font-size: 14px;
            color: #070707;
        }

        .company-info img {
            height: 50px;
            margin-bottom: 5px;
        }

        .section-title {
            font-weight: bold;
            font-size: 18px;
            margin-top: 20px;
            color: #000000;
            padding-bottom: 5px;
        }


        .info-content {
            display: flex;
            flex-wrap: wrap;
        }

        .info-content div {
            width: 50%;
            margin-bottom: 10px;
        }

        .info-content strong {
            color: #000000;
        }

        .custom-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            background: white;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-size: 14px;
        }

        th {
            background-color: #EAECF0;
            color: black;
        }
    </style>
</head>

<body>

    <!-- CABECERA -->
    <div class="header">
        <div>
            <h2>REPORTE PREDIAL #${id}</h2>
            <p><strong>Fecha de generación<br></strong> ${new Date().toLocaleString()}</p>
            <p><strong>Generado por<br></strong> ${user.name} ${user.first_last_name} ${user.second_last_name || ""}</p>
        </div>
        <div class="company-info">
            <Image source={require('@/assets/images/logo.png')} />
            <p>[Dirección de la empresa]</p>
            <p>[Ciudad, Dept. País]</p>
            <p>[Teléfono]</p>
            <p>[Nit]</p>
        </div>
    </div>

    <!-- DATOS DEL DUEÑO -->

    <div class="section-title">Datos del Dueño</div>
    <div class="info-content">
        <div><strong>Nombre completo<br></strong> ${user.name} ${user.first_last_name} ${user.second_last_name ||
        ""}</div>
        <div><strong>Número de documento<br></strong> ${user.document_number || "No disponible"}</div>
        <div><strong>Dirección de correspondencia <br></strong> ${user.address || "No disponible"}</div>
        <div><strong>Teléfono<br></strong> ${user.phone || "No disponible"}</div>
    </div>


    <!-- DATOS DEL PREDIO -->
    <div class="property-details">
        <div class="section-title">Datos del Predio</div>
        <table class="custom-table">
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Folio Matrícula</th>
                <th>Latitud</th>
                <th>Longitud</th>
                <th>Extensión (m²)</th>
            </tr>
            <tr>
                <td>${id}</td>
                <td>${name}</td>
                <td>${real_estate_registration_number}</td>
                <td>${latitude}</td>
                <td>${longitude}</td>
                <td>${extension}</td>
            </tr>
        </table>
    </div>

    <!-- LOTES ASOCIADOS -->
    <table class="custom-table">
        ${lotsHTML}
    </table>

</body>

</html>
`;


    try {
        // Generar el PDF temporalmente
        const { uri } = await Print.printToFileAsync({ html: htmlContent });

        if (Platform.OS === "android") {
            // Solicitar permisos para guardar en Descargas
            const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permissions.granted) {
                Alert.alert("Permiso denegado", "No se pudo acceder a la carpeta Descargas.");
                return;
            }

            const fileName = `reporte_predio_${id}.pdf`;
            try {
                const fileUri = await StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    fileName,
                    "application/pdf"
                );

                // Guardar el archivo en la carpeta Descargas
                await FileSystem.writeAsStringAsync(
                    fileUri,
                    await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 }),
                    { encoding: FileSystem.EncodingType.Base64 }
                );

                // Enviar notificación de descarga completada
                await sendDownloadNotification(fileUri);

                Alert.alert("Descarga completa", "El PDF se guardó correctamente.", [
                    {
                        text: "Abrir",
                        onPress: async () => {
                            IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
                                data: fileUri,
                                flags: 1,
                                type: "application/pdf",
                            });
                        },
                    },
                    { text: "OK", style: "cancel" },
                ]);
            } catch (error) {
                console.error("Error al guardar el archivo en Descargas:", error);
                Alert.alert("Error", "No se pudo guardar el archivo correctamente.");
            }
        }
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        Alert.alert("Error", "No se pudo generar el PDF.");
    }
}