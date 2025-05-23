import axios from "axios";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import { StorageAccessFramework } from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import { Alert, Platform } from "react-native";
import { API_URL } from "@/services/config";
import { getUserData } from "@/services/auth";
import { getCompanyData } from "@/services/company";
import { fetchLocationNames } from "@/services/location";

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

  const locationNames = await fetchLocationNames(
    company.country,
    company.state,
    company.city
  );

  let lotsHTML = "";
  try {
    const response = await axios.get(`${API_URL}/properties/${id}/lots/`);
    const lots = response.data.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      real_estate_registration_number: item.real_estate_registration_number,
      extension: item.extension,
      latitude: item.latitude,
      longitude: item.longitude,
      cropType: item.nombre_tipo_cultivo || "No disponible",
      paymentInterval: item.nombre_intervalo_pago || "No disponible",
    }));

    if (lots.length > 0) {
      lotsHTML = `
        <div class="section-title">Lotes Asociados al Predio</div>
        <table class="custom-table">
          <thead>
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
          </thead>
          <tbody>
            ${lots
              .map(
                (lot: {
                  id: any;
                  name: any;
                  real_estate_registration_number: any;
                  extension: any;
                  latitude: any;
                  longitude: any;
                  cropType: any;
                  paymentInterval: any;
                }) => `
              <tr>
                <td>${lot.id}</td>
                <td>${lot.name}</td>
                <td>${lot.real_estate_registration_number || "N/A"}</td>
                <td>${lot.extension}</td>
                <td>${lot.latitude}</td>
                <td>${lot.longitude}</td>
                <td>${lot.cropType}</td>
                <td>${lot.paymentInterval}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>`;
    } else {
      lotsHTML = `<div class="section-title">Lotes Asociados al Predio</div>
                  <table class="custom-table">
                    <tr><td colspan="8" style="text-align: center; padding: 12px;">No hay lotes asociados a este predio.</td></tr>
                  </table>`;
    }
  } catch (error) {
    console.error("Error al obtener los lotes:", error);
    lotsHTML = `<div class="section-title">Lotes Asociados al Predio</div>
                <p style="color: #e74c3c; padding: 12px;">Error al cargar los lotes.</p>`;
  }

  const documentNumber = user.document_number || "No disponible";

  const htmlContent = `<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0px 40px;
        color: #333;
      }

      /* Header */
      .header {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 40px 0px 30px;
        margin-bottom: 20px;
      }
      .header::before {
        content: "";
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100vw;
        height: 100%;
        background-color: #f5f7fa;
        z-index: -1;
      }

      .header-left,
      .header-right {
        width: 50%;
        box-sizing: border-box;
        z-index: 1;
      }
      .header-left {
        text-align: left;
      }
      .header-left h2 {
        margin: 0 0 10px;
        font-size: 24px;
        color: #111;
      }
      .meta {
        font-size: 14px;
        color: #333;
        margin: 4px 0;
      }
      .meta strong {
        display: block;
        color: #555;
        font-weight: 600;
      }

      .header-right {
        text-align: right;
      }
      .company-logo img {
        width: 150px;
        height: auto;
        margin-bottom: 10px;
      }
      .company-info {
        font-size: 14px;
        color: #333;
      }
      .company-info div {
        margin: 4px 0;
      }
      .company-info strong {
        display: block;
        color: #555;
        font-weight: 600;
        font-size: 13px;
      }

      .section-title {
        font-weight: bold;
        margin-top: 20px;
        color: #292929;
        font-size: 20px;
      }
      .name-complete {
        color: #595959;
      }
      .owner-info {
        display: flex;
        justify-content: space-between;
        color: #5e6470;
        font-size: 17px;
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
        border-bottom: 1px solid #f0f2f5;
      }

      tr:last-child td {
        border-bottom: none;
      }

      th {
        font-weight: bold;
        background-color: #f5f7fa;
      }
      .container {
        padding-top: 5px;
        padding-left: 0px;
        padding-right: 0px;
        padding-bottom: 35px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="header-left">
        <h2>REPORTE PREDIAL #${id}</h2>
        <div class="meta">
          <strong>Fecha de generación:</strong>
          ${new Date().toLocaleString()}
        </div>
        <div class="meta">
          <strong>Generado por:</strong>
          ${user.name} ${user.first_last_name} ${user.second_last_name || ""}
        </div>
      </div>
      <div class="header-right">
        <div class="company-logo">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/disriego-442ff.firebasestorage.app/o/uploads%2Flogos%2Flogo.png?alt=media&token=92730c47-e5a0-4cfb-a1d4-711ee69e27cf"
            alt="Logo"
          />
        </div>
        <div class="company-info">
          <div>
            <strong>Dirección de la empresa:</strong>
            ${company.address}, ${locationNames.city},
            ${locationNames.department}
          </div>
          <div>
            <strong>Correo electrónico de la empresa:</strong>
            ${company.email}
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="section-title">Datos del dueño</div>
      <div class="owner-info">
        <div class="column">
          <p>
            <strong class="name-complete">Nombre completo</strong
            ><br />${user.name} ${user.first_last_name} ${
    user.second_last_name || ""
  }
          </p>
          <p>
            <strong class="name-complete"> Dirección de correspondencia</strong
            ><br />${user.address || "No disponible"}
          </p>
        </div>
        <div class="column">
          <p>
            <strong class="name-complete">Número de documento</strong
            ><br />${documentNumber}
          </p>
          <p>
            <strong class="name-complete">Teléfono</strong><br />${
              user.phone || "No disponible"
            }
          </p>
        </div>
      </div>

      <div class="section-title">Datos del predio</div>
      <table class="custom-table">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Folio matrícula inmobiliaria</th>
          <th>Extensión</th>
          <th>Latitud</th>
          <th>Longitud</th>
        </tr>
        <tr>
          <td>${id}</td>
          <td>${name}</td>
          <td>${real_estate_registration_number}</td>
          <td>${extension}</td>
          <td>${latitude}</td>
          <td>${longitude}</td>
        </tr>
      </table>

      ${lotsHTML}
    </div>
  </body>
</html>`;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    if (Platform.OS === "android") {
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

        await FileSystem.writeAsStringAsync(
          fileUri,
          await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          }),
          { encoding: FileSystem.EncodingType.Base64 }
        );

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
