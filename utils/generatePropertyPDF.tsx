import axios from "axios";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import { StorageAccessFramework } from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { Alert, Platform } from "react-native";
import { API_URL } from "@/services/config";
import { getUserData } from "@/services/auth"; // Obtener datos del usuario
import { getCompanyData } from "@/services/company"; // Obtener datos de la empresa
import { fetchLocationNames } from "@/services/location"; // Obtener nombres de país, estado y ciudad
import { Image } from "react-native";

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
  const {
    id,
    name,
    real_estate_registration_number,
    latitude,
    longitude,
    extension,
  } = propertyData;

  // Obtener datos del dueño
  const user = await getUserData();
  if (!user) {
    Alert.alert("Error", "No se pudo obtener la información del usuario.");
    return;
  }
  const company = await getCompanyData();
  if (!company) {
    Alert.alert("Error", "No se pudo obtener la información de la empresa.");
    return;
  }
  // Obtener los nombres de país, estado y ciudad a partir de los códigos
  const locationNames = await fetchLocationNames(
    company.country,
    company.state,
    company.city
  );

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
              ${lots
                .map(
                  (lot) => `
                <tr>
                  <td>${lot.id}</td>
                  <td>${lot.name}</td>
                  <td>${lot.real_estate_registration_number || "N/A"}</td>
                  <td>${lot.extension}</td>
                  <td>${lot.latitude}</td>
                  <td>${lot.longitude}</td>
                  <td>${lot.cropType || "No disponible"}</td>
                  <td>${lot.paymentInterval || "No disponible"}</td>
                </tr>`
                )
                .join("")}
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
    <title>Reporte Predial</title>
    <style>
        body {
            font-family: Roboto;
            padding:0px;
            margin:0px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #F2F2F7;
            padding: 0px;
            font-size: 17px;
        }

        .header-left {
            display: flex;
            flex-direction: column;
            color: #292929;
            font-size: 17px;
            padding: 35px;
        }

        .header-right {
            text-align: right;
            padding: 35px;
        }

        .generateby {
            color: #595959;
        }

        .logo img {
            display: block;
            margin-bottom: 10px;
            height: 50px;
        }

        .section-title {
            font-weight: bold;
            margin-top: 20px;
            color: #292929;
            font-size: 20px;
        }

        .owner-info {
            display: flex;
            justify-content: space-between;
            color: #5e6470;
            font-size: 17px;
        }
        
        .owner-info strong {
            color: #595959;
        }
        .column {
            width: 48%;
        }

        .custom-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgb(234, 236, 240);
        }

        th,
        td {
            padding: 10px;
            text-align: left;
            background-color: #ffffff;
            color: #595959;
            border-bottom: 1px solid #eaecf0;
        }

        tr:last-child td {
            border-bottom: none;
        }

        th {
            font-weight: bold;
            background-color: #F2F2F7;
        }

        .container {
            padding: 35px;
        }
    </style>
</head>

<body>

    <!-- CABECERA -->
    <div class="header">
        <div class="header-left">
            <h2>REPORTE PREDIAL #${id}</h2>
            <div>
                <strong>Fecha de generación:</strong> <br />${new Date().toLocaleString()}
                <br /><br />
                <strong>Generado por:</strong><br />
                ${user.name} ${user.first_last_name} ${
    user.second_last_name || ""
  }
            </div>
        </div>
        <div class="header-right">
            <div class="logo">
                <img src="https://storage.googleapis.com/disriego-442ff.firebasestorage.app/uploads/logos/167ae5d1-ea27-4f4d-aca1-3de9bf198267.jpg" 
                     alt="Logo Empresa" />
            </div>
            <div class="generateby">
                ${locationNames.city}, ${locationNames.department}, ${
    locationNames.country
  }<br />
                ${company.address}<br />
                ${company.phone}<br />
                ${company.nit}
            </div>
        </div>
    </div>

    <div class="container">

        <!-- DATOS DEL DUEÑO -->
        <div class="section-title">Datos del Dueño</div>
        <div class="owner-info">
            <div class="column">
                <p><strong>Nombre completo:</strong><br />${user.name} ${
    user.first_last_name
  } ${user.second_last_name || ""}</p>
                <p><strong>Dirección de correspondencia:</strong><br />${
                  user.address || "No disponible"
                }</p>
            </div>
            <div class="column">
                <p><strong>Número de documento:</strong><br />${
                  user.document_number || "No disponible"
                }</p>
                <p><strong>Teléfono:</strong><br />${
                  user.phone || "No disponible"
                }</p>
            </div>
        </div>

        <!-- DATOS DEL PREDIO -->
        <div class="section-title">Datos del Predio</div>
        <table class="custom-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Folio Matrícula</th>
                    <th>Latitud</th>
                    <th>Longitud</th>
                    <th>Extensión (m²)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${id}</td>
                    <td>${name}</td>
                    <td>${real_estate_registration_number}</td>
                    <td>${latitude}</td>
                    <td>${longitude}</td>
                    <td>${extension}</td>
                </tr>
            </tbody>
        </table>

        <!-- LOTES ASOCIADOS -->
        <table class="custom-table">
            <tbody>
                ${lotsHTML}
            </tbody>
        </table>

    </div>

</body>

</html>

`;

  try {
    // Generar el PDF temporalmente
    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    if (Platform.OS === "android") {
      // Solicitar permisos para guardar en Descargas
      const permissions =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert(
          "Permiso denegado",
          "No se pudo acceder a la carpeta Descargas."
        );
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
          await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          }),
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
