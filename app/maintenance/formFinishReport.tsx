import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import DropdownPicker from "@/components/Dropdown";
import { colors } from "@/config/theme";
import Button from "@/components/Button";
import CustomHeader from "@/components/CustomHeader";
import { router, useLocalSearchParams } from "expo-router";
import { typography } from "@/config/typography";
import * as DocumentPicker from "expo-document-picker";
import { Feather, AntDesign } from "@expo/vector-icons";
import { API_URL_MAINT } from "@/services/config";
import { saveFinalizationOffline } from "@/storage/db";
import { getToken } from "@/services/auth";
import { useReports } from "@/context/ReportContext";
import { useMaintenanceOptions } from "@/context/MaintenanceOptionsContext";

interface Option {
  label: string;
  value: string;
}

export default function ReportFailureForm() {
  const params = useLocalSearchParams();
  const { markReportAsPendingSync } = useReports();
  const {
    solutions,
    failureTypes,
    maintenanceTypes,
    fetchMaintenanceOptions,
    fetchSolutionsByMaintenanceType,
    loading,
  } = useMaintenanceOptions();

  const [step, setStep] = useState<number>(1);
  const [tipoFallo, setTipoFallo] = useState<string>("");
  const [observacionFallo, setObservacionFallo] = useState<string>("");
  const [tipoMantenimiento, setTipoMantenimiento] = useState<string>("");
  const [solucion, setSolucion] = useState<string>("");
  const [observacionSolucion, setObservacionSolucion] = useState<string>("");
  const [archivo1List, setArchivo1List] = useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);
  const [archivo2List, setArchivo2List] = useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);
  const [finalizado, setFinalizado] = useState<boolean>(false);

  useEffect(() => {
    fetchMaintenanceOptions();
  }, []);

  const handleTipoMantenimientoChange = async (value: string) => {
    setTipoMantenimiento(value);
    setSolucion("");
    if (value) {
      await fetchSolutionsByMaintenanceType(value);
    }
  };

  const handleFilePick = async (
    setFiles: React.Dispatch<
      React.SetStateAction<DocumentPicker.DocumentPickerAsset[]>
    >
  ) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      multiple: false,
    });

    if (result.assets) {
      const validFile = result.assets.find(
        (f) => (f?.size ?? 0) <= 3 * 1024 * 1024
      );
      if (!validFile) {
        Alert.alert("Archivo inválido", "El archivo debe ser menor a 3MB.");
        return;
      }
      setFiles([validFile]);
    }
  };

  const removeFile = (
    setFiles: React.Dispatch<
      React.SetStateAction<DocumentPicker.DocumentPickerAsset[]>
    >,
    index: number
  ) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (
      !tipoFallo ||
      !observacionFallo ||
      !tipoMantenimiento ||
      !solucion ||
      !observacionSolucion ||
      !finalizado
    ) {
      Alert.alert(
        "Paso incompleto",
        "Por favor, completa todos los campos del paso 2."
      );
      return;
    }

    if (solutions.length === 0) {
      Alert.alert("Espere", "Aún se están cargando las soluciones.");
      return;
    }

    if (archivo1List.length === 0 || archivo2List.length === 0) {
      Alert.alert(
        "Archivos requeridos",
        "Debes subir evidencia del fallo y de la solución antes de finalizar."
      );
      return;
    }

    const solucionId =
      solutions.find((item) => item.label === solucion)?.value || "1";

    console.log("Enviando al backend:", {
      technician_assignment_id: String(params.technicianAssignmentId),
      fault_remarks: observacionFallo,
      type_failure_id: tipoFallo,
      type_maintenance_id: tipoMantenimiento,
      failure_solution_id: solucionId,
      solution_remarks: observacionSolucion,
    });

    const formData = new FormData();
    formData.append(
      "technician_assignment_id",
      String(params.technicianAssignmentId)
    );
    formData.append("fault_remarks", observacionFallo);
    formData.append("type_failure_id", tipoFallo);
    formData.append("type_maintenance_id", tipoMantenimiento);
    formData.append("failure_solution_id", solucionId);
    formData.append("solution_remarks", observacionSolucion);

    if (archivo1List[0]) {
      formData.append("evidence_failure", {
        uri: archivo1List[0].uri,
        name: archivo1List[0].name || "evidencia_fallo.jpg",
        type: archivo1List[0].mimeType || "image/jpeg",
      } as any);
    }

    if (archivo2List[0]) {
      formData.append("evidence_solution", {
        uri: archivo2List[0].uri,
        name: archivo2List[0].name || "evidencia_solucion.jpg",
        type: archivo2List[0].mimeType || "image/jpeg",
      } as any);
    }

    try {
      const token = await getToken();
      const response = await fetch(`${API_URL_MAINT}/maintenance/finalize`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok && result.success) {
        Alert.alert("Éxito", "Mantenimiento finalizado correctamente.");
        router.replace("/maintenance/assignedReports");
      } else {
        throw new Error(result.message || "No se pudo finalizar el reporte.");
      }
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      Alert.alert(
        "Modo offline",
        "No se pudo enviar el reporte. Se guardó para sincronizar más tarde."
      );
      saveFinalizationOffline({
        technician_assignment_id: Number(params.technicianAssignmentId),
        fault_remarks: observacionFallo,
        type_failure_id: Number(tipoFallo),
        type_maintenance_id: Number(tipoMantenimiento),
        failure_solution_id: Number(solucionId),
        solution_remarks: observacionSolucion,
        evidence_failure_uri: archivo1List[0]?.uri || "",
        evidence_solution_uri: archivo2List[0]?.uri || "",
      });
      if (params.reportId) {
        markReportAsPendingSync(Number(params.reportId));
        // Espera brevemente para asegurar que el estado esté actualizado
        setTimeout(() => {
          router.replace("/maintenance/assignedReports");
        }, 100); // 100 ms es suficiente
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Reporte de mantenimiento finalizado"
        backRoute={() => router.replace("/maintenance/assignedReports")}
      />
      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.innerForm}>
          <View style={styles.stepContainer}>
            <View
              style={[
                styles.stepIndicator,
                step === 1 ? {} : { backgroundColor: colors.border },
              ]}
            >
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text
              style={[
                styles.stepTitle,
                step === 1 && { color: colors.primary },
              ]}
            >
              Detalles del fallo
            </Text>
            <View
              style={[
                styles.stepIndicator,
                step === 2 ? {} : { backgroundColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.stepNumber,
                  step !== 2 && { color: colors.darkGray },
                ]}
              >
                2
              </Text>
            </View>
            <Text
              style={[
                styles.stepTitle,
                step === 2 && { color: colors.primary },
              ]}
            >
              Detalles de la solución
            </Text>
          </View>

          {step === 1 && (
            <>
              <Text style={styles.subtitle}>
                Verifica los datos del reporte y sube la evidencia del fallo
                para continuar.
              </Text>

              <View>
                <Text style={styles.label}>Predio afectado</Text>
                <Text style={styles.value}>{params.propertyName}</Text>
              </View>

              <View>
                <Text style={styles.label}>Lote afectado</Text>
                <Text style={styles.value}>{params.lotName}</Text>
              </View>

              <Text style={styles.label}>Fallo detectado</Text>
              <DropdownPicker
                selectedValue={tipoFallo}
                onValueChange={setTipoFallo}
                options={[
                  { label: "Selecciona una opción", value: "" },
                  ...failureTypes,
                ]}
              />

              <Text style={styles.label}>Observaciones del fallo</Text>
              <TextInput
                style={styles.textArea}
                multiline
                placeholder="Describe el fallo observado"
                value={observacionFallo}
                onChangeText={setObservacionFallo}
                maxLength={256}
              />

              <Text style={styles.label}>Evidencia del fallo</Text>
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={() => handleFilePick(setArchivo1List)}
              >
                <Text style={styles.uploadText}>
                  {archivo1List.length > 0
                    ? "1 archivo seleccionado"
                    : "Selecciona un archivo aquí"}
                </Text>
                <Text style={styles.uploadButtonText}>Subir</Text>
              </TouchableOpacity>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 15 }}
              >
                {archivo1List.map((file, index) => (
                  <View
                    key={index}
                    style={{
                      marginRight: 10,
                      position: "relative",
                    }}
                  >
                    <Image
                      source={{ uri: file.uri }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => removeFile(setArchivo1List, index)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "white",
                        borderRadius: 12,
                      }}
                    >
                      <AntDesign
                        name="closecircle"
                        size={20}
                        color={colors.border}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.buttonContainer}>
                <Button text="Siguiente" onPress={() => setStep(2)} />
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.subtitle}>
                Completa los detalles de la solución y adjunta la evidencia
                correspondiente.
              </Text>

              <Text style={styles.label}>Tipo de mantenimiento</Text>
              <DropdownPicker
                selectedValue={tipoMantenimiento}
                onValueChange={handleTipoMantenimientoChange}
                options={maintenanceTypes}
              />

              <Text style={styles.label}>Solución</Text>
              <DropdownPicker
                selectedValue={solucion}
                onValueChange={setSolucion}
                options={solutions}
              />

              <Text style={styles.label}>Observación de la solución</Text>
              <TextInput
                style={styles.textArea}
                multiline
                placeholder="Describe la solución aplicada"
                value={observacionSolucion}
                onChangeText={setObservacionSolucion}
                maxLength={256}
              />

              <Text style={styles.label}>Evidencia de la solución</Text>
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={() => handleFilePick(setArchivo2List)}
              >
                <Text style={styles.uploadText}>
                  {archivo2List.length > 0
                    ? "1 archivo seleccionado"
                    : "Selecciona un archivo aquí"}
                </Text>
                <Text style={styles.uploadButtonText}>Subir</Text>
              </TouchableOpacity>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 15 }}
              >
                {archivo2List.map((file, index) => (
                  <View
                    key={index}
                    style={{
                      marginRight: 10,
                      position: "relative",
                    }}
                  >
                    <Image
                      source={{ uri: file.uri }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => removeFile(setArchivo2List, index)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "white",
                        borderRadius: 12,
                      }}
                    >
                      <AntDesign
                        name="closecircle"
                        size={20}
                        color={colors.border}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFinalizado(!finalizado)}
              >
                <View
                  style={[
                    styles.checkbox,
                    finalizado && styles.checkboxChecked,
                  ]}
                >
                  {finalizado && (
                    <Feather name="check" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  Dar por finalizado el mantenimiento
                </Text>
              </TouchableOpacity>

              <View style={styles.buttonContainer}>
                {finalizado ? (
                  <Button
                    text="Confirmar"
                    onPress={handleSubmit}
                    loading={loading}
                  />
                ) : (
                  <Button text="Volver" onPress={() => setStep(1)} />
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 3,
  },
  innerForm: {
    flex: 1,
    justifyContent: "space-between",
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
    color: colors.gray,
  },
  subtitle: {
    ...typography.regular.large,
    marginBottom: 1,
    color: colors.gray,
  },
  label: {
    marginBottom: 6,
    marginTop: 16,
    ...typography.medium.regular,
    color: colors.gray,
  },
  textArea: {
    height: 90,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
    backgroundColor: colors.white,
    textAlignVertical: "top",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  checkboxChecked: {
    backgroundColor: colors.border,
  },
  checkboxLabel: {
    marginLeft: 10,
    color: colors.gray,
    ...typography.medium.regular,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 22,
  },
  stepIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  stepNumber: {
    color: "white",
    fontWeight: "bold",
  },
  stepTitle: {
    ...typography.medium.regular,
    color: colors.gray,
    marginRight: 10,
  },
  uploadContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    marginTop: 8,
  },
  uploadText: {
    ...typography.medium.regular,
    color: colors.gray,
  },
  uploadButtonText: {
    ...typography.medium.regular,
    color: colors.primary,
  },
  fileName: {
    ...typography.regular.small,
    color: colors.gray,
    marginTop: 4,
    marginLeft: 4,
  },
  value: {
    backgroundColor: "#F6F6F6",
    borderColor: "#BDBDBD",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: colors.darkGray,
    ...typography.regular.medium,
  },
});
