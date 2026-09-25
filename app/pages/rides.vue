<template>
  <div class="app-shell">
    <Sidebar />
    <main class="content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Painel</span><b>/</b><strong>Corridas</strong>
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
          <h1>Corridas</h1>
          <p class="heading-copy">
            Inicie e finalize suas corridas e acompanhe o histórico de sessões
            de trabalho.
          </p>
        </div>
        <button
          v-if="!activeSession"
          class="primary-button"
          :disabled="!isReadyToStart"
          @click="startRide"
        >
          <Play :size="14" /> Iniciar corrida
        </button>
        <button v-else class="danger-button" @click="finishRide">
          <Square :size="14" /> Finalizar corrida
        </button>
      </section>

      <section class="panel sync-status-panel">
        <div class="panel-heading">
          <div>
            <h2>Status de sincronização</h2>
            <p>
              É necessário no mínimo 1 dispositivo Mestre e 1 Navegador
              conectados para iniciar uma corrida.
            </p>
          </div>
          <span
            :class="['status-pill', isReadyToStart ? 'done' : 'in-progress']"
            ><i></i
            >{{
              isReadyToStart ? "Pronto para iniciar" : "Sincronização pendente"
            }}</span
          >
        </div>

        <div v-if="containers.length === 0" class="sync-empty">
          <span>Nenhum container cadastrado ainda.</span>
          <NuxtLink class="outline-button" to="/sync"
            >Ir para sincronização</NuxtLink
          >
        </div>

        <div v-else class="sync-summary">
          <div
            v-for="container in containers"
            :key="container.id"
            class="sync-row"
          >
            <div class="sync-row-info">
              <span class="device-icon"><Smartphone :size="14" /></span>
              <div>
                <strong>{{ container.name }}</strong>
                <span :class="{ inactive: !container.isActive }">{{
                  container.isActive ? "Ativo" : "Inativo"
                }}</span>
              </div>
            </div>
            <div class="sync-row-counts">
              <span
                :class="[
                  'count-pill',
                  ownerConnected(container).length >= 1 ? 'ok' : 'warn',
                ]"
              >
                {{ ownerConnected(container).length }} owner conectado(s)
              </span>
              <span
                :class="[
                  'count-pill',
                  navigationConnected(container).length >= 1 ? 'ok' : 'warn',
                ]"
              >
                {{ navigationConnected(container).length }} navigation
                conectado(s)
              </span>
            </div>
          </div>
          <NuxtLink v-if="!isReadyToStart" class="outline-button" to="/sync"
            >Ajustar dispositivos</NuxtLink
          >
        </div>
      </section>

      <section v-if="activeSession" class="panel active-ride-panel">
        <div class="panel-heading">
          <div>
            <h2>Corrida em andamento</h2>
            <p>Iniciada em {{ formatDate(activeSession.startTime) }}</p>
          </div>
          <span class="status-pill in-progress"
            ><i></i>Em andamento · {{ elapsedLabel }}</span
          >
        </div>
        <div class="active-ride-body">
          <div class="active-ride-detail">
            <span class="detail-label">Container</span>
            <span>{{ activeSession.containerName || "—" }}</span>
          </div>
          <div class="active-ride-detail">
            <span class="detail-label">Ofertas detectadas</span>
            <span>{{ activeSessionDetail?.deliveryOffers.length ?? 0 }}</span>
          </div>
        </div>

        <div
          v-if="activeSessionDetail?.deliveryOffers.length"
          class="offer-list"
        >
          <article
            v-for="offer in activeSessionDetail.deliveryOffers"
            :key="offer.id"
            class="offer-card"
          >
            <div class="offer-card-header">
              <strong>{{ offer.name }}</strong>
              <span
                :class="[
                  'status-pill',
                  offer.routeEvaluation?.recommended ? 'done' : 'in-progress',
                ]"
                ><i></i
                >{{
                  offer.routeEvaluation?.recommended
                    ? "Recomendada"
                    : "Avaliar"
                }}</span
              >
            </div>
            <p class="offer-description">{{ offer.description }}</p>
            <div class="offer-meta">
              <span>{{ formatCurrency(offer.value + offer.bonusValue) }}</span>
              <span>{{ offer.totalDistanceKm }} km</span>
              <span>{{ offer.estimatedMinutes }} min</span>
              <span v-if="offer.routeEvaluation"
                >{{ formatCurrency(offer.routeEvaluation.valuePerKm) }}/km</span
              >
            </div>
            <div class="offer-stops">
              <div
                v-for="stop in offer.stops"
                :key="stop.id"
                class="offer-stop"
              >
                <span class="stop-type">{{
                  stop.type === "Pickup" ? "Coleta" : "Entrega"
                }}</span>
                <span>{{ stop.address }}</span>
              </div>
            </div>
          </article>
        </div>
        <div v-else class="delivery-offers-placeholder">
          <MapPin :size="16" />
          <p>
            As ofertas de entrega aparecerão aqui assim que
            forem detectadas.
          </p>
        </div>
      </section>

      <section class="panel filter-panel">
        <div class="filter-row">
          <label
            >De
            <DatePicker
              v-model="filters.startDate"
              dateFormat="dd/mm/yy"
              showIcon
              fluid
          /></label>
          <label
            >Até
            <DatePicker
              v-model="filters.endDate"
              dateFormat="dd/mm/yy"
              showIcon
              fluid
          /></label>
          <label
            >Status
            <Dropdown
              v-model="filters.status"
              :options="statusFilterOptions"
              optionLabel="label"
              optionValue="value"
              fluid
          /></label>
        </div>
        <div class="filter-actions">
          <button class="outline-button" @click="resetFilters">Limpar</button>
          <button class="primary-button" @click="loadHistory">Filtrar</button>
        </div>
      </section>

      <section class="panel history-panel">
        <div class="panel-heading">
          <div>
            <h2>Histórico de corridas</h2>
            <p>Sessões de trabalho registradas no período selecionado.</p>
          </div>
        </div>

        <div v-if="sessions.length === 0" class="table-empty">
          Nenhuma corrida encontrada para o período selecionado.
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Início</th>
                <th>Fim</th>
                <th>Duração</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="session in sessions" :key="session.id">
                <td>
                  {{ session.startTime ? formatDate(session.startTime) : "—" }}
                </td>
                <td>
                  {{ session.endTime ? formatDate(session.endTime) : "—" }}
                </td>
                <td>{{ durationLabel(session) }}</td>
                <td>
                  <span
                    :class="[
                      'status-pill',
                      !session.endTime ? 'in-progress' : 'done',
                    ]"
                    ><i></i
                    >{{ !session.endTime ? "Em andamento" : "Finalizada" }}</span
                  >
                </td>
                <td>
                  <button
                    class="icon-button-sm"
                    aria-label="Ver detalhes"
                    @click="openSessionDetail(session)"
                  >
                    <Eye :size="13" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer>RouteXFlow <span>·</span> Painel administrativo</footer>
    </main>

    <Dialog
      v-model:visible="showSessionDetail"
      modal
      header="Detalhes da corrida"
      class="rides-dialog"
      :style="{ width: '440px' }"
    >
      <div v-if="sessionDetail" class="dialog-form">
        <div class="detail-row">
          <span class="detail-label">Início</span>
          <span>{{
            sessionDetail.startTime ? formatDate(sessionDetail.startTime) : "—"
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fim</span>
          <span>{{
            sessionDetail.endTime
              ? formatDate(sessionDetail.endTime)
              : "Em andamento"
          }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Container</span>
          <span>{{ sessionDetail.containerName || "—" }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ofertas de entrega</span>
          <span>{{ sessionDetail.deliveryOffers.length }}</span>
        </div>

        <div v-if="sessionDetail.deliveryOffers.length" class="offer-list">
          <article
            v-for="offer in sessionDetail.deliveryOffers"
            :key="offer.id"
            class="offer-card"
          >
            <div class="offer-card-header">
              <strong>{{ offer.name }}</strong>
              <span
                :class="[
                  'status-pill',
                  offer.routeEvaluation?.recommended ? 'done' : 'in-progress',
                ]"
                ><i></i
                >{{
                  offer.routeEvaluation?.recommended
                    ? "Recomendada"
                    : "Avaliar"
                }}</span
              >
            </div>
            <p class="offer-description">{{ offer.description }}</p>
            <div class="offer-meta">
              <span>{{ formatCurrency(offer.value + offer.bonusValue) }}</span>
              <span>{{ offer.totalDistanceKm }} km</span>
              <span>{{ offer.estimatedMinutes }} min</span>
              <span v-if="offer.routeEvaluation"
                >{{ formatCurrency(offer.routeEvaluation.valuePerKm) }}/km</span
              >
            </div>
            <div class="offer-stops">
              <div
                v-for="stop in offer.stops"
                :key="stop.id"
                class="offer-stop"
              >
                <span class="stop-type">{{
                  stop.type === "Pickup" ? "Coleta" : "Entrega"
                }}</span>
                <span>{{ stop.address }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div class="dialog-actions">
        <button
          type="button"
          class="outline-button"
          @click="showSessionDetail = false"
        >
          Fechar
        </button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { Play, Square, MapPin, Smartphone, Eye } from "@lucide/vue";
import { DatePicker } from "primevue";
import { useNuxtApp } from "#app";
import useLoading from "~/composable/useLoading";
import { useToastService } from "~/composable/useToast";
import { getLoggedUser } from "~/composable/useAuth";
import type { IContainer } from "~/infra/interfaces/services/container";
import type {
  IWorkSession,
  IWorkSessionDetail,
  IWorkSessionFilter,
  WorkSessionStatus,
} from "~/infra/interfaces/services/workSession";

const toast = useToastService();
const { loadingPush, loadingPop } = useLoading();

const user = getLoggedUser();
const userInitials = computed(() => {
  const name = user?.name ?? "";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "WSC";
});

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toIsoDate(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).toISOString();
}

function getCurrentPosition(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocalização não é suportada neste navegador."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        reject(
          new Error(
            "Não foi possível obter sua localização. Habilite o acesso ao GPS.",
          ),
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

const nowTick = ref(Date.now());
let tickInterval: ReturnType<typeof setInterval> | undefined;

function durationLabel(session: IWorkSession) {
  if (!session.startTime) return "—";

  const start = new Date(session.startTime).getTime();
  const end = session.endTime
    ? new Date(session.endTime).getTime()
    : nowTick.value;

  if (Number.isNaN(start) || Number.isNaN(end)) return "—";

  const minutes = Math.max(0, Math.round((end - start) / 60000));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
}

const elapsedLabel = computed(() =>
  activeSession.value ? durationLabel(activeSession.value) : "",
);

const containers = ref<IContainer[]>([]);

function ownerConnected(container: IContainer) {
  return container.devices.filter(
    (device) => device.deviceIdentifier === "owner" && device.connected,
  );
}

function navigationConnected(container: IContainer) {
  return container.devices.filter(
    (device) => device.deviceIdentifier === "navigation" && device.connected,
  );
}

const isReadyToStart = computed(() =>
  containers.value.some(
    (container) =>
      container.isActive &&
      ownerConnected(container).length >= 1 &&
      navigationConnected(container).length >= 1,
  ),
);

async function loadContainers() {
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.container.ContainerList();
    if (response.success) {
      containers.value = response.result;
    }
  } catch {
    containers.value = [];
  }
}

const activeSession = ref<IWorkSession | null>(null);
const activeSessionDetail = ref<IWorkSessionDetail | null>(null);

async function loadActiveSessionDetail() {
  if (!activeSession.value) {
    activeSessionDetail.value = null;
    return;
  }

  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.workSession.GetWorkSessionDetail(
      activeSession.value.id,
    );
    activeSessionDetail.value = response.success ? response.result : null;
  } catch {
    activeSessionDetail.value = null;
  }
}

async function checkActiveSession() {
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.workSession.WorkSessionList({});
    const open = response.success
      ? (response.result.find((session) => !session.endTime) ?? null)
      : null;
    activeSession.value = open;
  } catch {
    activeSession.value = null;
  }

  await loadActiveSessionDetail();
}

async function startRide() {
  loadingPush();
  try {
    const position = await getCurrentPosition();
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.workSession.StartWorkSession({
      latitude: position.latitude,
      longitude: position.longitude,
    });

    if (!response.success) {
      toast.error(response.errors[0] ?? "Não foi possível iniciar a corrida.");
      return;
    }

    toast.success("Corrida iniciada com sucesso.");
    activeSession.value = response.result;
    await loadActiveSessionDetail();
    await loadHistory();
  } catch (cause: any) {
    const message =
      cause?.errors?.[0] ??
      cause?.message ??
      "Não foi possível iniciar a corrida. Tente novamente.";
    toast.error(message);
  } finally {
    loadingPop();
  }
}

async function finishRide() {
  if (!activeSession.value) return;

  loadingPush();
  try {
    const position = await getCurrentPosition();
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.workSession.FinishWorkSession(
      activeSession.value.id,
      { latitude: position.latitude, longitude: position.longitude },
    );

    if (!response.success) {
      toast.error(
        response.errors[0] ?? "Não foi possível finalizar a corrida.",
      );
      return;
    }

    toast.success("Corrida finalizada com sucesso.");
    activeSession.value = null;
    activeSessionDetail.value = null;
    await loadHistory();
  } catch (cause: any) {
    const message =
      cause?.errors?.[0] ??
      cause?.message ??
      "Não foi possível finalizar a corrida. Tente novamente.";
    toast.error(message);
  } finally {
    loadingPop();
  }
}

const statusFilterOptions: {
  label: string;
  value: WorkSessionStatus | null;
}[] = [
  { label: "Todos", value: null },
  { label: "Em andamento", value: "open" },
  { label: "Finalizada", value: "closed" },
];

const filters = reactive({
  startDate: startOfMonth(new Date()),
  endDate: new Date(),
  status: null as WorkSessionStatus | null,
});

const sessions = ref<IWorkSession[]>([]);

async function loadHistory() {
  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const filter: IWorkSessionFilter = {
      startDate: filters.startDate ? toIsoDate(filters.startDate) : undefined,
      endDate: filters.endDate ? toIsoDate(filters.endDate) : undefined,
    };
    const response = await $httpClient.workSession.WorkSessionList(filter);

    if (!response.success) {
      toast.error(
        response.errors[0] ??
          "Não foi possível carregar o histórico de corridas.",
      );
      return;
    }

    sessions.value =
      filters.status === null
        ? response.result
        : response.result.filter((session) =>
            filters.status === "open" ? !session.endTime : !!session.endTime,
          );
  } catch (cause: any) {
    toast.error(
      cause?.errors?.[0] ??
        "Não foi possível carregar o histórico de corridas.",
    );
  } finally {
    loadingPop();
  }
}

