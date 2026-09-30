<template>
  <div class="app-shell">
    <Sidebar />
    <main class="content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Painel</span><b>/</b><strong>Rotas</strong>
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
          <h1>Rotas</h1>
          <p class="heading-copy">
            Consulte o trajeto percorrido em cada corrida e os detalhes de cada
            parada, sejam coletas e entregas ou pacotes.
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
            >Tipo
            <Dropdown
              v-model="filters.type"
              :options="typeFilterOptions"
              optionLabel="label"
              optionValue="value"
              fluid
          /></label>
        </div>
        <div class="filter-actions">
          <button class="outline-button" @click="resetFilters">Limpar</button>
          <button class="primary-button" @click="loadRoutes">Filtrar</button>
        </div>
      </section>

      <section v-if="selectedRouteId !== null" ref="detailPanel" class="panel detail-panel">
        <div class="panel-heading">
          <div>
            <h2>Detalhes da rota</h2>
            <p v-if="routeDetail">
              {{ routeTypeLabel(routeDetail.type) }} · iniciada em
              {{ formatDateTime(routeDetail.startTime) }}
            </p>
          </div>
          <button class="outline-button" @click="closeDetail">Fechar</button>
        </div>

        <div v-if="detailLoading" class="table-empty">Carregando rota...</div>

        <template v-else-if="routeDetail">
          <div class="stat-grid">
            <div class="stat">
              <span class="detail-label">Status</span>
              <span
                :class="[
                  'status-pill',
                  routeDetail.status === 'Finished' ? 'done' : 'in-progress',
                ]"
                ><i></i
                >{{
                  routeDetail.status === "Finished"
                    ? "Finalizada"
                    : "Em andamento"
                }}</span
              >
            </div>
            <div class="stat">
              <span class="detail-label">Distância</span>
              <strong>{{ formatDistance(routeDetail.totalDistanceKm) }}</strong>
              <small v-if="routeDetail.plannedDistanceKm !== null"
                >previsto {{ formatDistance(routeDetail.plannedDistanceKm) }}</small
              >
            </div>
            <div class="stat">
              <span class="detail-label">Duração</span>
              <strong>{{ minutesLabel(routeDetail.totalMinutes) }}</strong>
              <small v-if="routeDetail.plannedMinutes !== null"
                >previsto {{ minutesLabel(routeDetail.plannedMinutes) }}</small
              >
            </div>
            <div class="stat">
              <span class="detail-label">Paradas</span>
              <strong
                >{{ routeDetail.stopsCompletedCount }} /
                {{ routeDetail.stopsCount }}</strong
              >
              <small>concluídas</small>
            </div>
            <div v-if="routeDetail.type === 'Marketplace'" class="stat">
              <span class="detail-label">Otimização</span>
              <strong>{{ routeDetail.optimized ? "Otimizada" : "Manual" }}</strong>
              <small v-if="routeDetail.reoptimizationCount"
                >{{ routeDetail.reoptimizationCount }} reotimização(ões)</small
              >
            </div>
          </div>

          <div class="detail-columns">
            <div class="map-card">
              <h3>Trajeto percorrido</h3>
              <ClientOnly>
                <RoutesRouteMap
                  ref="routeMap"
                  :detail="routeDetail"
                  @select="selectedStopId = $event"
                />
                <template #fallback>
                  <div class="delivery-offers-placeholder">
                    <MapPin :size="16" />
                    <p>Carregando mapa...</p>
                  </div>
                </template>
              </ClientOnly>
              <div class="map-legend">
                <span><i class="dot planned"></i>Rota planejada</span>
                <span><i class="dot traveled"></i>Trajeto percorrido</span>
                <span><i class="dot origin"></i>Origem</span>
                <span><i class="dot destination"></i>Destino</span>
                <span><i class="dot stop"></i>Paradas (clique no número)</span>
              </div>
              <div class="endpoints">
                <div>
                  <span class="detail-label">Origem</span>
                  <span>{{ routeDetail.originAddress || coordLabel(routeDetail.origin) }}</span>
                </div>
                <div>
                  <span class="detail-label">Destino</span>
                  <span>{{
                    routeDetail.destination
                      ? routeDetail.destinationAddress ||
                        coordLabel(routeDetail.destination)
                      : "Em andamento"
                  }}</span>
                </div>
              </div>
            </div>

            <div class="stops-card">
              <h3>Paradas</h3>
              <div v-if="routeDetail.stops.length === 0" class="table-empty">
                Nenhuma parada registrada.
              </div>
              <ol v-else class="stop-timeline">
                <li
                  v-for="stop in sortedStops"
                  :key="stop.id"
                  :class="[
                    'stop-item',
                    stop.status.toLowerCase(),
                    { active: stop.id === selectedStopId },
                  ]"
                  @click="focusStop(stop.id)"
                >
                  <span class="stop-number">{{ stop.sequence }}</span>
                  <div class="stop-body">
                    <div class="stop-head">
                      <strong>{{ stop.address }}</strong>
                      <span
                        :class="['status-pill', stopStatusClass(stop.status)]"
                        ><i></i>{{ stopStatusLabel(stop.status) }}</span
                      >
                    </div>
                    <p class="stop-address">{{ stop.addressNumber }}</p>
                    <div class="stop-tags">
                      <span class="stop-type">{{ stopTypeLabel(stop.type) }}</span>
                      <span v-if="stop.appName" class="stop-type">{{
                        stop.appName
                      }}</span>
                      <span v-if="stop.value !== null" class="stop-type">{{
                        formatCurrency(stop.value)
                      }}</span>
                      <span v-if="stop.trackingCode" class="stop-type">{{
                        stop.trackingCode
                      }}</span>
                    </div>
                    <div class="stop-times">
                      <span v-if="stop.recipientName"
                        >Destinatário: {{ stop.recipientName }}</span
                      >
                      <span v-if="stop.estimatedArrivalAt"
                        >Previsto: {{ formatTime(stop.estimatedArrivalAt) }}</span
                      >
                      <span v-if="stop.arrivedAt"
                        >Chegada: {{ formatTime(stop.arrivedAt) }}</span
                      >
                      <span v-if="stop.completedAt"
                        >Conclusão: {{ formatTime(stop.completedAt) }}</span
                      >
                      <span v-if="stop.supplierConfirmed !== null"
                        >Baixa no fornecedor:
                        {{ stop.supplierConfirmed ? "confirmada" : "pendente" }}</span
                      >
                    </div>
                    <p v-if="stop.notes" class="stop-notes">{{ stop.notes }}</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </template>
      </section>

      <section class="panel history-panel">
        <div class="panel-heading">
          <div>
            <h2>Histórico de rotas</h2>
            <p>Rotas registradas no período selecionado.</p>
          </div>
        </div>

        <div v-if="routes.length === 0" class="table-empty">
          Nenhuma rota encontrada para o período selecionado.
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Início</th>
                <th>Tipo</th>
                <th>Paradas</th>
                <th>Distância</th>
                <th>Duração</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="route in routes"
                :key="route.id"
                :class="{ selected: route.id === selectedRouteId }"
              >
                <td>{{ formatDateTime(route.startTime) }}</td>
                <td>
                  <span :class="['type-pill', route.type.toLowerCase()]">{{
                    routeTypeLabel(route.type)
                  }}</span>
                </td>
                <td>{{ route.stopsCompletedCount }} / {{ route.stopsCount }}</td>
                <td>{{ formatDistance(route.totalDistanceKm) }}</td>
                <td>{{ minutesLabel(route.totalMinutes) }}</td>
                <td>
                  <span
                    :class="[
                      'status-pill',
                      route.status === 'Finished' ? 'done' : 'in-progress',
                    ]"
                    ><i></i
                    >{{
                      route.status === "Finished" ? "Finalizada" : "Em andamento"
                    }}</span
                  >
                </td>
                <td>
                  <button
                    class="icon-button-sm"
                    aria-label="Ver detalhes"
                    @click="openDetail(route.id)"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from "vue";
