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
} from "react-native";
import DropdownPicker from "@/components/Dropdown";
import { colors } from "@/config/theme";
import Button from "@/components/Button";
import CustomHeader from "@/components/CustomHeader";
import { router } from "expo-router";
import { typography } from "@/config/typography";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";

export default function ReportFailureForm() {
    const [predio, setPredio] = useState("");
    const [lote, setLote] = useState("");
    const [fallo, setFallo] = useState("");
    const [observacion, setObservacion] = useState("");
    const [tipoMantenimiento, setTipoMantenimiento] = useState("");
    const [solucion, setSolucion] = useState("");
    const [observacionSolucion, setObservacionSolucion] = useState("");
    const [archivo1, setArchivo1] = useState(null); // precargado
    const [archivo2, setArchivo2] = useState(null); // técnico lo sube
    const [finalizado, setFinalizado] = useState(false);
    const [loading, setLoading] = useState(false);

    const predios = [
        { label: "Seleccione el predio", value: "" },
        { label: "Predio 1", value: "predio1" },
        { label: "Predio 2", value: "predio2" },
    ];

    const lotes = [
        { label: "Seleccione el lote", value: "" },
        { label: "Lote A", value: "loteA" },
        { label: "Lote B", value: "loteB" },
    ];

    const posiblesFallos = [
        { label: "Seleccione el posible fallo", value: "" },
        { label: "Fallo en la tubería", value: "tuberia" },
        { label: "Fallo en la válvula", value: "valvula" },
        { label: "Fallo en el medidor", value: "medidor" },
        { label: "Fallo en el controlador", value: "controlador" },
        { label: "Fallo en la antena", value: "antena" },
        { label: "Fallo en el software", value: "software" },
        { label: "Fallo en el suministro de energía a los dispositivos", value: "energia" },
    ];

    const tiposMantenimiento = [
        { label: "Seleccione una opción", value: "" },
        { label: "Preventivo", value: "preventivo" },
        { label: "Correctivo", value: "correctivo" },
    ];

    const soluciones = [
        { label: "Seleccione una opción", value: "" },
        { label: "Reemplazo de componente", value: "reemplazo" },
        { label: "Reparación del sistema", value: "reparacion" },
        { label: "Actualización de software", value: "actualizacion" },
    ];

    const handleFilePick = async (setFile) => {
        const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
        if (result.assets && result.assets[0].size <= 1 * 1024 * 1024) {
            setFile(result.assets[0]);
        } else {
            Alert.alert("Archivo demasiado grande", "El archivo debe ser menor a 1MB.");
        }
    };

    const handleSubmit = () => {
        if (!predio || !lote || !fallo || !observacion || !tipoMantenimiento || !solucion || !observacionSolucion) {
            Alert.alert("Formulario incompleto", "Por favor, completa todos los campos obligatorios.");
            return;
        }

        Alert.alert("¿Está seguro?", "¿Desea dar por finalizado el mantenimiento?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Confirmar",
                onPress: () => {
                    setLoading(true);
                    setTimeout(() => {
                        console.log({
                            predio,
                            lote,
                            fallo,
                            observacion,
                            tipoMantenimiento,
                            solucion,
                            observacionSolucion,
                            archivo1,
                            archivo2,
                            finalizado,
                        });
                        setLoading(false);
                        router.push("/reports/seeReports");
                    }, 1000);
                },
            },
        ]);
    };

    // Simula carga inicial del archivo de evidencia precargado
    useEffect(() => {
        setArchivo1({ name: "fallo_detectado.jpg" }); // ← cambiar por nombre real del backend si aplica
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <CustomHeader
                title="Reporte de mantenimiento finalizado"
                backRoute={() => router.push("/reports/seeReports")}
            />

            <ScrollView contentContainerStyle={styles.form}>
                <View style={styles.innerForm}>
                    <Text style={styles.subtitle}>
                        Por favor, complete el siguiente formulario para dar por finalizado el mantenimiento
                    </Text>

                    <Text style={styles.label}>Predio afectado</Text>
                    <DropdownPicker selectedValue={predio} onValueChange={setPredio} options={predios} />

                    <Text style={styles.label}>Lote afectado</Text>
                    <DropdownPicker selectedValue={lote} onValueChange={setLote} options={lotes} />

                    <Text style={styles.label}>Fallo detectado</Text>
                    <DropdownPicker selectedValue={fallo} onValueChange={setFallo} options={posiblesFallos} />

                    <Text style={styles.label}>Observaciones *</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        placeholder="Observación"
                        value={observacion}
                        onChangeText={setObservacion}
                        maxLength={256}
                    />

                    <Text style={styles.label}>Evidencia del fallo (precargada)</Text>
                    <View style={styles.fileContainer}>
                        <Text style={styles.fileName}>
                            {archivo1?.name || "Archivo precargado por el usuario"}
                        </Text>
                    </View>

                    <Text style={styles.label}>Tipo de mantenimiento</Text>
                    <DropdownPicker selectedValue={tipoMantenimiento} onValueChange={setTipoMantenimiento} options={tiposMantenimiento} />

                    <Text style={styles.label}>Solución</Text>
                    <DropdownPicker selectedValue={solucion} onValueChange={setSolucion} options={soluciones} />

                    <Text style={styles.label}>Observaciones *</Text>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        placeholder="Observación"
                        value={observacionSolucion}
                        onChangeText={setObservacionSolucion}
                        maxLength={256}
                    />

                    <Text style={styles.label}>Evidencia del fallo</Text>
                    <Button text="Subir archivo" onPress={() => handleFilePick(setArchivo2)} />
                    <Text>{archivo2?.name || "Ningún archivo seleccionado"}</Text>

                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setFinalizado(!finalizado)}
                    >
                        <View style={[styles.checkbox, finalizado && styles.checkboxChecked]}>
                            {finalizado && <Feather name="check" size={16} color="white" />}
                        </View>
                        <Text style={styles.checkboxLabel}>Dar por finalizado el mantenimiento</Text>
                    </TouchableOpacity>

                    <View style={styles.buttonContainer}>
                        <Button text="Confirmar" onPress={handleSubmit} loading={loading} />
                    </View>
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
        marginTop: 30,
        marginBottom: 40,
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
    fileContainer: {
        padding: 10,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
    },
    fileName: {
        color: colors.gray,
        ...typography.regular.small,
    },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
    },
    switchLabel: {
        marginLeft: 10,
        ...typography.medium.regular,
        color: colors.gray,
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
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },

    checkboxChecked: {
        backgroundColor: colors.primary,
    },

    checkboxLabel: {
        marginLeft: 10,
        color: colors.gray,
        ...typography.medium.regular,
    },

});
