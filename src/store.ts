import { create } from 'zustand';
import { ANY, EMPTY_FILTERS, type EquipmentFilters } from './filter-equipment.ts';
import type { EquipmentStatus } from './types.ts';

interface EquipmentUiState {
  filters: EquipmentFilters;
  selectedId: number | null;
  setSearch: (search: string) => void;
  setStatus: (status: EquipmentStatus | typeof ANY) => void;
  setModel: (model: string) => void;
  clearFilters: () => void;
  setSelectedId: (id: number | null) => void;
}

export const useEquipmentUi = create<EquipmentUiState>((set) => ({
  filters: EMPTY_FILTERS,
  selectedId: null,
  setSearch: (search) => {
    set((state) => ({ filters: { ...state.filters, search } }));
  },
  setStatus: (status) => {
    set((state) => ({ filters: { ...state.filters, status } }));
  },
  setModel: (model) => {
    set((state) => ({ filters: { ...state.filters, model } }));
  },
  clearFilters: () => {
    set({ filters: EMPTY_FILTERS });
  },
  setSelectedId: (selectedId) => {
    set({ selectedId });
  },
}));

/**
 * Small selectors instead of grabbing the whole store in each component. If a
 * component pulls the entire store it re-renders whenever anything in it
 * changes, even parts it doesn't use.
 */
export const selectFilters = (state: EquipmentUiState): EquipmentFilters => state.filters;
export const selectSelectedId = (state: EquipmentUiState): number | null => state.selectedId;