function resetFilters() {
  filters.startDate = startOfMonth(new Date());
  filters.endDate = new Date();
  filters.status = null;
  loadHistory();
}

const showSessionDetail = ref(false);
const sessionDetail = ref<IWorkSessionDetail | null>(null);

async function openSessionDetail(session: IWorkSession) {
  sessionDetail.value = null;
  showSessionDetail.value = true;

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.workSession.GetWorkSessionDetail(
      session.id,
    );

    if (!response.success) {
      toast.error(
        response.errors[0] ??
          "Não foi possível carregar os detalhes da corrida.",
      );
      showSessionDetail.value = false;
      return;
    }

    sessionDetail.value = response.result;
  } catch (cause: any) {
    toast.error(
      cause?.errors?.[0] ?? "Não foi possível carregar os detalhes da corrida.",
    );
    showSessionDetail.value = false;
  } finally {
    loadingPop();
  }
}

onMounted(() => {
  loadContainers();
  checkActiveSession();
  loadHistory();
  tickInterval = setInterval(() => {
    nowTick.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (tickInterval) clearInterval(tickInterval);
});
</script>

<style lang="scss" scoped>
.page-heading {
  padding: 35px 0 27px;
  display: flex;
  align-items: end;
  justify-content: space-between;

  h1 {
    font: 700 30px "Space Grotesk";
    letter-spacing: -1.2px;
    margin: 0;
  }
}

.heading-copy {
  max-width: 480px;
  color: var(--muted);
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.primary-button,
.danger-button {
  display: flex;
  align-items: center;
  gap: 6px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.panel-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 10px;

  h2 {
    font: 600 16px "Space Grotesk";
    margin: 0 0 5px;
  }

  p {
    margin: 0;
    color: var(--muted);
    font-size: 11px;
    max-width: 420px;
  }
}

.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 20px;
  padding: 5px 10px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;

  i {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    margin-right: 6px;
  }

  &.done {
    color: #44956c;
    background: #edf8f0;

    i {
      background: #55b47a;
    }
  }

  &.in-progress {
    color: #c77b2d;
    background: #fff4e4;

    i {
      background: #efa04e;
    }
  }
}

.sync-status-panel {
  padding: 22px 23px;
}

.sync-empty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
  margin-top: 18px;
}

.sync-summary {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sync-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #f0f3f0;

  &:first-of-type {
    border-top: 0;
    padding-top: 0;
  }
}

.sync-row-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .device-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f2f6f3;
    color: #5e6c64;
    border-radius: 8px;
  }

  strong {
    display: block;
    font-size: 13px;
  }

  span {
    display: block;
    color: var(--muted);
    font-size: 10px;
    margin-top: 3px;

    &.inactive {
      color: #c07a4e;
    }
  }
}

