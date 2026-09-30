<template>
  <div class="app-shell">
    <Sidebar />
    <main class="content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Painel</span><b>/</b><strong>Configurações</strong>
        </div>
        <div class="top-actions">
          <div class="live-status">
            <span class="status-dot"></span>Sistema online
          </div>
          <button class="mini-avatar">{{ userInitials }}</button>
        </div>
      </header>

      <section class="page-heading">
        <div>
          <p class="eyebrow">{{ getDateNow.toUpperCase() }}</p>
          <h1>Configurações</h1>
          <p class="heading-copy">
            Ajuste a aparência, seus dados e como o RouteXFlow calcula e exibe
            distâncias, combustível e datas.
          </p>
        </div>
      </section>

      <div class="tabs" role="tablist" aria-label="Seções de configuração">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab"
          :class="{ active: activeTab === tab.value }"
          role="tab"
          :aria-selected="activeTab === tab.value"
          @click="activeTab = tab.value"
        >
          <component :is="tab.icon" :size="15" />{{ tab.label }}
        </button>
      </div>

      <!-- Aparência -->
      <section v-if="activeTab === 'appearance'" class="panel settings-panel">
        <header class="panel-head">
          <h2>Aparência</h2>
          <p>
            O tema vale apenas para esta sessão: continua ao recarregar a
            página, mas volta ao claro quando você sair da conta.
          </p>
        </header>
        <div class="theme-options">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            class="theme-card"
            :class="{ active: theme === option.value }"
            :aria-pressed="theme === option.value"
            @click="setTheme(option.value)"
          >
            <span class="theme-preview" :class="option.value" aria-hidden="true">
              <span class="pv-side"></span>
              <span class="pv-body">
                <span class="pv-line wide"></span>
                <span class="pv-card"></span>
                <span class="pv-line"></span>
              </span>
            </span>
            <span class="theme-name">
              <component :is="option.icon" :size="16" />{{ option.label }}
            </span>
          </button>
        </div>
      </section>

      <!-- Perfil -->
      <template v-if="activeTab === 'profile'">
        <section class="panel settings-panel">
          <header class="panel-head">
            <h2>Perfil</h2>
            <p>Seus dados de contato. E-mail e CPF não podem ser alterados aqui.</p>
          </header>
          <form class="form-grid" @submit.prevent="saveProfile">
            <label class="field">
              Nome
              <InputText v-model="profileForm.name" maxlength="100" fluid />
            </label>
            <label class="field">
              Telefone
              <InputText
                :model-value="profileForm.phoneNumber"
                inputmode="tel"
                placeholder="(00) 00000-0000"
                fluid
                @update:model-value="profileForm.phoneNumber = formatPhone($event ?? '')"
              />
            </label>
            <label class="field">
              E-mail
              <InputText :model-value="user?.email" disabled fluid />
            </label>
            <label class="field">
              CPF
              <InputText :model-value="formatCPF(user?.cpf ?? '')" disabled fluid />
            </label>
            <div class="form-actions">
              <button class="primary-button" type="submit" :disabled="!profileDirty">
                Salvar perfil
              </button>
            </div>
          </form>
        </section>

        <section class="panel settings-panel">
          <header class="panel-head">
            <h2>Senha</h2>
            <p>Use pelo menos 8 caracteres.</p>
          </header>
          <form class="form-grid" @submit.prevent="savePassword">
            <label class="field full">
              Senha atual
              <InputText
                v-model="passwordForm.current"
                type="password"
                autocomplete="current-password"
                fluid
              />
            </label>
            <label class="field">
              Nova senha
              <InputText
                v-model="passwordForm.next"
                type="password"
                autocomplete="new-password"
                fluid
              />
            </label>
            <label class="field">
              Confirmar nova senha
              <InputText
                v-model="passwordForm.confirm"
                type="password"
                autocomplete="new-password"
                fluid
              />
            </label>
            <div class="form-actions">
              <button
                class="primary-button"
                type="submit"
                :disabled="!passwordForm.current || !passwordForm.next"
              >
                Alterar senha
              </button>
            </div>
          </form>
        </section>
      </template>

      <!-- Formatos -->
      <section v-if="activeTab === 'formats'" class="panel settings-panel">
        <header class="panel-head">
          <h2>Formatos de exibição</h2>
          <p>Como datas e horários aparecem em corridas, rotas e financeiro.</p>
        </header>
        <div class="form-grid">
          <label class="field">
            Formato da data
            <Dropdown
              v-model="prefs.dateFormat"
              :options="dateFormatOptions"
              optionLabel="label"
              optionValue="value"
              fluid
            />
          </label>
          <label class="field">
            Formato da hora
            <Dropdown
              v-model="prefs.timeFormat"
              :options="timeFormatOptions"
              optionLabel="label"
              optionValue="value"
              fluid
            />
          </label>
          <label class="field full">
            Fuso horário
            <Dropdown
              v-model="prefs.timeZone"
              :options="timeZoneOptions"
              optionLabel="label"
              optionValue="value"
              fluid
            />
          </label>
        </div>
        <p class="preview">
          <span>Pré-visualização</span>
          <strong>{{ datePreview }}</strong>
        </p>
      </section>

      <!-- Unidades e veículo -->
      <template v-if="activeTab === 'units'">
        <section class="panel settings-panel">
          <header class="panel-head">
            <h2>Unidades</h2>
            <p>
              Os valores continuam guardados em km e litros; aqui você escolhe
              só como eles são exibidos.
            </p>
          </header>
          <div class="form-grid">
            <label class="field">
              Distância
              <Dropdown
                v-model="prefs.distanceUnit"
                :options="distanceOptions"
                optionLabel="label"
                optionValue="value"
                fluid
              />
            </label>
            <label class="field">
              Combustível
              <Dropdown
                v-model="prefs.fuelUnit"
                :options="fuelOptions"
                optionLabel="label"
                optionValue="value"
                fluid
              />
            </label>
          </div>
          <p class="preview">
            <span>Exemplo</span>
            <strong>{{ unitPreview }}</strong>
          </p>
        </section>

        <section class="panel settings-panel">
          <header class="panel-head">
            <h2>Veículo e combustível</h2>
            <p>
              Com o consumo do seu veículo, o sistema consegue estimar quanto
              cada {{ prefs.distanceUnit }} rodado custa de combustível.
            </p>
          </header>
          <div class="form-grid">
            <label class="field full">
              Veículo
              <InputText
                v-model="prefs.vehicleName"
                maxlength="60"
                placeholder="Ex.: Honda CG 160 Start"
                fluid
              />
            </label>
            <label class="field">
              Consumo médio ({{ consumptionLabel }})
              <InputNumber
                :model-value="consumptionDisplay"
                :min="0"
                :max="999"
                :min-fraction-digits="1"
                :max-fraction-digits="2"
                locale="pt-BR"
                placeholder="0,0"
                fluid
                @update:model-value="setConsumption"
              />
            </label>
            <label class="field">
              Preço do combustível (R$/{{ fuelUnitLabel(prefs.fuelUnit) }})
              <InputNumber
                :model-value="priceDisplay"
                :min="0"
                :max="999"
                :min-fraction-digits="2"
                :max-fraction-digits="3"
                locale="pt-BR"
                mode="currency"
                currency="BRL"
                fluid
                @update:model-value="setPrice"
              />
            </label>
          </div>
          <p class="preview">
            <span>Custo estimado de combustível</span>
            <strong>{{ costPreview }}</strong>
          </p>
        </section>
      </template>

      <div v-if="activeTab === 'formats' || activeTab === 'units'" class="save-bar">
        <span v-if="prefsDirty">Você tem alterações não salvas.</span>
        <span v-else>Preferências salvas.</span>
        <button class="primary-button" :disabled="!prefsDirty" @click="savePreferences">
          Salvar preferências
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Sun, Moon, User, CalendarClock, Gauge, Palette } from "@lucide/vue";
import { InputNumber } from "primevue";
import { useNuxtApp } from "#app";
import useLoading from "~/composable/useLoading";
import { useToastService } from "~/composable/useToast";
import { setLoggedUser, setPreferences } from "~/composable/useAuth";
import { useTheme, type Theme } from "~/composable/useTheme";
import { usePreferencesStore } from "~/infra/store/preferencesStore";
import type {
  IUserPreferences,
  IUserProfile,
} from "~/infra/interfaces/services/user";

