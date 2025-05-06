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
    <head></head>
    <body>
      <div class="header">
        <div class="header-left">
        <h2>${
          source === "report" ? "REPORTE DE FALLO" : "FALLO AUTOGENERADO"
        } #${report.detail_id} (${report.status})</h2>
          <div>
            <strong>Generado por:</strong> <br/>${user.name} ${
    user.first_last_name
  }
            <br/><strong>Fecha:</strong> ${new Date().toLocaleString()}
          </div>
        </div>
        <div class="header-right">
          <div class="logo">
            <img src="https://firebasestorage.googleapis.com/v0/b/disriego-442ff.firebasestorage.app/o/uploads%2Flogos%2Flogo.png?alt=media&token=92730c47-e5a0-4cfb-a1d4-711ee69e27cf" width="170" />
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
        <div class="section-title">Datos del reporte</div>
        <table class="custom-table">
          <tr><th>ID Reporte</th><td>${report.detail_id}</td></tr>
          <tr><th>Estado</th><td>${report.status}</td></tr>
          <tr><th>Fecha del reporte</th><td>${report.report_date}</td></tr>
          <tr><th>Fecha de asignación</th><td>${
            report.assignment_date
          }</td></tr>
          <tr><th>Fecha de finalización</th><td>${
            report.finalization_date || "No finalizado"
          }</td></tr>
        </table>

        <div class="section-title">Fallo reportado por el usuario</div>
        <table class="custom-table">
          <tr><th>Tipo de fallo</th><td>${report.failure_type_report}</td></tr>
          <tr><th>Descripción</th><td>${report.description_failure}</td></tr>
        </table>

        <div class="section-title">Ubicación</div>
        <table class="custom-table">
          <tr><th>Predio</th><td>${report.property_name} (#${
    report.property_id
  })</td></tr>
          <tr><th>Latitud predio</th><td>${report.property_latitude}</td></tr>
          <tr><th>Longitud predio</th><td>${report.property_longitude}</td></tr>
          <tr><th>Lote</th><td>${report.lot_name} (#${report.lot_id})</td></tr>
          <tr><th>Latitud lote</th><td>${report.lot_latitude}</td></tr>
          <tr><th>Longitud lote</th><td>${report.lot_longitude}</td></tr>
        </table>

        <div class="section-title">Usuario que reportó</div>
        <table class="custom-table">
          <tr><th>Nombre</th><td>${report.owner_name}</td></tr>
          <tr><th>Email</th><td>${report.owner_email}</td></tr>
          <tr><th>Documento</th><td>${report.owner_document}</td></tr>
          <tr><th>Teléfono</th><td>${report.owner_phone}</td></tr>
        </table>

        <div class="section-title">Revisión técnica</div>
        <table class="custom-table">
          <tr><th>Nombre del técnico</th><td>${report.technician_name}</td></tr>
          <tr><th>Documento</th><td>${report.technician_document}</td></tr>
          <tr><th>Fallo confirmado</th><td>${
            report.failure_type_detail
          }</td></tr>
          <tr><th>Observaciones del técnico</th><td>${
            report.fault_remarks
          }</td></tr>
        </table>

        <div class="section-title">Solución aplicada</div>
        <table class="custom-table">
          <tr><th>Tipo de mantenimiento</th><td>${
            report.type_maintenance_name
          }</td></tr>
          <tr><th>Tipo de solución</th><td>${report.solution_name}</td></tr>
          <tr><th>Observaciones</th><td>${report.solution_remarks}</td></tr>
        </table>
    </body>

    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
      .header { display: flex; justify-content: space-between; align-items: center; background-color: #F2F2F7; padding: 20px 35px; color: #292929; }
      .generateby { color: #595959; font-size: 13px; }
      .section-title { font-weight: bold; font-size: 18px; margin-top: 20px; margin-bottom: 5px; color: #292929; }
      .container { padding: 10px 35px 35px; }
      .custom-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .custom-table th, .custom-table td {
        border: 1px solid #ccc;
        padding: 10px;
        text-align: left;
        font-size: 14px;
        color: #595959;
      }
      .custom-table th { background-color: #F2F2F7; font-weight: bold; }
    </style>
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
