import { create } from "zustand";
import type {
  TeaSample,
  TeaBowl,
  TeaWhisk,
  PouringTechnique,
} from "@/types";
import {
  teaSampleApi,
  teaBowlApi,
  teaWhiskApi,
  techniqueApi,
} from "@/api/client";

interface ArchiveState {
  teaSamples: TeaSample[];
  teaBowls: TeaBowl[];
  teaWhisks: TeaWhisk[];
  techniques: PouringTechnique[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  fetchTeaSamples: () => Promise<void>;
  fetchTeaBowls: () => Promise<void>;
  fetchTeaWhisks: () => Promise<void>;
  fetchTechniques: () => Promise<void>;
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  teaSamples: [],
  teaBowls: [],
  teaWhisks: [],
  techniques: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [teaSamples, teaBowls, teaWhisks, techniques] = await Promise.all([
        teaSampleApi.list(),
        teaBowlApi.list(),
        teaWhiskApi.list(),
        techniqueApi.list(),
      ]);
      set({ teaSamples, teaBowls, teaWhisks, techniques, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchTeaSamples: async () => {
    const teaSamples = await teaSampleApi.list();
    set({ teaSamples });
  },
  fetchTeaBowls: async () => {
    const teaBowls = await teaBowlApi.list();
    set({ teaBowls });
  },
  fetchTeaWhisks: async () => {
    const teaWhisks = await teaWhiskApi.list();
    set({ teaWhisks });
  },
  fetchTechniques: async () => {
    const techniques = await techniqueApi.list();
    set({ techniques });
  },
}));
