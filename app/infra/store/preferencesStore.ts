import { defineStore } from "pinia";
import type { IUserPreferences } from "~/infra/interfaces/services/user";

export const DEFAULT_PREFERENCES: IUserPreferences = {
  vehicleName: "",
  vehicleKmPerLiter: null,
  fuelPricePerLiter: null,
  dateFormat: "dd/MM/yyyy",
  timeFormat: "24h",
  timeZone: "America/Sao_Paulo",
  distanceUnit: "km",
  fuelUnit: "l",
};

export const usePreferencesStore = defineStore("preferences", {
  state: (): IUserPreferences => ({ ...DEFAULT_PREFERENCES }),
  getters: {
    // Custo de combustível por km rodado (R$/km), quando consumo e preço estão preenchidos.
    fuelCostPerKm: (state): number | null =>
      state.vehicleKmPerLiter && state.fuelPricePerLiter
        ? state.fuelPricePerLiter / state.vehicleKmPerLiter
        : null,
  },
  actions: {
    setPreferences(preferences: IUserPreferences | null | undefined) {
      this.$patch(preferences ? pickPreferences(preferences) : { ...DEFAULT_PREFERENCES });
    },
  },
});

function pickPreferences(profile: IUserPreferences): IUserPreferences {
  return {
    vehicleName: profile.vehicleName ?? "",
    vehicleKmPerLiter: profile.vehicleKmPerLiter ?? null,
    fuelPricePerLiter: profile.fuelPricePerLiter ?? null,
    dateFormat: profile.dateFormat ?? DEFAULT_PREFERENCES.dateFormat,
    timeFormat: profile.timeFormat ?? DEFAULT_PREFERENCES.timeFormat,
    timeZone: profile.timeZone ?? DEFAULT_PREFERENCES.timeZone,
    distanceUnit: profile.distanceUnit ?? DEFAULT_PREFERENCES.distanceUnit,
    fuelUnit: profile.fuelUnit ?? DEFAULT_PREFERENCES.fuelUnit,
  };
}
