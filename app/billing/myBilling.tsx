import React, { useMemo, useState } from "react";
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import CustomHeader from "@/components/CustomHeader";
import StatusBanner from "@/components/StatusBanner";
import BillingSummary from "@/components/BillingSummary";
import SearchBar from "@/components/SearchBar";
import InvoiceCard from "@/components/InvoiceCard";
import InvoiceDetailsModal from "@/components/InvoiceDetailsModal";
import ExpandablePropertyCard from "@/components/ExpandablePropertyCard";
import { Ionicons } from "@expo/vector-icons";
import { useLotContext } from "@/context/LotContext";
import { useBillingContext } from "@/context/BillingContext";
import { useRouter } from "expo-router";
import BillingChart from "@/components/BillingChart";

export default function BillingScreen() {
  const [viewType, setViewType] = useState<"pending" | "history">("pending");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();

  const { fetchPropertiesByUser } = useLotContext();
  const {
    invoices,
    selectedInvoice,
    setSelectedInvoice,
    fetchInvoiceDetails,
    invoiceDetail,
    setInvoiceDetail,
  } = useBillingContext();

  const pendingCount = invoices.filter((i) => i.status === "Pendiente").length;
  const paidCount = invoices.filter((i) => i.status === "Pagada").length;
  const hasPending = pendingCount > 0;

  useMemo(() => {
    fetchPropertiesByUser();
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = searchText.toLowerCase();
    return invoices
      .filter((invoice) => {
        if (viewType === "pending") return invoice.status === "Pendiente";
        if (viewType === "history") return invoice.status === "Pagada";
        return true;
      })
      .filter((invoice) => {
        return (
          invoice.invoice_id.toString().includes(query) ||
          invoice.propertyName.toLowerCase().includes(query) ||
          invoice.lotName.toLowerCase().includes(query)
        );
      });
  }, [invoices, viewType, searchText]);

  const groupedInvoices = useMemo(() => {
    const grouped: Record<
      string,
      {
        propertyName: string;
        lotName: string;
        propertyId: string;
        lotId: string;
      }
    > = {};
    filteredInvoices.forEach((invoice) => {
      const key = `${invoice.propertyId}-${invoice.lotId}`;
      if (!grouped[key]) {
        grouped[key] = {
          propertyName: invoice.propertyName,
          lotName: invoice.lotName,
          propertyId: invoice.propertyId,
          lotId: invoice.lotId,
        };
      }
    });
    return Object.values(grouped);
  }, [filteredInvoices]);

  const animateSearchIn = () => {
    Animated.timing(searchAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const animateSearchOut = () => {
    Animated.timing(searchAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePendingInvoicePress = async (invoiceId: number) => {
    const detailed = await fetchInvoiceDetails(invoiceId);
    if (detailed) {
      const i = detailed.invoice;
      setSelectedInvoice({
        invoice_id: i.invoice_id,
        reference_code: i.reference_code,
        dueDate: i.expiration_date,
        amount: `$${i.total_amount.toLocaleString("es-CO")}`,
        status:
          i.invoice_status_name.toLowerCase() === "pendiente"
            ? "Pendiente"
            : "Pagada",
        lotId: i.lot_id.toString(),
        propertyId: i.property_id.toString(),
        lotName: i.lot_name ?? "-",
        propertyName: i.property_name ?? "-",
        paymentInterval: i.invoiced_period + " días",
        emissionDate: i.issuance_date.split("T")[0],
        pdfUrl: i.pdf_url,
        clientName: i.client_name,
        clientEmail: i.client_email,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader title="Mis facturas y pagos" backRoute="/(tabs)/home" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.bannerContainer}>
            <StatusBanner
              type={hasPending ? "warning" : "success"}
              title={hasPending ? "Tienes facturas pendientes" : "Estás al día"}
              subtitle={
                hasPending
                  ? `Tienes ${pendingCount} facturas pendientes`
                  : "No tienes pagos pendientes"
              }
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              Conoce los últimos cuatro meses de facturación.
            </Text>
          </View>

          <View style={{ width: "100%", paddingHorizontal: 20, marginTop: 16 }}>
            <BillingChart
              title="Facturación últimos 4 meses"
              values={[50, 100, 80, 120]}
              labels={["Ene", "Feb", "Mar", "Abr"]}
            />
          </View>

          <View style={styles.summaryContainer}>
            <BillingSummary
              paid={paidCount}
              pending={pendingCount}
              expired={0}
            />
          </View>

          <View style={styles.tabAndSearch}>
            <View style={styles.tabRow}>
              <View style={styles.tabGroup}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    viewType === "pending" && styles.tabActive,
                  ]}
                  onPress={() => setViewType("pending")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      viewType === "pending" && styles.tabTextActive,
                    ]}
                  >
                    Pendientes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    viewType === "history" && styles.tabActive,
                  ]}
                  onPress={() => setViewType("history")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      viewType === "history" && styles.tabTextActive,
                    ]}
                  >
                    Historial
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsSearchVisible(!isSearchVisible);
                  if (isSearchVisible) {
                    setSearchText("");
                    animateSearchOut();
                  } else {
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
            </View>

            {isSearchVisible && (
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
                  marginTop: 10,
                  width: "100%",
                }}
              >
                <SearchBar
                  searchText={searchText}
                  onSearchChange={setSearchText}
                  placeholder="Buscar facturas"
                />
              </Animated.View>
            )}
          </View>

          <View style={styles.facturasContainer}>
            {filteredInvoices.length > 0 ? (
              viewType === "pending" ? (
                filteredInvoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.invoice_id}
                    invoiceId={invoice.invoice_id}
                    dueDate={invoice.dueDate}
                    propertyName={invoice.propertyName}
                    lotName={invoice.lotName}
                    amount={invoice.amount}
                    onPress={() =>
                      handlePendingInvoicePress(invoice.invoice_id)
                    }
                  />
                ))
              ) : (
                groupedInvoices.map((group, idx) => (
                  <ExpandablePropertyCard
                    key={idx}
                    name={group.propertyName}
                    id={group.propertyId}
                    lots={[{ id: group.lotId, name: group.lotName }]}
                    onLotPress={(lotId) => {
                      router.push({
                        pathname: "/billing/billingHistory",
                        params: {
                          lotId: group.lotId,
                          lotName: group.lotName,
                          propertyId: group.propertyId,
                          propertyName: group.propertyName,
                        },
                      });
                    }}
                  />
                ))
              )
            ) : (
              <Text style={typography.regular.medium}>
                No hay facturas registradas.
              </Text>
            )}
          </View>
        </ScrollView>

        <InvoiceDetailsModal
          isVisible={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
        />
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
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.base,
  },
  bannerContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  textContainer: {
    gap: 14,
    width: "100%",
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  summaryContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  tabAndSearch: {
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
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
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    flexShrink: 0,
    flex: 1,
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
  facturasContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
  },
});
