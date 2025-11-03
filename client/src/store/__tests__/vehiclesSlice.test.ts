import { describe, expect, it } from 'vitest';
import reducer, {
  fetchVehicles,
  createVehicle,
  updateVehicleStatus,
  assignVehicleDriver,
  updateVehicle
} from '../vehiclesSlice';

describe('vehiclesSlice', () => {
  const initial = { items: [], loading: false, error: null as string | null };

  it('initial', () => {
    expect(reducer(undefined, { type: 'x' })).toEqual(initial);
  });

  it('fetchVehicles.fulfilled', () => {
    const items = [{ id: 'v1', plateNumber: 'B-1', status: 'idle' }];
    const state = reducer(initial, fetchVehicles.fulfilled(items as any, '', undefined as any));
    expect(state.items).toEqual(items);
  });

  it('createVehicle.fulfilled', () => {
    const v = { id: 'v2', plateNumber: 'B-2', status: 'idle' };
    const state = reducer(initial, createVehicle.fulfilled(v as any, '', {} as any));
    expect(state.items[0]).toEqual(v);
  });

  it('updateVehicleStatus.fulfilled', () => {
    const current = { ...initial, items: [{ id: 'v1', status: 'idle' }] as any[] };
    const next = reducer(current, updateVehicleStatus.fulfilled({ id: 'v1', status: 'maintenance' } as any, '', { id: 'v1', status: 'maintenance' } as any));
    expect(next.items[0].status).toBe('maintenance');
  });

  it('assignVehicleDriver.fulfilled', () => {
    const current = { ...initial, items: [{ id: 'v1', driverId: null }] as any[] };
    const next = reducer(current, assignVehicleDriver.fulfilled({ id: 'v1', driverId: 'd1' } as any, '', { id: 'v1', driverId: 'd1' } as any));
    expect(next.items[0].driverId).toBe('d1');
  });

  it('updateVehicle.fulfilled', () => {
    const current = { ...initial, items: [{ id: 'v1', plateNumber: 'OLD' }] as any[] };
    const next = reducer(current, updateVehicle.fulfilled({ id: 'v1', plateNumber: 'NEW' } as any, '', { id: 'v1', data: {} } as any));
    expect(next.items[0].plateNumber).toBe('NEW');
  });
});
