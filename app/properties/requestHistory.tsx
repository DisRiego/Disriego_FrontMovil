import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import CustomHeader from "@/components/CustomHeader";
import { colors } from "@/config/theme";
import { typography } from "@/config/typography";
import { useLotContext } from "@/context/LotContext";
import ValveRequestCard from "@/components/RequestCard";
import RequestDetailsModal from "@/components/RequestDetailsModal";
import moment from "moment";

export default function ValveRequests() {
  const router = useRouter();
  const {
    currentLot,
    currentValveId,
    getRequestByDeviceId,
    fetchValveOpeningTypes,
  } = useLotContext();

  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [openingTypes, setOpeningTypes] = useState<
    { label: string; value: string; id: number }[]
  >([]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (currentValveId) {
        const res = await getRequestByDeviceId(currentValveId);
        if (res) {
          if (Array.isArray(res)) {
            setRequests(res);
          } else {
            setRequests([res]);
          }
        }
      }
    };

    const loadOpeningTypes = async () => {
      const types = await fetchValveOpeningTypes();
      setOpeningTypes(types);
    };

    fetchRequests();
    loadOpeningTypes();
  }, [currentValveId]);

  const getOpeningLabelFlat = (id: number): string => {
    const match = openingTypes.find((t) => t.id === id);
    return match?.label ?? `Tipo apertura #${id}`;
  };

  const getOpeningLabelMultiline = (id: number): string => {
    const match = openingTypes.find((t) => t.id === id);
    return (
      match?.label.replace(/\s+(con|sin)\b/, "\n$1") ?? `Tipo apertura #${id}`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CustomHeader
          title="Historial de solicitudes"
          backRoute="/properties/detailsLot"
        />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            <Text style={[typography.regular.big, { color: colors.gray }]}>
              En esta sección podrás ver el historial de solicitudes para la
              válvula en el lote {currentLot?.name}.
            </Text>
          </View>

          {requests.length > 0 ? (
            <View style={styles.innerContainer}>
              {requests
                .sort(
                  (a, b) =>
                    new Date(b.request_date).getTime() -
                    new Date(a.request_date).getTime()
                )
                .map((req) => (
                  <ValveRequestCard
                    key={req.id}
                    id={req.id}
                    type={getOpeningLabelFlat(req.type_opening_id)}
                    date={moment(req.request_date).format("DD/MM/YYYY hh:mm A")}
                    onPress={() => {
                      setSelectedRequest(req);
                      setIsModalVisible(true);
                    }}
                  />
                ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No hay solicitudes registradas.
            </Text>
          )}
        </ScrollView>

        {selectedRequest && (
          <RequestDetailsModal
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            requestId={selectedRequest.id}
            requestDate={moment(selectedRequest.request_date).format(
              "DD/MM/YYYY hh:mm A"
            )}
            statusText={`Estado #${selectedRequest.status}`}
            statusColor={colors.primary}
            statusBg="#E0F7FA"
            requestType={getOpeningLabelMultiline(
              selectedRequest.type_opening_id
            )}
            openDate={moment(selectedRequest.open_date).format(
              "DD/MM/YYYY hh:mm A"
            )}
            closeDate={moment(selectedRequest.close_date).format(
              "DD/MM/YYYY hh:mm A"
            )}
          />
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
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: "center",
    color: colors.gray,
    marginTop: 20,
  },
});