const toast = useToastService();
const { loadingPush, loadingPop } = useLoading();
const { theme, setTheme } = useTheme();
const preferences = usePreferencesStore();
const user = useState<IUserProfile | null>("auth-user", () => null);

const userInitials = computed(() => {
  const initials = (user.value?.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "RX";
});

type Tab = "appearance" | "profile" | "formats" | "units";
const activeTab = ref<Tab>("appearance");
const tabs = [
  { value: "appearance", label: "Aparência", icon: Palette },
  { value: "profile", label: "Perfil", icon: User },
  { value: "formats", label: "Formatos", icon: CalendarClock },
  { value: "units", label: "Unidades e veículo", icon: Gauge },
] as const;

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
];

// ---------- Perfil ----------
const profileForm = reactive({
  name: user.value?.name ?? "",
  phoneNumber: formatPhone(user.value?.phoneNumber ?? ""),
});
const profileDirty = computed(
  () =>
    profileForm.name.trim() !== (user.value?.name ?? "") ||
    cleanNumber(profileForm.phoneNumber) !== (user.value?.phoneNumber ?? ""),
);

function errorMessage(error: any, fallback: string) {
  return error?.errors?.[0] ?? fallback;
}

async function saveProfile() {
  if (profileForm.name.trim().length < 3) {
    toast.error("Informe seu nome completo.");
    return;
  }
  const phone = cleanNumber(profileForm.phoneNumber);
  if (phone.length < 10) {
    toast.error("Informe um telefone válido com DDD.");
    return;
  }

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.user.UpdateProfile({
      name: profileForm.name.trim(),
      phoneNumber: phone,
    });
    if (!response.success) {
      toast.error(errorMessage(response, "Não foi possível salvar o perfil."));
      return;
    }
    setLoggedUser(response.result);
    profileForm.name = response.result.name;
    profileForm.phoneNumber = formatPhone(response.result.phoneNumber);
    toast.success("Perfil atualizado com sucesso.");
  } catch (error) {
    toast.error(errorMessage(error, "Não foi possível salvar o perfil."));
  } finally {
    loadingPop();
  }
}

