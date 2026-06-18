import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Car } from "@/data/cars";
import { fetchCarBySlug, fetchCars, inventoryQueryKey } from "@/lib/inventory";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type UseCarsOptions = {
  enabled?: boolean;
};

export function useCars(options: UseCarsOptions = {}) {
  return useQuery({
    queryKey: inventoryQueryKey,
    queryFn: fetchCars,
    enabled: options.enabled ?? true,
  });
}

export function useCarBySlug(slug: string, initialData?: Car) {
  return useQuery({
    queryKey: [...inventoryQueryKey, slug],
    queryFn: async () => {
      const car = await fetchCarBySlug(slug);
      if (!car) throw new Error("Car not found");
      return car;
    },
    initialData,
  });
}

export function useInventoryRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel("cars-db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "cars" }, () => {
        void queryClient.invalidateQueries({ queryKey: inventoryQueryKey });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
