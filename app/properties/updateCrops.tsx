//<Text style={styles.title}>Lote: {currentLot.name}</Text>
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import moment from "moment";

import CustomHeader from "@/components/CustomHeader";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { useLotContext } from "@/context/LotContext";
import CustomInput from "@/components/CustomInput";
import DropdownPicker from "@/components/Dropdown";
import Button from "@/components/Button";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function UpdateCrops() {
  const router = useRouter();
  const {
    currentLot,
    updateLotField,
    updateLotInList,
    cropTypes,
    paymentIntervals,
    fetchCropOptions,
    saveLotToBackend,
  } = useLotContext();

  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [plantingDate, setPlantingDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [estimatedHarvestDate, setEstimatedHarvestDate] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const cropOptions = useMemo(() => {
    return cropTypes.map((crop) => {
      const interval = paymentIntervals.find(
        (p) => p.id === crop.payment_interval_id
      );
      return {
        id: crop.id,
        label: crop.name,
        value: crop.name,
        intervalId: interval?.id || 0,
        intervalName: interval?.name || "",
        harvestDays: crop.harvest_time || 0,
      };
    });
  }, [cropTypes, paymentIntervals]);

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      await fetchCropOptions();
      setIsLoadingOptions(false);
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (!isLoadingOptions && currentLot && cropOptions.length > 0) {
      const found = cropOptions.find((c) => c.value === currentLot.cropType);
      if (found) {
        setSelectedCrop(found);
        if (currentLot.plantingDate) {
          const parsed = new Date(currentLot.plantingDate);
          setPlantingDate(parsed);
          const est = moment(parsed)
            .add(found.harvestDays, "days")
            .format("YYYY-MM-DD");
          setEstimatedHarvestDate(est);
        }
      }
    }
  }, [isLoadingOptions, currentLot, cropOptions]);

  const onChangeCrop = (value: string) => {
    const crop = cropOptions.find((c) => c.value === value);
    if (crop) {
      setSelectedCrop(crop);
      const est = moment(plantingDate)
        .add(crop.harvestDays, "days")
        .format("YYYY-MM-DD");
      setEstimatedHarvestDate(est);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPlantingDate(selectedDate);
      if (selectedCrop) {
        const est = moment(selectedDate)
          .add(selectedCrop.harvestDays, "days")
          .format("YYYY-MM-DD");
        setEstimatedHarvestDate(est);
      }
    }
  };

  const handleSave = async () => {
    if (selectedCrop && currentLot) {
      const updated = {
        ...currentLot,
        cropType: selectedCrop.value,
        paymentInterval: selectedCrop.intervalName,
        plantingDate: plantingDate.toISOString(),
        estimatedHarvestDate,
      };

      updateLotField("cropType", updated.cropType);
      updateLotField("paymentInterval", updated.paymentInterval);
      updateLotField("plantingDate", updated.plantingDate);
      updateLotField("estimatedHarvestDate", updated.estimatedHarvestDate);
      updateLotInList(updated);

      const success = await saveLotToBackend(currentLot.id, {
        typeCropId: selectedCrop.id,
        paymentIntervalId: selectedCrop.intervalId,
        plantingDate: updated.plantingDate,
        estimatedHarvestDate: updated.estimatedHarvestDate,
      });

      if (success) {
        router.replace("/properties/detailsLot");
      } else {
        alert("Hubo un error al guardar los cambios en el servidor.");
      }
    }
  };

  if (isLoadingOptions || !currentLot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Cargando opciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          title="Actualizar cultivo"
          backRoute="/properties/detailsLot"
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <View style={styles.textContainer}>
                <Text style={[typography.regular.big, { color: colors.gray }]}>
                  Edita los detalles del lote {currentLot.name}.
                </Text>

                <View style={styles.formContainer}>
                  {/* Dropdown crop type */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Tipo de cultivo</Text>
                    <DropdownPicker
                      selectedValue={selectedCrop?.value}
                      onValueChange={onChangeCrop}
                      options={cropOptions.map(({ label, value }) => ({
                        label,
                        value,
                      }))}
                    />
                  </View>

                  {/* Payment interval (read-only) */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Intervalo de Pago</Text>
                    <CustomInput
                      value={selectedCrop?.intervalName || ""}
                      editable={false}
                    />
                  </View>

                  {/* Planting date */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Fecha de siembra</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <CustomInput
                        value={moment(plantingDate).format("YYYY-MM-DD")}
                        editable={false}
                      />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={plantingDate}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                      />
                    )}
                  </View>

                  {/* Harvest date */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Fecha estimada de cosecha</Text>
                    <CustomInput
                      value={estimatedHarvestDate}
                      editable={false}
                    />
                  </View>
                </View>

                {/* Save Button */}
                <View style={styles.footerContainer}>
                  <Button text="Guardar" onPress={handleSave} />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