// ---------- Senha ----------
const passwordForm = reactive({ current: "", next: "", confirm: "" });

async function savePassword() {
  if (passwordForm.next.length < 8) {
    toast.error("A nova senha deve ter pelo menos 8 caracteres.");
    return;
  }
  if (passwordForm.next !== passwordForm.confirm) {
    toast.error("A confirmação não confere com a nova senha.");
    return;
  }

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.user.ChangePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.next,
    });
    if (!response.success) {
      toast.error(errorMessage(response, "Não foi possível alterar a senha."));
      return;
    }
    Object.assign(passwordForm, { current: "", next: "", confirm: "" });
    toast.success("Senha alterada com sucesso.");
  } catch (error) {
    toast.error(errorMessage(error, "Não foi possível alterar a senha."));
  } finally {
    loadingPop();
  }
}

// ---------- Preferências (formatos, unidades e veículo) ----------
function snapshot(): IUserPreferences {
  return {
    vehicleName: preferences.vehicleName,
    vehicleKmPerLiter: preferences.vehicleKmPerLiter,
    fuelPricePerLiter: preferences.fuelPricePerLiter,
    dateFormat: preferences.dateFormat,
    timeFormat: preferences.timeFormat,
    timeZone: preferences.timeZone,
    distanceUnit: preferences.distanceUnit,
    fuelUnit: preferences.fuelUnit,
  };
}

const prefs = reactive<IUserPreferences>(snapshot());
const prefsDirty = computed(
  () => JSON.stringify(prefs) !== JSON.stringify(snapshot()),
);

const dateFormatOptions = [
  { label: "DD/MM/AAAA (30/09/2026)", value: "dd/MM/yyyy" },
  { label: "MM/DD/AAAA (09/30/2026)", value: "MM/dd/yyyy" },
  { label: "AAAA-MM-DD (2026-09-30)", value: "yyyy-MM-dd" },
];
const timeFormatOptions = [
  { label: "24 horas (15:30)", value: "24h" },
  { label: "12 horas (3:30 PM)", value: "12h" },
];
const timeZoneOptions = [
  { label: "Brasília (America/Sao_Paulo)", value: "America/Sao_Paulo" },
  { label: "Manaus (America/Manaus)", value: "America/Manaus" },
  { label: "Cuiabá (America/Cuiaba)", value: "America/Cuiaba" },
  { label: "Fortaleza (America/Fortaleza)", value: "America/Fortaleza" },
  { label: "Rio Branco (America/Rio_Branco)", value: "America/Rio_Branco" },
  { label: "Fernando de Noronha (America/Noronha)", value: "America/Noronha" },
  { label: "Lisboa (Europe/Lisbon)", value: "Europe/Lisbon" },
  { label: "Nova York (America/New_York)", value: "America/New_York" },
  { label: "UTC", value: "UTC" },
];
const distanceOptions = [
  { label: "Quilômetros (km)", value: "km" },
  { label: "Milhas (mi)", value: "mi" },
];
const fuelOptions = [
  { label: "Litros (L)", value: "l" },
  { label: "Galões (gal)", value: "gal" },
];

const datePreview = computed(() => formatDateTime(new Date(), prefs));

// Consumo e preço ficam guardados em km/L e R$/L; estes computeds só convertem a exibição.
const round = (value: number, digits: number) =>
  Math.round(value * 10 ** digits) / 10 ** digits;
const dFactor = computed(() => distanceFactor(prefs.distanceUnit));
const fFactor = computed(() => fuelFactor(prefs.fuelUnit));

