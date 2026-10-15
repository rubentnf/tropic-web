import type { Grupo, Tramo } from './tipos';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Reloj de pared de una fecha como milisegundos "UTC": ignora los cambios de hora de verano/invierno. */
function relojDePared(d: Date): number {
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
}

/** Días de alquiler en bloques de 24h desde la hora de recogida (supuesto a confirmar con el cliente). */
export function calcularDias(recogida: Date, devolucion: Date): number {
    const ms = relojDePared(devolucion) - relojDePared(recogida);
    if (!Number.isFinite(ms) || ms <= 0) return 0;
    return Math.ceil(ms / MS_POR_DIA);
}

export function tramoPorDias(dias: number): Tramo {
    if (dias <= 1) return '1';
    if (dias <= 3) return '2-3';
    if (dias <= 6) return '4-6';
    return '7+';
}

export interface Presupuesto {
    dias: number;
    tramo: Tramo;
    precioDia: number;
    subtotal: number;
    sillas: number;
    totalSillas: number;
    total: number;
}

export type ResultadoPrecio =
    | { ok: true; presupuesto: Presupuesto }
    | { ok: false, motivo: 'fechas' | 'minimo_dias' | 'sin_tarifa'; minDias?: number };

export function calcularPrecio(
    grupo: Grupo,
    dias: number,
    sillas: number,
    precioSillaDia: number,
): ResultadoPrecio {
    if (!Number.isInteger(dias) || dias < 1) return { ok: false, motivo: 'fechas' };
    if (dias < grupo.min_days) return { ok: false, motivo: 'minimo_dias', minDias: grupo.min_days };

    const tramo = tramoPorDias(dias);
    const precioDia = grupo.price_per_day_eur[tramo];
    if (precioDia === null || precioDia === undefined) return { ok: false, motivo: 'sin_tarifa' };

    const n = Math.max(0, Math.floor(sillas));
    const subtotal = dias * precioDia;
    const totalSillas = n * precioSillaDia * dias;
    return {
        ok: true,
        presupuesto: { dias, tramo, precioDia, subtotal, sillas: n, totalSillas, total: subtotal + totalSillas },
    };
}