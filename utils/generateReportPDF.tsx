import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import { StorageAccessFramework } from "expo-file-system";
import { Alert, Platform } from "react-native";
import { getUserData } from "@/services/auth";
import { getCompanyData } from "@/services/company";
import { fetchLocationNames } from "@/services/location";

export async function generateReportPDF(
  report: any,
  source: "report" | "maintenance" = "report"
) {
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

  const htmlContent = `
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px 40px;
        color: #333;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 10px;
      }

      .header-left {
        max-width: 60%;
      }

      .header-left h2 {
        margin: 0;
        color: #1a1a1a;
      }

      .header-left p {
        margin: 5px 0;
        font-size: 14px;
      }

      .header-right {
        text-align: right;
        font-size: 13px;
        color: #555;
      }

      .header-right img {
        width: 90px;
        margin-bottom: 8px;
      }

      .section {
        margin-bottom: 30px;
      }

      .section h3 {
        background-color: #f0f0f0;
        padding: 8px 12px;
        font-size: 16px;
        color: #222;
        margin: 0 0 10px 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th, td {
        text-align: left;
        padding: 8px 12px;
        border: 1px solid #ddd;
        font-size: 14px;
      }

      th {
        background-color: #f9f9f9;
        font-weight: 600;
        width: 35%;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="header-left">
        <h2>${
          source === "report" ? "REPORTE DE FALLO" : "FALLO AUTOGENERADO"
        } #${report.detail_id} (${report.status})</h2>
        <p><strong>Fecha de generación:</strong><br> ${new Date().toLocaleString()}</p>
        <p><strong>Generado por:</strong><br> ${user.name} ${
    user.first_last_name
  }</p>
      </div>
      <div class="header-right">
        <img src="https://firebasestorage.googleapis.com/v0/b/disriego-442ff.firebasestorage.app/o/uploads%2Flogos%2Flogo.png?alt=media&token=92730c47-e5a0-4cfb-a1d4-711ee69e27cf" width="170"/>
        <div>${company.address}<br>${locationNames.city}, ${
    locationNames.department
  }<br>${company.email}</div>
      </div>
    </div>

    <div class="section">
      <h3>Información del predio</h3>
      <table>
        <tr><th>ID predio</th><td>${report.property_id}</td></tr>
        <tr><th>Nombre del predio</th><td>${report.property_name}</td></tr>
        <tr><th>Ubicación</th><td>${report.property_latitude}, ${
    report.property_longitude
  }</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Información del lote</h3>
      <table>
        <tr><th>ID del lote</th><td>${report.lot_id}</td></tr>
        <tr><th>Nombre del lote</th><td>${report.lot_name}</td></tr>
        <tr><th>Ubicación</th><td>${report.lot_latitude}, ${
    report.lot_longitude
  }</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Información del dueño</h3>
      <table>
        <tr><th>Nombre</th><td>${report.owner_name}</td></tr>
        <tr><th>Documento</th><td>${report.owner_document}</td></tr>
        <tr><th>Correo</th><td>${report.owner_email}</td></tr>
        <tr><th>Teléfono</th><td>${report.owner_phone}</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Información del fallo reportado</h3>
      <table>
        <tr><th>Posible fallo</th><td>${report.failure_type_report}</td></tr>
        <tr><th>Observaciones</th><td>${report.description_failure}</td></tr>
        <tr><th>Fecha de generación del reporte</th><td>${
          report.report_date
        }</td></tr>
      </table>
    </div>
  </body>
</html>
`;

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

      const fileName = `reporte_mantenimiento_${report.detail_id}.pdf`;
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
          onPress: () => {
            IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
              data: fileUri,
              flags: 1,
              type: "application/pdf",
            });
          },
        },
        { text: "OK", style: "cancel" },
      ]);
    }
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    Alert.alert("Error", "No se pudo generar el PDF.");
  }
}
