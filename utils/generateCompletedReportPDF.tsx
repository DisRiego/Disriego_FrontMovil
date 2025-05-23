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

      /* Two columns for first two sections */
      .sections-row {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
      }
      .section {
        flex: 1;
      }
      .section h2 {
        margin: 0 0 10px;
        padding: 8px 0px;
        background-color: #fff;
        font-size: 20px;
        color: #222;
      }

      /* Base table styles */
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        text-align: left;
        padding: 8px 12px;
        border: 1px solid #ddd;
        font-size: 14px;
      }
      th {
        background-color: #f5f7fa;
        font-weight: 600;
      }

      /* Predio and lote tables: no vertical borders, zebra striping */
      .sections-row table th,
      .sections-row table td {
        border: none;
      }
      .sections-row table tbody tr:nth-child(odd) {
        background-color: #f5f7fa;
      }
      .sections-row table tbody tr:nth-child(even) td {
        background-color: #fff;
      }

      /* Owner and failure tables: remove separators from header cells only */
      .owner-info thead th,
      .failure-info thead th {
        border: none;
      }
      .owner-info thead th,
      .revision-tecnica thead th {
        border: none;
      }
      .owner-info thead th,
      .solucion-aplicada thead th {
        border: none;
      }
      /* Footer 
      .footer {
        position: relative; /* ya no fijo 
        margin: 40px 0; /* separa del contenido 
        display: flex;
        justify-content: space-between;
        align-items: center;
        page-break-inside: avoid; /* que no se “corte” 
      }
      /*
      .footer-logo {
        width: 150px;
        height: auto;
      }*/
      .page-number {
        font-size: 14px;
        color: #000;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="header-left">
        <h2>
          ${source === "report" ? "REPORTE DE FALLO" : "FALLO AUTOGENERADO"}
          #${report.detail_id} (${report.status})
        </h2>
        <div class="meta">
          <strong>Fecha de generación:</strong>
          ${new Date().toLocaleString()}
        </div>
        <div class="meta">
          <strong>Generado por:</strong>
          ${user.name} ${user.first_last_name}
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

    <div class="sections-row">
      <div class="section">
        <h2>Información del predio</h2>
        <table>
          <thead>
            <tr>
              <th>Campo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ID predio</td>
              <td>${report.property_id}</td>
            </tr>
            <tr>
              <td>Nombre del predio</td>
              <td>${report.property_name}</td>
            </tr>
            <tr>
              <td>Ubicación (latitud, longitud)</td>
              <td>${report.property_latitude}, ${report.property_longitude}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="section">
        <h2>Información del lote</h2>
        <table>
          <thead>
            <tr>
              <th>Campo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ID del lote</td>
              <td>${report.lot_id}</td>
            </tr>
            <tr>
              <td>Nombre del lote</td>
              <td>${report.lot_name}</td>
            </tr>
            <tr>
              <td>Ubicación (latitud, longitud)</td>
              <td>${report.lot_latitude}, ${report.lot_longitude}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="section owner-info">
      <h2>Información del dueño</h2>
      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nombre</td>
            <td>${report.owner_name}</td>
          </tr>
          <tr>
            <td>Documento</td>
            <td>${report.owner_document}</td>
          </tr>
          <tr>
            <td>Correo</td>
            <td>${report.owner_email}</td>
          </tr>
          <tr>
            <td>Teléfono</td>
            <td>${report.owner_phone}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <br />
    <div class="section failure-info">
      <h2>Información del fallo reportado</h2>
      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Posible fallo</td>
            <td>${report.failure_type_report}</td>
          </tr>
          <tr>
            <td>Observaciones</td>
            <td>${report.description_failure}</td>
          </tr>
          <tr>
            <td>Fecha de generación del reporte</td>
            <td>${report.report_date}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <br />
    <div class="section revision-tecnica">
      <h2>Información del fallo encontrado por el técnico</h2>
      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tipo de fallo</td>
            <td>${report.failure_type_detail}</td>
          </tr>
          <tr>
            <td>Observaciones</td>
            <td>${report.fault_remarks}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <br />
    <div class="section solucion-aplicada">
      <h2>Información de la solución realizada por el técnico</h2>
      <table>
        <thead>
          <tr>
            <th>Campo</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tipo de mantenimiento</td>
            <td>${report.type_maintenance_name}</td>
          </tr>
          <tr>
            <td>Tipo de solución</td>
            <td>${report.solution_name}</td>
          </tr>
          <tr>
            <td>Fecha de finalización</td>
            <td>${report.finalization_date || "No finalizado"}</td>
          </tr>
          <tr>
            <td>Observaciones</td>
            <td>${report.solution_remarks}</td>
          </tr>
        </tbody>
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
