import {
  View,
  Text,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "@/config/theme";
import CustomHeader from "@/components/CustomHeader";
import { typography } from "@/config/typography";
import DropdownPicker from "@/components/Dropdown";
import { API_URL } from "@/services/config";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomInput from "@/components/CustomInput";
import Button from "@/components/Button";
import { router, useLocalSearchParams } from "expo-router";

export default function UpdateCrops() {
  const params = useLocalSearchParams();
  const lotId = React.useMemo(() => params.lotId || params.id, [params]);

  // State for pre-existing crop details
  const [initialCropType, setInitialCropType] = useState<string | undefined>(
    params.cropType as string
  );
  const [initialPaymentInterval, setInitialPaymentInterval] = useState<
    string | undefined
  >(params.paymentInterval as string);
  const [initialPlantingDate, setInitialPlantingDate] = useState<Date | null>(
    params.plantingDate ? new Date(params.plantingDate as string) : null
  );
  const [initialHarvestDate, setInitialHarvestDate] = useState<Date | null>(
    params.estimatedHarvestDate
      ? new Date(params.estimatedHarvestDate as string)
      : null
  );

  // State for types of crop
  const [selectedCrop, setSelectedCrop] = useState<string>(
    initialCropType || ""
  );
  const [cropOptions, setCropOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loadingCrops, setLoadingCrops] = useState<boolean>(true);

  // State for payment intervals
  const [selectedInterval, setSelectedInterval] = useState<string>(
    initialPaymentInterval || ""
  );
  const [paymentOptions, setPaymentOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loadingPayments, setLoadingPayments] = useState<boolean>(true);

  // State for planting and harvest dates
  const [plantingDate, setPlantingDate] = useState<Date | null>(
    initialPlantingDate
  );
  const [harvestDate, setHarvestDate] = useState<Date | null>(
    initialHarvestDate
  );
  const [showPlantingPicker, setShowPlantingPicker] = useState(false);
  const [showHarvestPicker, setShowHarvestPicker] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);

  // Overall loading state
  const [loading, setLoading] = useState(true);

  // Fetch crop types
  useEffect(() => {
    const fetchCropTypes = async () => {
      try {
        const response = await fetch(`${API_URL}/my-company/type-crops`);
        const data = await response.json();

        if (data.success) {
          const formattedOptions = data.data.map((crop: any) => ({
            label: crop.name,
            value: crop.id.toString(),
          }));

          setCropOptions([
            { label: "Seleccione una opción", value: "" },
            ...formattedOptions,
          ]);

          if (initialCropType) {
            const matchedCrop = formattedOptions.find(
              (crop: { label: string }) => crop.label === initialCropType
            );
            if (matchedCrop) {
              setSelectedCrop(matchedCrop.value);
            }
          }
        } else {
          Alert.alert("Error", "No se pudieron cargar los tipos de cultivo");
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "Hubo un problema al obtener los tipos de cultivo"
        );
        console.error("Error fetching crops:", error);
      } finally {
        setLoadingCrops(false);
      }
    };

    fetchCropTypes();
  }, []);

  // Fetch payment intervals
  useEffect(() => {
    const fetchPaymentIntervals = async () => {
      try {
        const response = await fetch(`${API_URL}/my-company/payment-intervals`);
        const data = await response.json();

        if (data.success) {
          const formattedOptions = data.data.map((interval: any) => ({
            label: interval.name,
            value: interval.id.toString(),
          }));

          setPaymentOptions([
            { label: "Seleccione una opción", value: "" },
            ...formattedOptions,
          ]);

          if (initialPaymentInterval) {
            const matchedInterval = formattedOptions.find(
              (interval: { label: string }) =>
                interval.label === initialPaymentInterval
            );
            if (matchedInterval) {
              setSelectedInterval(matchedInterval.value);
            }
          }
        } else {
          Alert.alert("Error", "No se pudieron cargar los intervalos de pago");
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "Hubo un problema al obtener los intervalos de pago"
        );
        console.error("Error fetching payments:", error);
      } finally {
        setLoadingPayments(false);
      }
    };

    fetchPaymentIntervals();
  }, []);

  // Manage overall loading state
  useEffect(() => {
    if (!loadingCrops && !loadingPayments) {
      setLoading(false);
    }
  }, [loadingCrops, loadingPayments]);

  // Handle planting date change
  const handlePlantingDateChange = (event: any, selectedDate?: Date) => {
    setShowPlantingPicker(false);
    if (selectedDate) {
      setPlantingDate(selectedDate);
    }
  };

  // Handle harvest date change
  const handleHarvestDateChange = (event: any, selectedDate?: Date) => {
    setShowHarvestPicker(false);
    if (selectedDate) {
      if (plantingDate && selectedDate < plantingDate) {
        Alert.alert(
          "Error",
          "La fecha de cosecha no puede ser antes de la fecha de siembra."
        );
      } else {
        setHarvestDate(selectedDate);
      }
    }
  };

  // Save changes function
  const handleSaveChanges = async () => {
    if (!selectedCrop || !selectedInterval || !plantingDate || !harvestDate) {
      Alert.alert("Error", "Por favor complete todos los campos.");
      return;
    }

    setSavingChanges(true);

    const formData = new FormData();
    formData.append("type_crop_id", selectedCrop);
    formData.append("payment_interval", selectedInterval);
    formData.append("planting_date", plantingDate.toISOString().split("T")[0]);
    formData.append(
      "estimated_harvest_date",
      harvestDate.toISOString().split("T")[0]
    );

    try {
      const response = await fetch(
        `${API_URL}/properties/lot/${lotId}/edit-fields`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert("Éxito", "Los detalles del cultivo han sido actualizados.");
        router.push("/properties/myProperties");
      } else {
        Alert.alert(
          "Error",
          data.message || "No se pudo actualizar el cultivo."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al guardar los cambios.");
      console.error("Error saving changes:", error);
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          title="Detalles del cultivo"
          backRoute="/properties/myProperties"
        />

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>Cargando datos...</Text>
          </View>
        ) : (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              style={styles.container}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.textContainer}>
                  <Text
                    style={[typography.regular.big, { color: colors.gray }]}
                  >
                    Por favor, complete el siguiente formulario y luego de a
                    confirmar para editar los detalles del cultivo.
                  </Text>

                  <View style={styles.formContainer}>
                    {/* Dropdown for Crop Type */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Tipo de cultivo</Text>
                      <DropdownPicker
                        selectedValue={selectedCrop}
                        onValueChange={setSelectedCrop}
                        options={cropOptions}
                      />
                    </View>

                    {/* Dropdown for Payment Interval */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Intervalo de Pago</Text>
                      <DropdownPicker
                        selectedValue={selectedInterval}
                        onValueChange={setSelectedInterval}
                        options={paymentOptions}
                      />
                    </View>

                    {/* Planting Date Picker */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Fecha de siembra</Text>
                      <TouchableOpacity
                        onPress={() => setShowPlantingPicker(true)}
                      >
                        <CustomInput
                          placeholder="Seleccione una fecha"
                          value={
                            plantingDate
                              ? plantingDate.toLocaleDateString()
                              : ""
                          }
                          editable={false}
                        />
                      </TouchableOpacity>
                      {showPlantingPicker && (
                        <DateTimePicker
                          value={plantingDate || new Date()}
                          mode="date"
                          display="default"
                          onChange={handlePlantingDateChange}
                        />
                      )}
                    </View>

                    {/* Harvest Date Picker */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>
                        Fecha estimada de cosecha
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowHarvestPicker(true)}
                      >
                        <CustomInput
                          placeholder="Seleccione una fecha"
                          value={
                            harvestDate ? harvestDate.toLocaleDateString() : ""
                          }
                          editable={false}
                        />
                      </TouchableOpacity>
                      {showHarvestPicker && (
                        <DateTimePicker
                          value={harvestDate || new Date()}
                          mode="date"
                          display="default"
                          minimumDate={plantingDate || new Date()}
                          onChange={handleHarvestDateChange}
                        />
                      )}
                    </View>
                  </View>

                  {/* Save Changes Button */}
                  <View style={styles.footerContainer}>
                    <Button
                      text={
                        savingChanges ? (
                          <ActivityIndicator size={28} color="white" />
                        ) : (
                          "Guardar cambios"
                        )
                      }
                      onPress={handleSaveChanges}
                      disabled={savingChanges}
                    />
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        )}
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
  container: {
    flex: 1,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: colors.base,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    gap: 16,
    width: "100%",
    paddingVertical: 20,
  },
  label: {
    marginBottom: 8,
    ...typography.medium.regular,
    color: colors.gray,
  },
  footerContainer: {
    width: "100%",
    marginTop: 2,
    paddingTop: 24,
    paddingBottom: 8,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    width: "100%",
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  inputContainer: {
    width: "100%",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  loaderText: {
    marginTop: 12,
    ...typography.regular.medium,
    color: colors.darkGray,
  },
});
