import { describe, expect, it } from 'vitest';
import tarifas from '../data/tarifas.json';
import type { Tarifas } from './tipos';
import { calcularDias, calcularPrecio, tramoPorDias } from './precios';

const data = tarifas as unknown as Tarifas;
const grupo = (id: string) => {
    const g = data.groups.find((x) => x.id === id);
    if (!g) throw new Error(`Group ${id} no existe`);
    return g;
};
const silla = data.meta.baby_seat_per_day_eur;

describe('tramoPorDias', () => {
    it.each([
        [1, '1'],
        [2, '2-3'],
        [3, '2-3'],
        [4, '4-6'],
        [6, '4-6'],
        [7, '7+'],
        [30, '7+'],
    ])('%i días -> tramo %s', (dias, tramo) => {
        expect(tramoPorDias(dias)).toBe(tramo);
    });
});

describe('calcularDias', () => {
    it('cuenta bloques de 24h desde la recogida', () => {
        const a = new Date('2026-11-01T10:00:00');
        expect(calcularDias(a, new Date('2026-11-02T10:00:00'))).toBe(1);
        expect(calcularDias(a, new Date('2026-11-02T10:30:00'))).toBe(2);
        expect(calcularDias(a, new Date('2026-11-06T09:00:00'))).toBe(5);
    });
    it('no se ve afectado por el cambio de hora de octubre', () => {
        // En Canarias el reloj se atrasa 1h el 25/10/2026: del 24 al 26 son dos días, no 3.
        const a = new Date(2026, 9, 24, 10, 0);
        const b = new Date(2026, 9, 26, 10, 0);
        expect(calcularDias(a, b)).toBe(2);
    });
    it('devuelve 0 si la devolución no es posterior', () => {
        const a = new Date('2026-11-01T10:00:00');
        expect(calcularDias(a, a)).toBe(0);
        expect(calcularDias(a, new Date('2026-10-31T10:00:00'))).toBe(0);
    });
});

describe('calcularPrecio', () => {
    it('ejemplo del presupuesto: grupo B, 5 días = 225 €', () => {
        const r = calcularPrecio(grupo('B'), 5, 0, silla);
        expect(r.ok && r.presupuesto.total).toBe(225);
    });
    it('ejemplo del presupuesto: con una silla = 250 €', () => {
        const r = calcularPrecio(grupo('B'), 5, 1, silla);
        expect(r.ok && r.presupuesto.total).toBe(250);
    });
    it('grupo I no se alquila 1 día', () => {
        const r = calcularPrecio(grupo('I'), 1, 0, silla);
        expect(r).toEqual({ ok: false, motivo: 'minimo_dias', minDias: 2 });
    });
    it('grupo I, 2 días = 350 €', () => {
        const r = calcularPrecio(grupo('I'), 2, 0, silla);
        expect(r.ok && r.presupuesto.total).toBe(350);
    });
    it('rechaza días no válidos', () => {
        expect(calcularPrecio(grupo('A'), 0, 0, silla)).toEqual({ ok: false, motivo: 'fechas' });
    });
    it('todos los grupos tienen tarifa para su tramo mínimo', () => {
        for (const g of data.groups) {
            const r = calcularPrecio(g, g.min_days, 0, silla);
            expect(r.ok, `grupo ${g.id}`).toBe(true);
        }
    });
});