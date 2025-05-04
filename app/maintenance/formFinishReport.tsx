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

interface Option {
  label: string;
  value: string;
}

export default function ReportFailureForm() {
  const params = useLocalSearchParams();

  const [step, setStep] = useState<number>(1);
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
  const [loading, setLoading] = useState<boolean>(false);
  const [tiposFallo, setTiposFallo] = useState<Option[]>([]); // 🔥 CORREGIDO
  const [solucionesDisponibles, setSolucionesDisponibles] = useState<Option[]>(
    []
  ); // 🔥 CORREGIDO

  const tiposMantenimiento: Option[] = [
    { label: "Selecciona una opción", value: "" },
    { label: "Correctivo", value: "Correctivo" },
    { label: "Preventivo", value: "Preventivo" },
  ];

  useEffect(() => {
    const fetchTiposFallo = async () => {
      try {
        const res = await fetch(`${API_URL_MAINT}/maintenance/failure-types`);
        const data = await res.json();
        if (data.success) {
          const formatted = data.data.map((item: any) => ({
            label: item.name,
            value: item.id.toString(),
          }));
          setTiposFallo(formatted);
        }
      } catch (err) {
        console.error("Error al cargar tipos de fallo:", err);
      }
    };

    const fetchSoluciones = async () => {
      try {
        const res = await fetch(
          `${API_URL_MAINT}/maintenance/failure-solutions`
        );
        const data = await res.json();
        if (data.success) {
          const formatted = [
            { label: "Selecciona una opción", value: "" },
            ...data.data.map((item: any) => ({
              label: item.name,
              value: item.id.toString(),
            })),
          ];
          setSolucionesDisponibles(formatted);
        }
      } catch (err) {
        console.error("Error al cargar soluciones:", err);
      }
    };

    fetchTiposFallo();
    fetchSoluciones();
  }, []);

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
        (f) => (f?.size ?? 0) <= 1 * 1024 * 1024
      );
      if (!validFile) {
        Alert.alert("Archivo inválido", "El archivo debe ser menor a 1MB.");
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

    if (tiposFallo.length === 0 || solucionesDisponibles.length === 0) {
      Alert.alert("Espere", "Aún se están cargando los datos requeridos.");
      return;
    }

    if (archivo1List.length === 0 || archivo2List.length === 0) {
      Alert.alert(
        "Archivos requeridos",
        "Debes subir evidencia del fallo y de la solución antes de finalizar."
      );
      return;
    }

    const tipoFalloId =
      tiposFallo.find((item) => item.label === params.fallo)?.value || "1";
    const solucionId =
      solucionesDisponibles.find((item) => item.label === solucion)?.value ||
      "1";

    const formData = new FormData();
    formData.append(
      "technician_assignment_id",
      String(params.technicianAssignmentId)
    );
    formData.append("fault_remarks", params.observacion as string);
    formData.append("type_failure_id", tipoFalloId);
    formData.append("type_maintenance", tipoMantenimiento);
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
      setLoading(true);
      const response = await fetch(`${API_URL_MAINT}/maintenance/finalize`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok && result.success) {
        Alert.alert("Éxito", "Mantenimiento finalizado correctamente.");
        router.push("/maintenance/assignedReports");
      } else {
        Alert.alert("Error", result.message || "No se pudo finalizar.");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error al enviar reporte:", error);
      Alert.alert("Error", "Hubo un problema al enviar el reporte.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Reporte de mantenimiento finalizado"
        backRoute={() => router.push("/maintenance/assignedReports")}
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

              <View>
                <Text style={styles.label}>Fallo detectado</Text>
                <Text style={styles.value}>{params.fallo}</Text>
              </View>

              <View>
                <Text style={styles.label}>Observaciones</Text>
                <Text style={styles.value}>{params.observacion}</Text>
              </View>

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
                onValueChange={setTipoMantenimiento}
                options={tiposMantenimiento}
              />

              <Text style={styles.label}>Solución</Text>
              <DropdownPicker
                selectedValue={solucion}
                onValueChange={setSolucion}
                options={solucionesDisponibles}
              />

              <Text style={styles.label}>Observaciones</Text>
              <TextInput
                style={styles.textArea}
                multiline
                placeholder="Observación"
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
