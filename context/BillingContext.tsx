import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserData } from "@/services/auth";
import { API_URL_FACT } from "@/services/config";

// Representa facturas resumidas para el listado
export interface Invoice {
  invoice_id: number;
  reference_code: string;
  dueDate: string;
  expirationDate: string;
  issuanceDate: string;
  amount: string;
  status: "Pendiente" | "Pagada";
  lotId: string;
  propertyId: string;
  lotName: string;
  propertyName: string;
  paymentInterval: string;
  emissionDate: string;
  cufe?: string;
  pdfUrl?: string;
  clientName?: string;
  clientEmail?: string;
}

// Factura con detalle completo (modal histórico)
export interface InvoiceDetailResponse {
  invoice: {
    invoice_id: number;
    reference_code: string;
    issuance_date: string;
    expiration_date: string;
    pdf_url: string;
    start_date: string;
    end_date: string;
    invoiced_period: string;
    total_amount: number;
    client_name: string;
    client_email: string;
    client_document: number;
    property_id: number;
    lot_id: number;
    invoice_status_name: string;
    dian_status_id: string;
    dian_status_name: string;
    lot_name?: string;
    property_name?: string;
  };
  payment: {
    payment_method: string;
    reference_code: string;
    transaction_amount: number;
    payment_date: string;
    payment_status_id: string;
    payment_status_name: string;
  };
  concepts: any[];
}

export interface PsePaymentPayload {
  bankCode: string;
  deviceSessionId: string;
  detailInvoice: {
    invoice_id: number;
  };
}

interface BillingContextType {
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;

  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;

  invoiceDetail: InvoiceDetailResponse | null;
  setInvoiceDetail: (invoice: InvoiceDetailResponse | null) => void;

  fetchInvoices: () => Promise<void>;
  fetchInvoiceDetails: (
    invoiceId: number
  ) => Promise<InvoiceDetailResponse | null>;
  getPseBanks: () => Promise<{ label: string; value: string }[]>;
  createPsePayment: (payload: PsePaymentPayload) => Promise<any>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

const formatStatus = (raw: string | undefined): "Pendiente" | "Pagada" =>
  raw?.toLowerCase() === "pendiente" ? "Pendiente" : "Pagada";

//  Convierte InvoiceDetailResponse a Invoice
export const mapDetailToInvoice = (detail: InvoiceDetailResponse): Invoice => {
  const i = detail.invoice;

  return {
    invoice_id: i.invoice_id,
    reference_code: i.reference_code,
    dueDate: i.expiration_date,
    expirationDate: i.expiration_date,
    issuanceDate: i.issuance_date,
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
  };
};

export const BillingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceDetail, setInvoiceDetail] =
    useState<InvoiceDetailResponse | null>(null);

  const fetchInvoices = async () => {
    try {
      const user = await getUserData();
      const userId = user?.id;
      if (!userId) return;

      const res = await fetch(
        `${API_URL_FACT}/my_facturation/invoices/user/${userId}`
      );
      const data = await res.json();

      if (Array.isArray(data)) {
        const formatted = data.map(
          (invoice: any): Invoice => ({
            invoice_id: invoice.invoice_id,
            reference_code: invoice.reference_code,
            dueDate: invoice.expiration_date,
            expirationDate: invoice.expiration_date,
            issuanceDate: invoice.issuance_date,
            amount: `$${invoice.total_amount.toLocaleString("es-CO")}`,
            status: formatStatus(invoice.status),
            lotId: invoice.lot_id.toString(),
            propertyId: invoice.property_id.toString(),
            lotName: invoice.lot_name,
            propertyName: invoice.property_name,
            paymentInterval: invoice.payment_interval,
            emissionDate: invoice.issuance_date?.split("T")[0] ?? "",
            pdfUrl: invoice.pdf_url,
            clientName: invoice.client_name,
            clientEmail: invoice.client_email,
          })
        );
        setInvoices(formatted);
      }
    } catch (error) {
      console.warn("Error al cargar facturas:", error);
    }
  };

  const fetchInvoiceDetails = async (
    invoiceId: number
  ): Promise<InvoiceDetailResponse | null> => {
    try {
      const res = await fetch(`${API_URL_FACT}/billing/invoices/${invoiceId}`);
      const data = await res.json();

      if (data?.success && data?.data?.invoice) {
        return data.data as InvoiceDetailResponse;
      }

      return null;
    } catch (err) {
      console.warn("Error al cargar detalle de factura:", err);
      return null;
    }
  };

  const getPseBanks = async (): Promise<{ label: string; value: string }[]> => {
    try {
      const res = await fetch(`${API_URL_FACT}/payu/pse-banks`);
      const data = await res.json();
      return (
        data?.data?.map((bank: any) => ({
          label: bank.description,
          value: bank.pseCode,
        })) || []
      );
    } catch (err) {
      console.warn("Error al obtener bancos PSE:", err);
      return [];
    }
  };

  const createPsePayment = async (payload: PsePaymentPayload): Promise<any> => {
    try {
      const res = await fetch(`${API_URL_FACT}/payu/pse-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("Error al crear pago PSE:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <BillingContext.Provider
      value={{
        invoices,
        setInvoices,
        selectedInvoice,
        setSelectedInvoice,
        invoiceDetail,
        setInvoiceDetail,
        fetchInvoices,
        fetchInvoiceDetails,
        getPseBanks,
        createPsePayment,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBillingContext = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error("useBillingContext debe usarse dentro de BillingProvider");
  }
  return context;
};
