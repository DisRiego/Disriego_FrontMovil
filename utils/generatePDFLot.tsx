import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import { StorageAccessFramework } from "expo-file-system";
import { Alert, Platform } from "react-native";
import { getUserData } from "@/services/auth";
import { getCompanyData } from "@/services/company";
import { fetchLocationNames } from "@/services/location";

async function sendDownloadNotification(fileUri: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Descarga completada",
      body: "El reporte de lote se ha guardado en la carpeta Descargas.",
      data: { fileUri },
    },
    trigger: null,
  });
}

export async function generateLotPDF(lotData: {
  propertyId: string; // 🔹 ID del predio
  propertyName: string; // 🔹 Nombre del predio
  name: string;
  id: string;
  real_estate_registration_number: string;
  latitude: string;
  longitude: string;
  extension: string;
  cropType: string;
  paymentInterval: string;
}) {
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

  const documentNumber = user.document_number || "No disponible";
  const {
    propertyId,
    propertyName,
    name,
    id,
    real_estate_registration_number,
    latitude,
    longitude,
    extension,
    cropType,
    paymentInterval,
  } = lotData;

  const htmlContent = `<html>
  <head> </head>
  <body>
    <div class="header">
      <div class="header-left">
        <h2>Reporte del Lote #${id}</h2>
        <div>
          <div>
            <strong>Fecha de generación:</strong> <br/>${new Date().toLocaleString()}
          </div>
          <br />
          <strong>Generado por:</strong> <br/> ${user.name} ${
    user.first_last_name
  }
          ${user.second_last_name || ""}
        </div>
      </div>

      <div class="header-right">
        <div class="logo">
        <img src="${"https://storage.googleapis.com/disriego-442ff.firebasestorage.app/uploads/logos/167ae5d1-ea27-4f4d-aca1-3de9bf198267.jpg"}" alt="Logo" width="80" />
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
          <p>
            <strong class="name-complete">ID predio</strong><br />${propertyId}
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
          <p>
            <strong class="name-complete">Nombre predio</strong
            ><br />${propertyName}
          </p>
        </div>
      </div>

      <div class="section-title">Datos del lote</div>
      <table class="custom-table">
        <tr>
          <th>ID</th>
          <th>Nombre del lote</th>
          <th>Folio matrícula inmobiliaria</th>
          <th>Extensión</th>
          <th>Latitud</th>
          <th>Longitud</th>
          <th>Tipo de cultivo</th>
          <th>Intervalo de pago</th>
        </tr>
        <tr>
          <td>${id}</td>
          <td>${name}</td>
          <td>${real_estate_registration_number}</td>
          <td>${extension}</td>
          <td>${latitude}</td>
          <td>${longitude}</td>
          <td>${cropType}</td>
          <td>${paymentInterval}</td>
        </tr>
      </table>

      <div class="section-title">Dispositivos asociados al lote</div>
      <table class="custom-table">
        <tr>
          <th>Tipo de dispositivo</th>
          <th>Modelo</th>
          <th>Fecha de instalación</th>
          <th>Fecha estimada de mantenimiento</th>
          <th>Estado</th>
        </tr>
        <tr>
          <td>[Medidor]</td>
          <td>[Modelo]</td>
          <td>[dd/mm/aa]</td>
          <td>[dd/mm/aa]</td>
          <td>[Estado]</td>
        </tr>
        <tr>
          <td>[Controlador]</td>
          <td>[Modelo]</td>
          <td>[dd/mm/aa]</td>
          <td>[dd/mm/aa]</td>
          <td>[Estado]</td>
        </tr>
        <tr>
          <td>[Válvula]</td>
          <td>[Modelo]</td>
          <td>[dd/mm/aa]</td>
          <td>[dd/mm/aa]</td>
          <td>[Estado]</td>
        </tr>
      </table>
    </div>
  </body>
  <style>
    body {
      font-family: Arial, sans-serif;
        margin: 0;
  padding: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #F2F2F7;
    padding-top: 35px;
      padding-left: 35px;
      padding-right: 35px;
      padding-bottom: 20px;
      color: #F2F2F7;
      font-size: 17px;
    }
    .header-left {
      display: flex;
      flex-direction: column;
      color: #292929;
      font-size: 17px;
    }
    .header-right {
      text-align: right;
    }
    .generateby {
      color: #595959;
    }
    .logo img {
     display: inline;
     max-width: 100px;
     max-height: 50px;
    }
    .section-title {
      font-weight: bold;
      margin-top: 20px;
      color: #292929;
      font-size: 20;
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
      border-bottom: 1px solid #eaecf0; /* Solo línea horizontal */
    }

    tr:last-child td {
      border-bottom: none; /* Elimina la línea en la última fila */
    }

    th {
      font-weight: bold;
      background-color: #F2F2F7;
    }
    .container {
        padding-top: 5px;
      padding-left: 35px;
      padding-right: 35px;
      padding-bottom: 35px;
    }
  </style>
</html>



`;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    if (Platform.OS === "android") {
      // Solicitar permisos para acceder a la carpeta de Descargas
      const permissions =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert(
          "Permiso denegado",
          "No se pudo acceder a la carpeta Descargas."
        );
        return;
      }

      const fileName = `reporte_lote_${id}.pdf`;
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