const consumptionLabel = computed(
  () => `${prefs.distanceUnit}/${fuelUnitLabel(prefs.fuelUnit)}`,
);
const consumptionDisplay = computed(() =>
  prefs.vehicleKmPerLiter == null
    ? null
    : round((prefs.vehicleKmPerLiter / dFactor.value) * fFactor.value, 2),
);
const priceDisplay = computed(() =>
  prefs.fuelPricePerLiter == null
    ? null
    : round(prefs.fuelPricePerLiter * fFactor.value, 3),
);

function setConsumption(value: number | null) {
  prefs.vehicleKmPerLiter =
    value == null || value <= 0
      ? null
      : round((value * dFactor.value) / fFactor.value, 4);
}
function setPrice(value: number | null) {
  prefs.fuelPricePerLiter =
    value == null || value <= 0 ? null : round(value / fFactor.value, 4);
}

const costPreview = computed(() => {
  if (!prefs.vehicleKmPerLiter || !prefs.fuelPricePerLiter) {
    return "Informe consumo e preço para calcular";
  }
  const perKm = prefs.fuelPricePerLiter / prefs.vehicleKmPerLiter;
  return `${formatCurrency(perKm * dFactor.value)}/${prefs.distanceUnit} · ${formatCurrency(perKm * dFactor.value * 100)} a cada 100 ${prefs.distanceUnit}`;
});

const unitPreview = computed(() => {
  const distance = `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(12 / dFactor.value)} ${prefs.distanceUnit}`;
  return `12 km → ${distance} · consumo em ${consumptionLabel.value}`;
});

async function savePreferences() {
  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.user.UpdatePreferences({
      ...prefs,
      vehicleName: prefs.vehicleName.trim(),
    });
    if (!response.success) {
      toast.error(errorMessage(response, "Não foi possível salvar as preferências."));
      return;
    }
    setPreferences(response.result);
    Object.assign(prefs, snapshot());
    toast.success("Preferências salvas com sucesso.");
  } catch (error) {
    toast.error(errorMessage(error, "Não foi possível salvar as preferências."));
  } finally {
    loadingPop();
  }
}
</script>

<style lang="scss" scoped>
.heading-copy {
  color: var(--muted);
  font-size: 13px;
  margin: 8px 0 0;
  max-width: 560px;
}

.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 22px;
  overflow-x: auto;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 14px;
  background: transparent;
  color: var(--muted);
  border: 0;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-size: 13px;
  white-space: nowrap;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    color: var(--ink);
  }

  &.active {
    color: var(--green);
    border-bottom-color: var(--green);
    font-weight: 600;
  }
}

.settings-panel {
  max-width: 820px;
  padding: 24px;
  margin-bottom: 18px;
}

.panel-head {
  margin-bottom: 20px;

  h2 {
    font: 600 18px "Space Grotesk";
    margin: 0 0 6px;
  }

  p {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.6;
    margin: 0;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;

  &.full {
    grid-column: 1 / -1;
  }
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;

  &:hover {
    scale: 1;
    background: var(--green);
  }
}

.preview {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  margin: 20px 0 0;
  padding: 12px 14px;
  background: var(--bg-f2f6f3);
  border-radius: 6px;
  font-size: 12px;

  span {
    color: var(--muted);
  }

  strong {
    color: var(--ink);
    font-weight: 600;
  }
}

.save-bar {
  max-width: 820px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 220px));
  gap: 16px;
}

.theme-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: transparent;
  color: var(--ink);
  border: 2px solid var(--line);
  border-radius: 10px;
  text-align: left;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: var(--muted);
  }

  &.active {
    border-color: var(--green);
  }
}

// As miniaturas mostram sempre as cores reais de cada tema, por isso não usam tokens.
.theme-preview {
  display: flex;
  height: 92px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #00000014;

  .pv-side {
    width: 28%;
  }

  .pv-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 10px;
  }

  .pv-line {
    height: 6px;
    width: 55%;
    border-radius: 3px;

    &.wide {
      width: 80%;
    }
  }

  .pv-card {
    flex: 1;
    border-radius: 4px;
  }

  &.light {
    background: #fcfdfc;

    .pv-side {
      background: #f6f8f6;
    }
    .pv-line {
      background: #dce6df;
    }
    .pv-card {
      background: #fff;
      border: 1px solid #e5ebe6;
    }
  }

  &.dark {
    background: #0c100e;

    .pv-side {
      background: #0f1412;
    }
    .pv-line {
      background: #2b332e;
    }
    .pv-card {
      background: #191c1b;
      border: 1px solid #2b332e;
    }
  }
}

.theme-name {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
}

@media (max-width: 680px) {
  .form-grid,
  .theme-options {
    grid-template-columns: 1fr;
  }

  .settings-panel {
    padding: 18px;
  }

  .save-bar {
    flex-direction: column;
    align-items: stretch;
    text-align: center;

    .primary-button {
      width: 100%;
    }
  }
}
</style>
