import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  const fetchClientProfile = async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('clients')
      .select('id, name, phone, email')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching client profile:', error);
      return null;
    }

    return data;
  };

  // Fetch vehicles
  const fetchVehicles = async (clientId: string) => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, brand, model, plate, year, color, km, is_active')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }

    return data || [];
  };

  // Fetch service history from the VIEW
  const fetchServiceHistory = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('client_service_history')
      .select('*')
      .eq('user_id', user.id)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('Error fetching service history:', error);
      return [];
    }

    // Parse the items JSON and transform the data
    return (data || []).map(row => ({
      service_order_id: row.service_order_id || '',
      order_number: row.order_number || '',
      order_status: row.order_status || '',
      order_date: row.order_date || '',
      completed_at: row.completed_at,
      total: row.total,
      total_parts: row.total_parts,
      total_labor: row.total_labor,
      total_discount: row.total_discount,
      problem_description: row.problem_description,
      diagnosis: row.diagnosis,
      payment_status: row.payment_status,
      payment_method: row.payment_method,
      vehicle_brand: row.vehicle_brand || '',
      vehicle_model: row.vehicle_model || '',
      vehicle_plate: row.vehicle_plate || '',
      vehicle_year: row.vehicle_year,
      vehicle_color: row.vehicle_color,
      items: Array.isArray(row.items) ? (row.items as unknown as ServiceHistoryItem[]) : [],
    }));
  };

  // Check if a vehicle has an active service order
  const getActiveServiceOrder = (vehiclePlate: string) => {
    return serviceHistory.find(
      order => order.vehicle_plate === vehiclePlate && 
      !['fechada', 'cancelada', 'entregue'].includes(order.order_status.toLowerCase())
    );
  };

  // Refresh all data
  const refresh = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await fetchClientProfile();
      setClientProfile(profile);

      if (profile) {
        const vehiclesData = await fetchVehicles(profile.id);
        setVehicles(vehiclesData);
      }

      const historyData = await fetchServiceHistory();
      setServiceHistory(historyData);
    } catch (err) {
      console.error('Error loading client data:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [user]);

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
