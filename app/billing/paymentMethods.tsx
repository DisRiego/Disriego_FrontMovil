import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  AppState,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import CustomHeader from "@/components/CustomHeader";
import DropdownPicker from "@/components/Dropdown";
import {
  useBillingContext,
  mapDetailToInvoice,
} from "@/context/BillingContext";
import { getUserData } from "@/services/auth";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import uuid from "react-native-uuid";

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
  const [banks, setBanks] = useState<{ label: string; value: string }[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [deviceSessionId] = useState(() => uuid.v4().toString());

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");

  const {
    selectedInvoice,
    getPseBanks,
    createPsePayment,
    fetchInvoiceDetails,
    setInvoices,
  } = useBillingContext();

  // Redirige al volver a la app
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        router.replace("/(tabs)/home");
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    setLoadingBanks(true);
    getPseBanks().then((bankList) => {
      setBanks(bankList);
      setLoadingBanks(false);
    });
  }, []);

  useEffect(() => {
    getUserData().then((user) => {
      if (user) {
        setName(
          `${user.name} ${user.first_last_name} ${user.second_last_name ?? ""}`
        );
        setEmail(user.email || "");
        setDocument(user.document_number?.toString() || "");
        setPhone(user.phone || "");
      }
    });
  }, []);

  useEffect(() => {
    const refresh = async () => {
      if (!selectedInvoice) return;
      const updated = await fetchInvoiceDetails(
        Number(selectedInvoice.invoice_id)
      );
      if (updated) {
        const updatedInvoice = mapDetailToInvoice(updated);
        setInvoices((prev) =>
          prev.map((inv) =>
            inv.invoice_id === updatedInvoice.invoice_id ? updatedInvoice : inv
          )
        );
      }
    };

    refresh();
  }, [selectedInvoice]);

  const canContinue = selectedBank && name && email && document && phone;

  const handleSubmit = async () => {
    if (!selectedInvoice) {
      alert("Factura no seleccionada");
      return;
    }

    const payload = {
      bankCode: selectedBank,
      deviceSessionId,
      detailInvoice: {
        invoice_id: selectedInvoice.invoice_id,
      },
    };

    console.log("Payload enviado a /payu/pse-payment:", payload);

    const result = await createPsePayment(payload);
    console.log("Respuesta completa del backend:", result);

    if (
      result?.data &&
      typeof result.data === "string" &&
      result.data.startsWith("http")
    ) {
      Linking.openURL(result.data);
    } else if (result?.data?.includes("ya se encuentra registrada")) {
      alert("Ya existe una solicitud de pago para esta factura.");
    } else {
      alert("No se pudo completar el pago.");
    }
  };

  if (!selectedInvoice) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.hintText}>No hay factura seleccionada.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <CustomHeader title="Método de pago" backRoute="/(tabs)/home" />

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.iconWrapper}>
                <View style={styles.iconCircle}>
                  <FontAwesome
                    name="file-text-o"
                    size={22}
                    color={colors.primary}
                  />
                </View>
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardTitle}>
                    Factura No. {selectedInvoice.invoice_id}
                  </Text>
                  <Text style={styles.cardAmount}>
                    {selectedInvoice.amount}
                  </Text>
                </View>
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardLabel}>Límite de pago</Text>
                  <Text style={styles.cardLabel}>
                    {selectedInvoice.dueDate?.split?.("T")?.[0] ?? "Sin fecha"}
                  </Text>
                </View>
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardLabel}>
                    Predio #{selectedInvoice.propertyId}
                  </Text>
                  <Text style={styles.cardLabel}>
                    {selectedInvoice.propertyName}
                  </Text>
                </View>
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardLabel}>
                    Lote #{selectedInvoice.lotId}
                  </Text>
                  <Text style={styles.cardLabel}>
                    {selectedInvoice.lotName}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Completa los datos para PSE:</Text>

          <View style={styles.methodBox}>
            <Text style={styles.label}>Selecciona tu banco:</Text>
            {loadingBanks ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <DropdownPicker
                selectedValue={selectedBank}
                onValueChange={(val) => setSelectedBank(val)}
                options={banks}
              />
            )}
          </View>

          {!canContinue && (
            <Text style={styles.hintText}>
              Completa los campos requeridos para continuar
            </Text>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            style={[
              styles.continueButton,
              !canContinue && styles.disabledButton,
            ]}
            disabled={!canContinue}
          >
            <Text
              style={[
                styles.continueButtonText,
                !canContinue && styles.disabledButtonText,
              ]}
            >
              Continuar
            </Text>
            <AntDesign
              name="arrowright"
              size={16}
              color={canContinue ? "white" : "#888"}
            />
          </TouchableOpacity>
        </ScrollView>
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
    backgroundColor: colors.base,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    marginRight: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F2F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    ...typography.semibold.medium,
    color: colors.darkGray,
  },
  cardLabel: {
    ...typography.regular.medium,
    color: colors.gray,
  },
  cardAmount: {
    ...typography.semibold.medium,
    color: colors.gray,
  },
  sectionTitle: {
    ...typography.regular.medium,
    color: colors.darkGray,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  methodBox: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  label: {
    ...typography.medium.regular,
    marginBottom: 8,
    color: colors.gray,
  },
  continueButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 32,
  },
  continueButtonText: {
    color: colors.white,
    ...typography.semibold.medium,
    letterSpacing: 0.5,
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: "#D3D3D3",
    shadowOpacity: 0,
  },
  disabledButtonText: {
    color: "#888",
  },
  hintText: {
    ...typography.regular.regular,
    color: colors.gray,
    marginHorizontal: 20,
    marginBottom: 8,
    textAlign: "center",
  },
});
