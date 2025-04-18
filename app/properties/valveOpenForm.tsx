import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import DropdownPicker from "@/components/Dropdown";
import { typography } from "@/config/typography";
import { colors } from "@/config/theme";
import Button from "@/components/Button";
import CustomHeader from "@/components/CustomHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUserData } from "@/services/auth";
import { useLotContext } from "@/context/LotContext";
import moment from "moment";

export default function ValveOpenForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    currentLot,
    currentValveId,
    fetchValveOpeningTypes,
    createValveRequest,
  } = useLotContext();

  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedOpeningId, setSelectedOpeningId] = useState<number | null>(
    null
  );
  const [openingOptions, setOpeningOptions] = useState<
    { label: string; value: string; id: number }[]
  >([]);
  const [volumen, setVolumen] = useState<string | null>(null);
  const [fechaApertura, setFechaApertura] = useState<Date | null>(null);
  const [fechaCierre, setFechaCierre] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState({
    type: "",
    visible: false,
    mode: "date" as "date" | "time",
  });
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      const user = await getUserData();
      setUserId(user?.id || null);

      const options = await fetchValveOpeningTypes();
      setOpeningOptions(options);
    };

    init();
  }, []);

  const toLocalISOString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const sendValveRequest = async () => {
    const success = await createValveRequest({
      typeOpeningId: selectedOpeningId!,
      lotId: currentLot?.id!,
      userId: userId!,
      deviceIotId: currentValveId!,
      openDate: toLocalISOString(fechaApertura!),
      closeDate: toLocalISOString(fechaCierre!),
      volumeWater: selectedOption.toLowerCase().includes("con limite")
        ? Number(volumen)
        : null,
    });

    if (success) {
      Alert.alert("Éxito", "La solicitud fue enviada correctamente.");
      router.replace("/properties/detailsLot");
    }
  };

  const handleConfirm = () => {
    if (!selectedOption || selectedOpeningId === null) {
      Alert.alert("Atención", "Por favor, seleccione una opción válida.");
      return;
    }

    if (!currentValveId) {
      Alert.alert("Error", "No se ha seleccionado ninguna válvula.");
      return;
    }

    const withLimit = selectedOption.toLowerCase().includes("con limite");

    if (withLimit && (!volumen || !fechaApertura || !fechaCierre)) {
      Alert.alert("Faltan datos", "Por favor, complete todos los campos.");
      return;
    }

    if (
      withLimit &&
      volumen &&
      (isNaN(Number(volumen)) || Number(volumen) <= 0)
    ) {
      Alert.alert(
        "Volumen inválido",
        "El volumen de agua debe ser un número mayor a 0."
      );
      return;
    }

    if (!withLimit && (!fechaApertura || !fechaCierre)) {
      Alert.alert("Faltan datos", "Por favor, ingrese las fechas.");
      return;
    }

    if (fechaApertura && fechaCierre && fechaCierre <= fechaApertura) {
      Alert.alert(
        "Fechas inválidas",
        "La fecha de cierre debe ser posterior a la de apertura."
      );
      return;
    }

    // Mostrar resumen
    Alert.alert(
      "Confirmar solicitud",
      `Tipo: ${selectedOption}\n${
        withLimit ? `Volumen: ${volumen} m³\n` : ""
      }Fecha apertura: ${moment(fechaApertura).format(
        "DD/MM/YYYY HH:mm"
      )}\nFecha cierre: ${moment(fechaCierre).format("DD/MM/YYYY HH:mm")}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "default",
          onPress: sendValveRequest,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          title="Solicitud de apertura"
          backRoute="/properties/detailsLot"
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.innerContainer}>
                <Text style={[typography.regular.big, { color: colors.gray }]}>
                  Por favor, complete el siguiente formulario y luego confirme
                  para enviar su solicitud.
                </Text>
                <View style={styles.formContainer}>
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.label}>Opciones de apertura</Text>
                    <DropdownPicker
                      options={openingOptions}
                      selectedValue={selectedOption}
                      onValueChange={(value) => {
                        setSelectedOption(value);
                        const selected = openingOptions.find(
                          (opt) => opt.value === value
                        );
                        setSelectedOpeningId(selected?.id ?? null);
                        setVolumen(null);
                        setFechaApertura(null);
                        setFechaCierre(null);
                      }}
                    />
                  </View>

                  {selectedOpeningId !== null && (
                    <>
                      {selectedOption.toLowerCase().includes("con limite") && (
                        <>
                          <Text style={styles.label}>Volumen de agua</Text>
                          <TextInput
                            placeholder="Volumen de agua (m³)"
                            placeholderTextColor={colors.darkGray}
                            style={styles.input}
                            value={volumen ?? ""}
                            onChangeText={(text) => setVolumen(text)}
                            keyboardType="numeric"
                          />
                        </>
                      )}

                      <Text style={styles.label}>Fecha y hora de apertura</Text>
                      <TouchableOpacity
                        style={styles.input}
                        onPress={() =>
                          setShowPicker({
                            type: "apertura",
                            visible: true,
                            mode: "date",
                          })
                        }
                      >
                        <Text>
                          {fechaApertura
                            ? moment(fechaApertura).format("DD/MM/YYYY HH:mm")
                            : "Seleccionar fecha y hora"}
                        </Text>
                      </TouchableOpacity>

                      {showPicker.type === "apertura" && showPicker.visible && (
                        <DateTimePicker
                          value={fechaApertura || new Date()}
                          mode={showPicker.mode}
                          display="default"
                          minimumDate={new Date()}
                          onChange={(event, date) => {
                            if (event.type === "dismissed") {
                              setShowPicker({
                                type: "",
                                visible: false,
                                mode: "date",
                              });
                              return;
                            }

                            if (showPicker.mode === "date") {
                              setFechaApertura(date || new Date());
                              setShowPicker({
                                type: "apertura",
                                visible: true,
                                mode: "time",
                              });
                            } else {
                              const finalDate = new Date(
                                fechaApertura || new Date()
                              );
                              finalDate.setHours(date?.getHours() || 0);
                              finalDate.setMinutes(date?.getMinutes() || 0);
                              setFechaApertura(finalDate);
                              setShowPicker({
                                type: "",
                                visible: false,
                                mode: "date",
                              });
                            }
                          }}
                        />
                      )}

                      <Text style={styles.label}>Fecha y hora de cierre</Text>
                      <TouchableOpacity
                        style={styles.input}
                        onPress={() =>
                          setShowPicker({
                            type: "cierre",
                            visible: true,
                            mode: "date",
                          })
                        }
                      >
                        <Text>
                          {fechaCierre
                            ? moment(fechaCierre).format("DD/MM/YYYY HH:mm")
                            : "Seleccionar fecha y hora"}
                        </Text>
                      </TouchableOpacity>

                      {showPicker.type === "cierre" && showPicker.visible && (
                        <DateTimePicker
                          value={fechaCierre || new Date()}
                          mode={showPicker.mode}
                          display="default"
                          minimumDate={new Date()}
                          onChange={(event, date) => {
                            if (event.type === "dismissed") {
                              setShowPicker({
                                type: "",
                                visible: false,
                                mode: "date",
                              });
                              return;
                            }

                            if (showPicker.mode === "date") {
                              setFechaCierre(date || new Date());
                              setShowPicker({
                                type: "cierre",
                                visible: true,
                                mode: "time",
                              });
                            } else {
                              const finalDate = new Date(
                                fechaCierre || new Date()
                              );
                              finalDate.setHours(date?.getHours() || 0);
                              finalDate.setMinutes(date?.getMinutes() || 0);
                              setFechaCierre(finalDate);
                              setShowPicker({
                                type: "",
                                visible: false,
                                mode: "date",
                              });
                            }
                          }}
                        />
                      )}
                    </>
                  )}
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        <View style={styles.buttonContainer}>
          <Button text="Confirmar" onPress={handleConfirm} />
        </View>
      </View>
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
  },
  innerContainer: {
    flex: 1,
    width: "100%",
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  container: {
    flex: 1,
    paddingBottom: 12,
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  formContainer: {
    flex: 1,
    width: "100%",
    paddingVertical: 16,
  },
  subtitle: {
    ...typography.regular.large,
    color: colors.gray,
    marginBottom: 20,
  },
  label: {
    ...typography.medium.medium,
    color: colors.darkGray,
    paddingVertical: 8,
  },

  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    justifyContent: "center",
    ...typography.regular.big,
  },
  buttonContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.base,
  },
});
