import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ImportRow } from "@/components/import/ImportPreviewTable";

type ImportType = "clients" | "vehicles";

const CLIENT_REQUIRED_FIELDS = ["name", "phone"];
const VEHICLE_REQUIRED_FIELDS = ["plate", "brand", "model", "client_phone"];

const CLIENT_FIELD_MAP: Record<string, string> = {
  "nome": "name",
  "telefone": "phone",
  "email": "email",
  "cpf": "cpf",
  "endereco": "address",
  "cidade": "city",
  "origem": "origem",
  "observacoes": "notes",
};

const VEHICLE_FIELD_MAP: Record<string, string> = {
  "placa": "plate",
  "marca": "brand",
  "modelo": "model",
  "ano": "year",
  "cor": "color",
  "km": "km",
  "telefone_cliente": "client_phone",
  "chassi": "chassis",
  "combustivel": "fuel_type",
};

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .trim();
}

function mapColumns(headers: string[], fieldMap: Record<string, string>): Record<string, string> {
  const mapping: Record<string, string> = {};
  headers.forEach((h) => {
    const normalized = normalizeHeader(h);
    if (fieldMap[normalized]) {
      mapping[h] = fieldMap[normalized];
    } else if (Object.values(fieldMap).includes(normalized)) {
      mapping[h] = normalized;
    }
  });
  return mapping;
}

function validateClientRow(data: Record<string, string>): string[] {
  const errors: string[] = [];
  if (!data.name?.trim()) errors.push("Nome obrigatório");
  if (!data.phone?.trim()) errors.push("Telefone obrigatório");
  return errors;
}

function validateVehicleRow(data: Record<string, string>): string[] {
  const errors: string[] = [];
  if (!data.plate?.trim()) errors.push("Placa obrigatória");
  if (!data.brand?.trim()) errors.push("Marca obrigatória");
  if (!data.model?.trim()) errors.push("Modelo obrigatório");
  if (!data.client_phone?.trim()) errors.push("Telefone do cliente obrigatório");
  return errors;
}

export function useImportData() {
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ImportRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [importType, setImportType] = useState<ImportType>("clients");

  const parseFile = useCallback(async (file: File, type: ImportType) => {
    setIsLoading(true);
    setImportType(type);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

      if (jsonData.length < 2) {
        toast.error("Arquivo vazio ou sem dados");
        return;
      }

      const headerRow = jsonData[0] as unknown[];
      const headers = headerRow.filter(Boolean).map(String);
      const fieldMap = type === "clients" ? CLIENT_FIELD_MAP : VEHICLE_FIELD_MAP;
      const columnMapping = mapColumns(headers, fieldMap);
      
      const mappedColumns = Object.values(columnMapping);
      setColumns(mappedColumns);

      const validateFn = type === "clients" ? validateClientRow : validateVehicleRow;

      const rows: ImportRow[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as unknown[];
        if (!row || row.every((cell) => !cell)) continue;

        const mappedData: Record<string, string> = {};
        headers.forEach((header, idx) => {
          const mappedKey = columnMapping[header];
          if (mappedKey) {
            mappedData[mappedKey] = String(row[idx] || "").trim();
          }
        });

        const errors = validateFn(mappedData);
        rows.push({
          data: mappedData,
          isValid: errors.length === 0,
          errors,
        });
      }

      setParsedData(rows);
      toast.success(`${rows.length} registros encontrados`);
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Erro ao processar arquivo");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importClients = useCallback(async () => {
    const validRows = parsedData.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("Nenhum registro válido para importar");
      return 0;
    }

    setIsLoading(true);
    let imported = 0;

    try {
      for (const row of validRows) {
        const { data } = row;
        const { error } = await supabase.from("clientes").insert({
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          cpf: data.cpf || null,
          address: data.address || null,
          city: data.city || null,
          origem: data.origem || "importacao",
          notes: data.notes || null,
          registration_source: "importacao",
        });

        if (!error) imported++;
      }

      toast.success(`${imported} clientes importados com sucesso`);
      return imported;
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erro durante a importação");
      return imported;
    } finally {
      setIsLoading(false);
    }
  }, [parsedData]);

  const importVehicles = useCallback(async () => {
    const validRows = parsedData.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("Nenhum registro válido para importar");
      return 0;
    }

    setIsLoading(true);
    let imported = 0;
    const notFoundClients: string[] = [];

    try {
      for (const row of validRows) {
        const { data } = row;
        
        // Find client by phone
        const { data: clients } = await supabase
          .from("clientes")
          .select("id")
          .eq("phone", data.client_phone)
          .limit(1);

        if (!clients || clients.length === 0) {
          notFoundClients.push(data.client_phone);
          continue;
        }

        const { error } = await supabase.from("veiculos").insert({
          plate: data.plate.toUpperCase(),
          brand: data.brand,
          model: data.model,
          year: data.year ? parseInt(data.year) : null,
          color: data.color || null,
          km: data.km ? parseInt(data.km) : null,
          chassis: data.chassis || null,
          fuel_type: data.fuel_type || "flex",
          client_id: clients[0].id,
        });

        if (!error) imported++;
      }

      if (notFoundClients.length > 0) {
        toast.warning(`${notFoundClients.length} veículos não importados - cliente não encontrado`);
      }
      
      toast.success(`${imported} veículos importados com sucesso`);
      return imported;
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Erro durante a importação");
      return imported;
    } finally {
      setIsLoading(false);
    }
  }, [parsedData]);

  const executeImport = useCallback(async () => {
    if (importType === "clients") {
      return importClients();
    } else {
      return importVehicles();
    }
  }, [importType, importClients, importVehicles]);

  const reset = useCallback(() => {
    setParsedData([]);
    setColumns([]);
  }, []);

  return {
    isLoading,
    parsedData,
    columns,
    parseFile,
    executeImport,
    reset,
    validCount: parsedData.filter((r) => r.isValid).length,
  };
}
