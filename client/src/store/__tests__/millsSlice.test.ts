import { describe, expect, it } from 'vitest';
import reducer, { fetchMills, createMill, updateMill, MillsState } from '../millsSlice';

describe('millsSlice', () => {
  const initial = { items: [] as any[], loading: false, error: null as string | null };

  it('initial', () => {
    expect(reducer(undefined, { type: 'x' })).toEqual(initial);
  });

  it('fetchMills.fulfilled', () => {
    const items = [{ id: 'm1', name: 'Mill A' }];
    const state = reducer(initial, fetchMills.fulfilled(items as any, '', undefined as any));
    expect(state.items).toEqual(items);
  });

  it('createMill.fulfilled', () => {
    const m = { id: 'm2', name: 'New' };
    const state = reducer(initial, createMill.fulfilled(m as any, '', {} as any));
    expect(state.items[0]).toEqual(m);
  });

  it('updateMill.fulfilled', () => {
    const current: MillsState = { ...initial, items: [{ id: 'm1', name: 'Old', avgDailyProduction: 60, contactPerson: 'New', location: { lat: 5, lng: 80 }, phoneNumber: '0881122222' }] };
    const next = reducer(current, updateMill.fulfilled({ id: 'm1', name: 'New' } as any, '', { id: 'm1', data: {} } as any));
    expect(next.items[0].name).toBe('New');
  });
});
