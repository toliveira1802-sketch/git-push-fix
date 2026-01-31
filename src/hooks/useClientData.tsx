import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

// Types for client data
export interface ClientVehicle {
  id: string;
  brand: string;
  model: string;
  plate: string;
  year: number | null;
  color: string | null;
  km: number | null;
  is_active: boolean | null;
}

export interface ServiceHistoryItem {
  id: string;
  description: string;
  type: string;
  quantity: number | null;
  unit_price: number;
  total_price: number;
  status: string | null;
  priority: string | null;
}

export interface ClientServiceHistory {
  service_order_id: string;
  order_number: string;
  order_status: string;
  order_date: string;
  completed_at: string | null;
  total: number | null;
  total_parts: number | null;
  total_labor: number | null;
  total_discount: number | null;
  problem_description: string | null;
  diagnosis: string | null;
  payment_status: string | null;
  payment_method: string | null;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_plate: string;
  vehicle_year: number | null;
  vehicle_color: string | null;
  items: ServiceHistoryItem[];
}

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export function useClientData() {
  const { user } = useAuth();
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [vehicles, setVehicles] = useState<ClientVehicle[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ClientServiceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch client profile
  const fetchClientProfile = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("clients")
      .select("id, name, phone, email")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching client profile:", error);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        name: data.name || "",
        phone: data.phone || "",
        email: data.email,
      };
    }

    return null;
  }, [user]);

  // Fetch vehicles - uses user_id directly (not client_id)
  const fetchVehicles = useCallback(async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("vehicles")
      .select("id, brand, model, plate, year, color, km, is_active, client_id")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching vehicles:", error);
      return [];
    }

    return (data || []).map(v => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      plate: v.plate,
      year: v.year,
      color: v.color,
      km: v.km,
      is_active: v.is_active,
    }));
  }, [user]);

  // Fetch service history from the VIEW - ONLY delivered orders (entregue)
  const fetchServiceHistory = useCallback(async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("client_service_history")
      .select("*")
      .eq("user_id", user.id)
      .order("order_date", { ascending: false });

    if (error) {
      console.error("Error fetching service history:", error);
      return [];
    }

    // Parse the items JSON and transform the data
    return (data || []).map((row) => ({
      service_order_id: row.service_order_id || "",
      order_number: row.order_number || "",
      order_status: row.order_status || "",
      order_date: row.order_date || "",
      completed_at: row.completed_at,
      total: row.total,
      total_parts: row.total_parts,
      total_labor: row.total_labor,
      total_discount: row.total_discount,
      problem_description: row.problem_description,
      diagnosis: row.diagnosis,
      payment_status: row.payment_status,
      payment_method: row.payment_method,
      vehicle_brand: row.vehicle_brand || "",
      vehicle_model: row.vehicle_model || "",
      vehicle_plate: row.vehicle_plate || "",
      vehicle_year: row.vehicle_year,
      vehicle_color: row.vehicle_color,
      items: Array.isArray(row.items) ? (row.items as unknown as ServiceHistoryItem[]) : [],
    }));
  }, [user]);

  // Check if a vehicle has an active service order
  const getActiveServiceOrder = useCallback(
    (vehiclePlate: string) => {
      return serviceHistory.find(
        (order) =>
          order.vehicle_plate === vehiclePlate &&
          !["fechada", "cancelada", "entregue"].includes(order.order_status.toLowerCase()),
      );
    },
    [serviceHistory],
  );

  // Refresh all data
  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await fetchClientProfile();
      setClientProfile(profile);

      // Fetch vehicles directly by user_id
      const vehiclesData = await fetchVehicles();
      setVehicles(vehiclesData);

      const historyData = await fetchServiceHistory();
      setServiceHistory(historyData);
    } catch (err) {
      console.error("Error loading client data:", err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [user, fetchClientProfile, fetchVehicles, fetchServiceHistory]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime subscription for service_orders changes
  useEffect(() => {
    if (!user) return;

    let channel: RealtimeChannel | null = null;

    const setupRealtime = async () => {
      // Subscribe to service_orders changes
      channel = supabase
        .channel("client-service-orders")
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
            schema: "public",
            table: "service_orders",
          },
          (payload) => {
            console.log("Realtime: service_orders changed", payload);
            // Refresh data when any service order changes
            refresh();
          },
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "service_order_items",
          },
          (payload) => {
            console.log("Realtime: service_order_items changed", payload);
            // Refresh data when items change
            refresh();
          },
        )
        .subscribe((status) => {
          console.log("Realtime subscription status:", status);
        });
    };

    setupRealtime();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        console.log("Unsubscribing from realtime channel");
        supabase.removeChannel(channel);
      }
    };
  }, [user, refresh]);

  return {
    clientProfile,
    vehicles,
    serviceHistory,
    loading,
    error,
    refresh,
    getActiveServiceOrder,
  };
}
