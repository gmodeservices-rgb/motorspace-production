import { cars as fallbackCars, type Car } from "@/data/cars";
import { isSupabaseConfigured, requireSupabase, supabase } from "@/lib/supabase";

type CarRow = {
  id: string;
  slug: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  mileage: number;
  transmission: string;
  fuel_type: string;
  engine_size: string;
  body_type: string;
  drive_type: string;
  exterior_color: string;
  interior_color: string;
  condition: string;
  location: string;
  availability: Car["availability"];
  is_featured: boolean;
  images: string[] | null;
  features: string[] | null;
  description: string;
  date_added: string;
};

export type CarDraft = Omit<Car, "id">;

export const inventoryQueryKey = ["inventory", "cars"] as const;

const carSelect = `
  id,
  slug,
  make,
  model,
  year,
  price,
  currency,
  mileage,
  transmission,
  fuel_type,
  engine_size,
  body_type,
  drive_type,
  exterior_color,
  interior_color,
  condition,
  location,
  availability,
  is_featured,
  images,
  features,
  description,
  date_added
`;

function rowToCar(row: CarRow): Car {
  return {
    id: row.id,
    slug: row.slug,
    make: row.make,
    model: row.model,
    year: row.year,
    price: row.price,
    currency: row.currency,
    mileage: row.mileage,
    transmission: row.transmission,
    fuelType: row.fuel_type,
    engineSize: row.engine_size,
    bodyType: row.body_type,
    driveType: row.drive_type,
    exteriorColor: row.exterior_color,
    interiorColor: row.interior_color,
    condition: row.condition,
    location: row.location,
    availability: row.availability,
    isFeatured: row.is_featured,
    images: row.images ?? [],
    features: row.features ?? [],
    description: row.description,
    dateAdded: row.date_added,
  };
}

function carToRow(car: CarDraft) {
  return {
    slug: car.slug,
    make: car.make,
    model: car.model,
    year: car.year,
    price: car.price,
    currency: car.currency,
    mileage: car.mileage,
    transmission: car.transmission,
    fuel_type: car.fuelType,
    engine_size: car.engineSize,
    body_type: car.bodyType,
    drive_type: car.driveType,
    exterior_color: car.exteriorColor,
    interior_color: car.interiorColor,
    condition: car.condition,
    location: car.location,
    availability: car.availability,
    is_featured: car.isFeatured,
    images: car.images,
    features: car.features,
    description: car.description,
    date_added: car.dateAdded,
  };
}

function throwSupabaseError(message: string): never {
  throw new Error(message);
}

export async function fetchCars(): Promise<Car[]> {
  if (!isSupabaseConfigured || !supabase) return fallbackCars;

  const { data, error } = await supabase
    .from("cars")
    .select(carSelect)
    .order("date_added", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throwSupabaseError(error.message);

  return ((data ?? []) as CarRow[]).map(rowToCar);
}

export async function fetchCarBySlug(slug: string): Promise<Car | undefined> {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackCars.find((car) => car.slug === slug);
  }

  const { data, error } = await supabase
    .from("cars")
    .select(carSelect)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throwSupabaseError(error.message);

  return data ? rowToCar(data as CarRow) : undefined;
}

export async function createCar(car: CarDraft): Promise<Car> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("cars")
    .insert(carToRow(car))
    .select(carSelect)
    .single();

  if (error) throwSupabaseError(error.message);

  return rowToCar(data as CarRow);
}

export async function updateCar(id: string, car: CarDraft): Promise<Car> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("cars")
    .update(carToRow(car))
    .eq("id", id)
    .select(carSelect)
    .single();

  if (error) throwSupabaseError(error.message);

  return rowToCar(data as CarRow);
}

export async function deleteCar(id: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("cars").delete().eq("id", id);

  if (error) throwSupabaseError(error.message);
}

export function makeCarSlug(year: string | number, make: string, model: string) {
  return `${year} ${make} ${model}`
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
