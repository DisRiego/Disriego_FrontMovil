import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import CustomHeader from "@/components/CustomHeader";
import LotCard from "@/components/LotCard";
import LotInfoCard from "@/components/LotInfoCard";
import DeviceCard from "@/components/DeviceCard";
import ValveCard from "@/components/ValveCard";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { useRouter } from "expo-router";
import { useLotContext } from "@/context/LotContext";
import ValveDetailsModal from "@/components/ValveDetailsModal";
import DeviceDetailsModal from "@/components/DeviceDetailsModal";
import SearchBar from "@/components/SearchBar";
import { Ionicons } from "@expo/vector-icons";

export default function DetailsLots() {
  const router = useRouter();
  const {
    currentLot,
    devices,
    fetchDevicesByLot,
    setCurrentDeviceId,
    setCurrentValveId,
  } = useLotContext();

  const [viewType, setViewType] = useState<"crop" | "devices">("crop");
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentLot?.id) {
        fetchDevicesByLot(currentLot.id);
      }
    }, 35000); // cada 30 segundos

    return () => clearInterval(interval);
  }, [currentLot?.id]);

  useEffect(() => {
    const loadDevices = async () => {
      if (currentLot?.id) {
        setIsLoadingDevices(true);
        try {
          await fetchDevicesByLot(currentLot.id);
        } catch (error) {
          console.error("Error cargando dispositivos:", error);
        } finally {
          setIsLoadingDevices(false);
        }
      }
    };

    loadDevices();
  }, [currentLot?.id]);

  const animateSearchIn = () => {
    Animated.timing(searchAnim, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const animateSearchOut = () => {
    Animated.timing(searchAnim, {
      toValue: 0,
      duration: 150,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const filteredDevices = devices.filter((device) =>
    [device.model, device.serial_number.toString(), device.status_name].some(
      (value) => value?.toLowerCase().includes(searchText.toLowerCase())
    )
  );

  if (!currentLot) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          title="Detalles del Lote"
          backRoute={() => router.push("/properties/detailsProperties")}
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              En esta sección podrás visualizar información detallada sobre{" "}
              {currentLot.name}.
            </Text>

            <View style={styles.propContainer}>
              <LotCard
                name={currentLot.name}
                id={currentLot.id}
                folio={currentLot.real_estate_registration_number}
                extension={currentLot.extension}
                latitud={currentLot.latitude}
                longitud={currentLot.longitude}
                minimal={false}
                showCropType={false}
              />
            </View>

            <View style={styles.tabAndSearch}>
              <View style={styles.tabRow}>
                <View style={styles.tabGroup}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      viewType === "crop" && styles.tabActive,
                    ]}
                    onPress={() => {
                      setViewType("crop");
                      setIsSearchVisible(false);
                      setSearchText("");
                    }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        viewType === "crop" && styles.tabTextActive,
                      ]}
                    >
                      Cultivo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tab,
                      viewType === "devices" && styles.tabActive,
                    ]}
                    onPress={() => setViewType("devices")}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        viewType === "devices" && styles.tabTextActive,
                      ]}
                    >
                      Dispositivos
                    </Text>
                  </TouchableOpacity>
                </View>

                {viewType === "devices" && (
                  <TouchableOpacity
                    onPress={() => {
                      if (isSearchVisible) {
                        setSearchText("");
                        animateSearchOut();
                        setTimeout(() => setIsSearchVisible(false), 150);
                      } else {
                        setIsSearchVisible(true);
                        animateSearchIn();
                      }
                    }}
                    style={styles.searchButton}
                  >
                    <Ionicons
                      name={isSearchVisible ? "close" : "search"}
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {isSearchVisible && viewType === "devices" && (
                <Animated.View
                  style={{
                    opacity: searchAnim,
                    transform: [
                      {
                        translateY: searchAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <SearchBar
                    searchText={searchText}
                    onSearchChange={setSearchText}
                  />
                </Animated.View>
              )}
            </View>

            {viewType === "crop" ? (
              <LotInfoCard
                onEditPress={() => {
                  router.push({
                    pathname: "/properties/updateCrops",
                    params: {
                      lotId: currentLot.id,
                      name: currentLot.name,
                      cropType: currentLot.cropType,
                      paymentInterval: currentLot.paymentInterval,
                      plantingDate: currentLot.plantingDate,
                      estimatedHarvestDate: currentLot.estimatedHarvestDate,
                    },
                  });
                }}
              />
            ) : isLoadingDevices ? (
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{
                    textAlign: "center",
                    marginBottom: 12,
                    color: colors.gray,
                  }}
                >
                  Cargando dispositivos...
                </Text>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : filteredDevices.length > 0 ? (
              filteredDevices.map((device) =>
                device.devices_id === 1 ? (
                  <ValveCard
                    key={device.id}
                    model={device.model}
                    serialNumber={device.serial_number.toString()}
                    installDate={device.installation_date}
                    maintenanceDate={device.estimated_maintenance_date}
                    statusName={device.status_name}
                    statusId={device.status}
                    deviceTypeName={device.device_type_name}
                    onPress={() => {
                      setSelectedDevice(device);
                      setCurrentValveId(device.id);
                    }}
                  />
                ) : (
                  <DeviceCard
                    key={device.id}
                    model={device.model}
                    serialNumber={device.serial_number.toString()}
                    installDate={device.installation_date}
                    maintenanceDate={device.estimated_maintenance_date}
                    status={device.status_name}
                    deviceTypeName={device.device_type_name}
                    onPress={() => {
                      setSelectedDevice(device);
                      setCurrentDeviceId(device.id);
                    }}
                  />
                )
              )
            ) : (
              <Text style={{ marginTop: 16, color: colors.gray }}>
                No hay resultados.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>

      {selectedDevice && selectedDevice.devices_id === 1 && (
        <ValveDetailsModal
          isVisible={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          model={selectedDevice.model}
          serialNumber={selectedDevice.serial_number.toString()}
          installDate={selectedDevice.installation_date}
          maintenanceDate={selectedDevice.estimated_maintenance_date}
          status={selectedDevice.status_name}
          statusId={selectedDevice.status}
          deviceTypeName={selectedDevice.device_type_name}
          deviceId={selectedDevice.id}
        />
      )}

      {selectedDevice && selectedDevice.devices_id !== 1 && (
        <DeviceDetailsModal
          isVisible={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          model={selectedDevice.model}
          serialNumber={selectedDevice.serial_number.toString()}
          installDate={selectedDevice.installation_date}
          maintenanceDate={selectedDevice.estimated_maintenance_date}
          status={selectedDevice.status_name}
          deviceTypeName={selectedDevice.device_type_name}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.base,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1, paddingBottom: 16 },
  scrollContainer: { flexGrow: 1 },
  innerContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  propContainer: { marginTop: 12 },
  tabAndSearch: {
    marginTop: 16,
    gap: 12,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabGroup: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    gap: 6,
    flex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.gray,
    fontWeight: "500",
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: "bold",
  },
  searchButton: {
    marginLeft: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