.sync-row-counts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.count-pill {
  border-radius: 20px;
  padding: 5px 10px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;

  &.ok {
    color: #22714e;
    background: #e4f3e9;
  }

  &.warn {
    color: #c07a4e;
    background: #fbe9df;
  }
}

.sync-summary > .outline-button {
  margin-top: 14px;
}

.active-ride-panel {
  margin-top: 14px;
  padding: 22px 23px;
}

.active-ride-body {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  margin: 18px 0 16px;
}

.active-ride-detail {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
}

.detail-label {
  color: var(--muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.delivery-offers-placeholder {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1px dashed #d7e2da;
  border-radius: 8px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;

  p {
    margin: 0;
  }
}

.offer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.offer-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 14px 16px;
}

.offer-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;

  strong {
    font-size: 13px;
  }
}

.offer-description {
  color: var(--muted);
  font-size: 11px;
  margin: 0 0 10px;
}

.offer-meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 12px;
  font-weight: 600;
  color: #48564e;
  margin-bottom: 10px;
}

.offer-stops {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid #f0f3f0;
  padding-top: 10px;
}

.offer-stop {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #5e6c64;
}

.stop-type {
  flex: 0 0 auto;
  background: #f2f6f3;
  color: #5e6c64;
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.filter-panel {
  margin-top: 14px;
  padding: 19px 23px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(3, 200px);
  gap: 14px;

  label {
    display: block;
    color: #506057;
    font-size: 11px;
    font-weight: 600;
  }
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.history-panel {
  margin-top: 14px;
  padding: 22px 23px 8px;
}

.table-empty {
  color: var(--muted);
  font-size: 12px;
  padding: 30px 0;
  text-align: center;
}

.table-wrap {
  overflow-x: auto;
  margin-top: 20px;

  table {
    width: 100%;
    min-width: 620px;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    color: #a0aaa4;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 0 10px 12px;
  }

  td {
    border-top: 1px solid #edf1ee;
    padding: 13px 10px;
    color: #78837c;
    font-size: 11px;
    white-space: nowrap;
  }
}

.icon-button-sm {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: grid;
  place-items: center;
  background: #fff;
  border: 1px solid #dce6df;
  color: #5e6c64;
  border-radius: 5px;
  transition: 0.2s all;

  &:hover {
    background: #f2f6f3;
    color: var(--green);
  }
}

footer {
  text-align: right;
  color: #adb6b0;
  font-size: 10px;
  padding: 19px 0 0;

  span {
    margin: 0 5px;
    color: #d0d6d1;
  }
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;

  .detail-label {
    text-transform: none;
    letter-spacing: 0;
    font-weight: 600;
  }
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

@media (max-width: 1050px) {
  .filter-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 680px) {
  .filter-panel {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-row {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    justify-content: stretch;

    button {
      flex: 1;
    }
  }

  .active-ride-body {
    gap: 18px;
  }
}
</style>