import { MapPin, Eye } from "@lucide/vue";
import { DatePicker } from "primevue";
import { useNuxtApp } from "#app";
import useLoading from "~/composable/useLoading";
import { useToastService } from "~/composable/useToast";
import { getLoggedUser } from "~/composable/useAuth";
import type {
  IRouteSummary,
  IRouteDetail,
  IRouteFilter,
  IRoutePoint,
  RouteType,
} from "~/infra/interfaces/services/route";

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

function minutesLabel(total: number) {
  const minutes = Math.max(0, Math.round(total));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
}

function coordLabel(point: IRoutePoint) {
  return `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
}

function routeTypeLabel(type: RouteType) {
  return type === "Delivery" ? "Delivery" : "Marketplace";
}

const typeFilterOptions: { label: string; value: RouteType | null }[] = [
  { label: "Todos", value: null },
  { label: "Delivery", value: "Delivery" },
  { label: "Marketplace", value: "Marketplace" },
];

const filters = reactive({
  startDate: startOfMonth(new Date()),
  endDate: new Date(),
  type: null as RouteType | null,
});

const routes = ref<IRouteSummary[]>([]);

async function loadRoutes() {
  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const filter: IRouteFilter = {
      startDate: filters.startDate ? toIsoDate(filters.startDate) : undefined,
      endDate: filters.endDate ? toIsoDate(filters.endDate) : undefined,
      type: filters.type ?? undefined,
    };
    const response = await $httpClient.route.RouteList(filter);

    if (!response.success) {
      toast.error(
        response.errors[0] ?? "Não foi possível carregar o histórico de rotas.",
      );
      return;
    }

    routes.value = response.result;
  } catch (cause: any) {
    toast.error(
      cause?.errors?.[0] ?? "Não foi possível carregar o histórico de rotas.",
    );
  } finally {
    loadingPop();
  }
}

function resetFilters() {
  filters.startDate = startOfMonth(new Date());
  filters.endDate = new Date();
  filters.type = null;
  loadRoutes();
}

const selectedRouteId = ref<number | null>(null);
const routeDetail = ref<IRouteDetail | null>(null);
const detailLoading = ref(false);
const detailPanel = ref<HTMLElement | null>(null);
const routeMap = ref<{ focusStop: (id: number) => void } | null>(null);
const selectedStopId = ref<number | null>(null);

function focusStop(id: number) {
  selectedStopId.value = id;
  routeMap.value?.focusStop(id);
}

async function openDetail(id: number) {
  selectedRouteId.value = id;
  selectedStopId.value = null;
  routeDetail.value = null;
  detailLoading.value = true;
  await nextTick();
  detailPanel.value?.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.route.GetRouteDetail(id);

    if (!response.success) {
      toast.error(
        response.errors[0] ?? "Não foi possível carregar os detalhes da rota.",
      );
      closeDetail();
      return;
    }

    routeDetail.value = response.result;
  } catch (cause: any) {
    toast.error(
      cause?.errors?.[0] ?? "Não foi possível carregar os detalhes da rota.",
    );
    closeDetail();
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  selectedRouteId.value = null;
  routeDetail.value = null;
  detailLoading.value = false;
}

const sortedStops = computed(() =>
  [...(routeDetail.value?.stops ?? [])].sort((a, b) => a.sequence - b.sequence),
);

onMounted(() => {
  loadRoutes();
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
    color: var(--fg-44956c);
    background: var(--bg-edf8f0);

    i {
      background: var(--bg-55b47a);
    }
  }

  &.in-progress {
    color: var(--fg-c77b2d);
    background: var(--bg-fff4e4);

    i {
      background: var(--bg-efa04e);
    }
  }
}

.type-pill {
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;

  &.delivery {
    color: var(--fg-22714e);
    background: var(--bg-e4f3e9);
  }

  &.marketplace {
    color: var(--fg-3c5fa8);
    background: var(--bg-e6edfa);
  }
}

.filter-panel {
  padding: 19px 23px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 200px));
  gap: 14px;

  label {
    display: block;
    color: var(--fg-506057);
    font-size: 11px;
    font-weight: 600;
  }
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.detail-panel {
  margin-top: 14px;
  padding: 22px 23px;
  scroll-margin-top: 16px;
}

.detail-label {
  color: var(--muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.stat-grid {
  display: flex;
  gap: 32px;
  flex-wrap: wrap;
  margin: 18px 0 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  font-size: 13px;

  strong {
    font-weight: 600;
  }

  small {
    color: var(--muted);
    font-size: 10px;
  }
}

.detail-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 18px;
  align-items: start;

  h3 {
    font: 600 13px "Space Grotesk";
    margin: 0 0 12px;
  }
}

.map-card,
.stops-card {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 16px;
}

.map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: 10px 0 14px;
  font-size: 10px;
  color: var(--muted);

  span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.planned {
      background: var(--bg-2b7fff);
      border-radius: 2px;
    }

    &.traveled {
      background: var(--bg-26845b);
      border-radius: 2px;
    }

    &.origin {
      background: var(--bg-22714e);
    }

    &.destination {
      background: var(--bg-c0503a);
      border-radius: 2px;
    }

    &.stop {
      border: 2px solid var(--bd-5e6c64);
    }
  }
}

.endpoints {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 10px;
  font-size: 12px;
  border-top: 1px solid var(--bd-f0f3f0);
  padding-top: 12px;

  > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    overflow-wrap: anywhere;
  }
}

.delivery-offers-placeholder {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1px dashed var(--bd-d7e2da);
  border-radius: 8px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;

  p {
    margin: 0;
  }
}

.stop-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.stop-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid var(--bd-f0f3f0);

  &:first-child {
    border-top: 0;
    padding-top: 0;
  }
}

.stop-number {
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--bg-f2f6f3);
  color: var(--fg-5e6c64);
  font-size: 11px;
  font-weight: 700;
}

.stop-item {
  cursor: pointer;

  &.active .stop-number {
    background: var(--green);
    color: var(--fg-ffffff);
  }
}

.stop-item.concluído .stop-number {
  background: var(--bg-e4f3e9);
  color: var(--fg-22714e);
}

.stop-body {
  flex: 1;
  min-width: 0;
}

.stop-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  strong {
    font-size: 13px;
  }
}

.stop-address {
  color: var(--muted);
  font-size: 11px;
  margin: 4px 0 8px;
}

.stop-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.stop-type {
  background: var(--bg-f2f6f3);
  color: var(--fg-5e6c64);
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.stop-times {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--fg-5e6c64);
}

.stop-notes {
  margin: 8px 0 0;
  font-size: 11px;
  color: var(--muted);
  font-style: italic;
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
    min-width: 720px;
    border-collapse: collapse;
  }

  th {
    text-align: left;
    color: var(--fg-a0aaa4);
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 0 10px 12px;
  }

  td {
    border-top: 1px solid var(--bd-edf1ee);
    padding: 13px 10px;
    color: var(--fg-78837c);
    font-size: 11px;
    white-space: nowrap;
  }

  tr.selected td {
    background: var(--bg-f6faf7);
  }
}

.icon-button-sm {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: grid;
  place-items: center;
  background: var(--bg-ffffff);
  border: 1px solid var(--bd-dce6df);
  color: var(--fg-5e6c64);
  border-radius: 5px;
  transition: 0.2s all;

  &:hover {
    background: var(--bg-f2f6f3);
    color: var(--green);
  }
}

footer {
  text-align: right;
  color: var(--fg-adb6b0);
  font-size: 10px;
  padding: 19px 0 0;

  span {
    margin: 0 5px;
    color: var(--fg-d0d6d1);
  }
}

@media (max-width: 1050px) {
  .filter-row {
    grid-template-columns: repeat(3, 1fr);
  }

  .detail-columns {
    grid-template-columns: 1fr;
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

  .stat-grid {
    gap: 18px;
  }
}
</style>
