export type Tramo = '1' | '2-3' | '4-6' | '7+';

export interface Modelo {
    name: string;
    pax: number | string | null;
}

export interface Grupo {
    id: string;
    models: Modelo[];
    gearbox: 'manual' | 'automatic' | 'manual_or_automatic';
    air_conditioning: boolean;
    flyer_column_value: number;
    flyer_photo_model: string;
    min_days: number;
    price_per_day_eur: Record<Tramo, number | null>;
}

export interface Tarifas {
    meta: {
        baby_seat_per_day_eur: number;
        driver_requirements: { min_age: number; max_age: number; min_license_years: number };
        [clave: string]: unknown;
    };
    groups: Grupo[];
}