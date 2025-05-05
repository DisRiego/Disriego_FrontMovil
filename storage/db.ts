import { openDatabaseSync } from "expo-sqlite";

const db = openDatabaseSync("maintenance.db");

let retryTimer: NodeJS.Timeout | null = null;

// --- INTERFACE PARA TIPAR LOS RESULTADOS ---
interface PendingFinalization {
  id: number;
  technician_assignment_id: number;
  fault_remarks: string;
  type_failure_id: number;
  type_maintenance_id: number;
  failure_solution_id: number;
  solution_remarks: string;
  evidence_failure_uri: string;
  evidence_solution_uri: string;
  synced: number;
}

// --- CREAR TABLA ---
export function setupDatabase() {
  db.withTransactionSync(async () => {
    await db.runAsync(
      `CREATE TABLE IF NOT EXISTS pending_finalizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        technician_assignment_id INTEGER,
        fault_remarks TEXT,
        type_failure_id INTEGER,
        type_maintenance_id INTEGER,
        failure_solution_id INTEGER,
        solution_remarks TEXT,
        evidence_failure_uri TEXT,
        evidence_solution_uri TEXT,
        synced INTEGER DEFAULT 0
      );`
    );
  });
}

// --- GUARDAR FINALIZACIÓN OFFLINE ---
export function saveFinalizationOffline(data: {
  technician_assignment_id: number;
  fault_remarks: string;
  type_failure_id: number;
  type_maintenance_id: number;
  failure_solution_id: number;
  solution_remarks: string;
  evidence_failure_uri: string;
  evidence_solution_uri: string;
}) {
  db.withTransactionSync(async () => {
    await db.runAsync(
      `INSERT INTO pending_finalizations 
      (technician_assignment_id, fault_remarks, type_failure_id, type_maintenance_id, failure_solution_id, solution_remarks, evidence_failure_uri, evidence_solution_uri)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.technician_assignment_id,
        data.fault_remarks,
        data.type_failure_id,
        data.type_maintenance_id,
        data.failure_solution_id,
        data.solution_remarks,
        data.evidence_failure_uri,
        data.evidence_solution_uri,
      ]
    );
  });
}

// --- SINCRONIZAR FINALIZACIONES PENDIENTES ---
export function syncPendingFinalizations(apiUrl: string) {
  db.withTransactionSync(async () => {
    const result = await db.getAllAsync<PendingFinalization>(
      `SELECT * FROM pending_finalizations WHERE synced = 0`
    );

    if (!result || result.length === 0) {
      console.log("No hay sincronizaciones pendientes.");
      clearRetry();
      return;
    }

    let errors = 0;

    for (const item of result) {
      const formData = new FormData();
      formData.append(
        "technician_assignment_id",
        String(item.technician_assignment_id)
      );
      formData.append("fault_remarks", item.fault_remarks);
      formData.append("type_failure_id", String(item.type_failure_id));
      formData.append("type_maintenance_id", String(item.type_maintenance_id));
      formData.append("failure_solution_id", String(item.failure_solution_id));
      formData.append("solution_remarks", item.solution_remarks);

      formData.append("evidence_failure", {
        uri: item.evidence_failure_uri,
        name: "evidence_failure.jpg",
        type: "image/jpeg",
      } as any);

      formData.append("evidence_solution", {
        uri: item.evidence_solution_uri,
        name: "evidence_solution.jpg",
        type: "image/jpeg",
      } as any);

      try {
        const response = await fetch(`${apiUrl}/maintenance/finalize`, {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          console.log(`Finalización ${item.id} sincronizada.`);

          db.withTransactionSync(async () => {
            await db.runAsync(
              `UPDATE pending_finalizations SET synced = 1 WHERE id = ?`,
              [item.id]
            );
          });
        } else {
          console.error(
            `Falló sincronización ID ${item.id}:`,
            data.message || "Error desconocido"
          );
          errors++;
        }
      } catch (error) {
        console.error(`Error grave al sincronizar ID ${item.id}:`, error);
        errors++;
      }
    }

    if (errors > 0) {
      console.log(
        `Reprogramando sincronización en 5 minutos... (${errors} errores)`
      );
      scheduleRetry(apiUrl);
    } else {
      clearRetry();
    }
  });
}

// --- REINTENTAR SI FALLA ---
function scheduleRetry(apiUrl: string) {
  if (retryTimer) return;

  retryTimer = setTimeout(() => {
    console.log("Reintentando sincronizar pendientes...");
    syncPendingFinalizations(apiUrl);
  }, 5 * 60 * 1000); // Cada 5 minutos
}

// --- CANCELAR RETRIES SI TODO ESTÁ OK ---
function clearRetry() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

export async function countPendingFinalizations(): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM pending_finalizations WHERE synced = 0`
    );
    return result?.count || 0;
  } catch (error) {
    console.error("Error contando pendientes:", error);
    return 0;
  }
}

export function resetPendingFinalizationsTable() {
  db.withTransactionSync(async () => {
    await db.runAsync(`DELETE FROM pending_finalizations`);
    await db.runAsync(
      `DELETE FROM sqlite_sequence WHERE name='pending_finalizations'`
    );
    console.log("Tabla limpiada y autoincremento reiniciado.");
  });
}
