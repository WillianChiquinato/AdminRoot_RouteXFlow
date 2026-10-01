<template>
  <div class="app-shell">
    <Sidebar />
    <main class="content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Painel</span><b>/</b><strong>Visão geral</strong>
        </div>
        <div class="top-actions">
          <div class="live-status">
            <span :class="['status-dot', { offline: !isOnline }]"></span
            >{{ isOnline ? "Sistema online" : "Sistema offline" }}
          </div>
          <button
            class="icon-button"
            aria-label="Notificações"
            @click="showNotifications = !showNotifications"
          >
            <Bell
              class="icon-bell"
              :size="16"
              :stroke-width="1.8"
              aria-hidden="true"
            /><span class="notification-dot"></span></button
          ><button class="mini-avatar">{{ userInitials }}</button>
        </div>
        <Transition name="notification-pop">
          <div v-if="showNotifications" class="notification-popover">
            Nenhuma notificação nova
          </div>
        </Transition>
      </header>
      <section class="page-heading">
        <div>
          <p class="eyebrow">{{ getDateNow.toUpperCase() }}</p>
          <h1>{{ getActiveHours() }}, {{ firstName }}</h1>
          <p class="heading-copy">
            Aqui está o resumo das suas entregas de hoje.
          </p>
        </div>
        <NuxtLink class="primary-button" to="/sync"
          ><span>↗</span> Sincronizar apps</NuxtLink
        >
      </section>
      <section class="metric-grid" aria-label="Resumo do dia">
        <article class="metric-card highlight">
          <div class="metric-top">
            <span>GANHOS HOJE</span><span class="metric-icon">R$</span>
          </div>
          <strong>{{ formatCurrency(today.earnings) }}</strong>
          <div class="metric-bottom">
            <span :class="deltaClass(earningsDelta)">{{
              deltaLabel(earningsDelta)
            }}</span
            ><span>vs. ontem</span>
          </div>
          <div class="sparkline">
            <span></span><span></span><span></span><span></span><span></span
            ><span></span><span></span><span></span>
          </div>
        </article>
        <article class="metric-card">
          <div class="metric-top">
            <span>CORRIDAS CONCLUÍDAS</span
            ><span class="metric-icon orange">⌁</span>
          </div>
          <strong>{{ today.rides }}</strong>
          <div class="metric-bottom">
            <span :class="deltaClass(ridesDelta)"
              >{{ ridesDelta > 0 ? "↗" : ridesDelta < 0 ? "↘" : "•" }}
              {{ Math.abs(ridesDelta) }} corridas</span
            ><span>vs. ontem</span>
          </div>
          <div class="mini-bars">
            <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i
            ><i></i>
          </div>
        </article>
        <article class="metric-card">
          <div class="metric-top">
            <span>DISTÂNCIA PERCORRIDA</span
            ><span class="metric-icon blue">⌖</span>
          </div>
          <strong>{{ formatDistance(today.distanceKm) }}</strong>
          <div class="metric-bottom">
            <span class="muted-strong">{{
              formatDistance(today.rides ? today.distanceKm / today.rides : 0)
            }}</span
            ><span>por corrida</span>
          </div>
          <div class="distance-line"><span></span></div>
        </article>
        <article class="metric-card">
          <div class="metric-top">
            <span>GANHO POR DISTÂNCIA</span
            ><span class="metric-icon purple">◷</span>
          </div>
          <strong>{{
            formatValuePerDistance(
              today.distanceKm ? today.earnings / today.distanceKm : 0,
            )
          }}</strong>
          <div class="metric-bottom">
            <span class="muted-strong">{{
              formatCurrency(today.rides ? today.earnings / today.rides : 0)
            }}</span
            ><span>ticket médio</span>
          </div>
          <div class="average-line"><span></span></div>
        </article>
      </section>
      <section class="dashboard-grid">
        <article class="panel earnings-panel">
          <div class="panel-heading">
            <div>
              <h2>Ganhos x Despesas</h2>
              <p>Comparativo dos últimos 7 dias</p>
            </div>
          </div>
          <div class="chart-legend">
            <span
              ><i class="legend-dot green"></i> Ganhos
              <b>{{ formatCurrency(weekTotals.earnings) }}</b></span
            ><span
              ><i class="legend-dot red"></i> Despesas
              <b>{{ formatCurrency(weekTotals.expenses) }}</b></span
            >
          </div>
          <div class="chart-wrap">
            <div class="y-labels">
              <span v-for="(label, i) in yLabels" :key="i">{{ label }}</span>
            </div>
            <div class="chart">
              <div class="grid-line top"></div>
              <div class="grid-line mid"></div>
              <div class="grid-line low"></div>
              <div class="bars">
                <div
                  v-for="(day, index) in weekDays"
                  :key="day.key"
                  :class="{ today: index === weekDays.length - 1 }"
                  :title="`Ganhos ${formatCurrency(day.earnings)} · Despesas ${formatCurrency(day.expenses)}`"
                >
                  <i
                    class="bar green-bar"
                    :style="{ height: `${(day.earnings / chartMax) * 79}%` }"
                  ></i
                  ><i
                    class="bar red-bar"
                    :style="{ height: `${(day.expenses / chartMax) * 79}%` }"
                  ></i
                  ><small>{{ day.label }}</small>
                </div>
              </div>
            </div>
          </div>
        </article>
        <article class="panel sync-panel">
          <div class="panel-heading">
            <div>
              <h2>Turno e dispositivos</h2>
              <p>Situação do seu turno e containers</p>
            </div>
            <button
              class="refresh-button"
              aria-label="Atualizar status"
              @click="loadDashboard"
            >
              ↻
            </button>
          </div>
          <div class="sync-list">
            <div class="sync-row">
              <span class="platform-logo logo-99">⏱</span>
              <div>
                <strong>{{
                  openSession ? "Turno em andamento" : "Nenhum turno aberto"
                }}</strong
                ><span>{{
                  openSession
                    ? `${openSession.containerName} · desde ${formatDateTime(openSession.startTime)}`
                    : `${sessions.length} turno(s) hoje`
                }}</span>
              </div>
              <span :class="openSession ? 'connected' : 'idle'"
                ><i></i> {{ openSession ? "Ativo" : "Parado" }}</span
              >
            </div>
            <div class="sync-row">
              <span class="platform-logo logo-ifood">▣</span>
              <div>
                <strong>Containers ativos</strong
                ><span>{{ activeContainers }} de {{ containers.length }}</span>
              </div>
              <span :class="activeContainers ? 'connected' : 'idle'"
                ><i></i> {{ activeContainers ? "Ativo" : "Inativo" }}</span
              >
            </div>
            <div class="sync-row">
              <span class="platform-logo logo-99">▤</span>
              <div>
                <strong>Dispositivos conectados</strong
                ><span>{{ connectedDevices }} de {{ totalDevices }}</span>
              </div>
              <span :class="connectedDevices ? 'connected' : 'idle'"
                ><i></i> {{ connectedDevices ? "Conectado" : "Offline" }}</span
              >
            </div>
          </div>
          <div class="sync-callout">
            <span>✦</span>
            <div>
              <strong
                >Saldo do mês: {{ formatCurrency(monthBalance) }}</strong
              >
              <p>{{ monthRidesCount }} corridas concluídas neste mês.</p>
            </div>
          </div>
          <NuxtLink class="outline-button" to="/sync"
            >Ver sincronização <span>→</span></NuxtLink
          >
        </article>
      </section>
      <section class="panel activity-panel">
        <div class="panel-heading">
          <div>
            <h2>Atividade recente</h2>
            <p>Suas últimas corridas registradas</p>
          </div>
          <NuxtLink class="text-button" to="/rides"
            >Ver todas <span>→</span></NuxtLink
          >
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TIPO</th>
                <th>ROTA</th>
                <th>DISTÂNCIA</th>
                <th>DURAÇÃO</th>
                <th>HORÁRIO</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!recentRoutes.length">
                <td colspan="6">Nenhuma corrida registrada nos últimos 7 dias.</td>
              </tr>
              <tr v-for="route in recentRoutes" :key="route.id">
                <td>
                  <span
                    :class="[
                      'table-app',
                      route.type === 'Delivery' ? 'app-99' : 'app-ifood',
                    ]"
                    >{{ route.type === "Delivery" ? "DL" : "MP" }}</span
                  >
                </td>
                <td class="route-cell">
                  {{ route.originAddress ?? "—" }} →
                  {{ route.destinationAddress ?? "—" }}
                </td>
                <td>{{ formatDistance(route.totalDistanceKm) }}</td>
                <td>{{ Math.round(route.totalMinutes) }} min</td>
                <td>{{ formatDateTime(route.startTime) }}</td>
                <td>
                  <span
                    :class="[
                      'status-pill',
                      route.status === 'Finished' ? 'done' : 'in-progress',
                    ]"
                    ><i></i
                    >{{
                      route.status === "Finished" ? "Concluída" : "Em andamento"
                    }}</span
                  >
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
import { Bell } from "@lucide/vue";
import { useNuxtApp } from "#app";
import useLoading from "~/composable/useLoading";
import { useToastService } from "~/composable/useToast";
import { getLoggedUser } from "~/composable/useAuth";
import type { IFinanceEntry } from "~/infra/interfaces/services/finance";
import type { IRouteSummary } from "~/infra/interfaces/services/route";
import type { IContainer } from "~/infra/interfaces/services/container";
import type { IWorkSession } from "~/infra/interfaces/services/workSession";

const toast = useToastService();
const { loadingPush, loadingPop } = useLoading();

const user = getLoggedUser();
const firstName = computed(() => user?.name?.split(" ")[0] || "Willian");
const userInitials = computed(() => {
  const initials = (user?.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "WSC";
});

const isOnline = ref(true);
const showNotifications = ref(false);

const entries = ref<IFinanceEntry[]>([]);
const routes = ref<IRouteSummary[]>([]);
const monthRoutes = ref<IRouteSummary[]>([]);
const monthBalance = ref(0);
const containers = ref<IContainer[]>([]);
const sessions = ref<IWorkSession[]>([]);

const pad = (n: number) => String(n).padStart(2, "0");
const localKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
// Lançamentos financeiros são datas fixas em UTC; rotas usam o dia local.
const entryKey = (value: string) => value.slice(0, 10);
const routeKey = (value: string) => localKey(new Date(value));

function startOfDay(offset = 0) {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset);
}

const weekdayLabels = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(i - 6);
    const key = localKey(date);
    const dayEntries = entries.value.filter((e) => entryKey(e.date) === key);
    const sum = (type: string) =>
      dayEntries
        .filter((e) => e.type === type)
        .reduce((total, e) => total + e.amount, 0);
    return {
      key,
      label: i === 6 ? "hoje" : weekdayLabels[date.getDay()],
      earnings: sum("earning"),
      expenses: sum("expense"),
    };
  }),
);

const weekTotals = computed(() => ({
  earnings: weekDays.value.reduce((t, d) => t + d.earnings, 0),
  expenses: weekDays.value.reduce((t, d) => t + d.expenses, 0),
}));

const chartMax = computed(() => {
  const max = Math.max(
    ...weekDays.value.flatMap((d) => [d.earnings, d.expenses]),
    0,
  );
  return max > 0 ? max : 1;
});

const yLabels = computed(() =>
  [1, 2 / 3, 1 / 3, 0].map((f) =>
    formatCurrency(Math.round(chartMax.value * f)),
  ),
);

function dayStats(offset: number) {
  const key = localKey(startOfDay(offset));
  const finished = routes.value.filter(
    (r) => r.status === "Finished" && routeKey(r.startTime) === key,
  );
  return {
    earnings: entries.value
      .filter((e) => e.type === "earning" && entryKey(e.date) === key)
      .reduce((total, e) => total + e.amount, 0),
    rides: finished.length,
    distanceKm: finished.reduce((total, r) => total + r.totalDistanceKm, 0),
  };
}

const today = computed(() => dayStats(0));
const yesterday = computed(() => dayStats(-1));

const earningsDelta = computed(() => {
  if (yesterday.value.earnings > 0) {
    return (
      ((today.value.earnings - yesterday.value.earnings) /
        yesterday.value.earnings) *
      100
    );
  }
  return today.value.earnings > 0 ? 100 : 0;
});
const ridesDelta = computed(() => today.value.rides - yesterday.value.rides);

const deltaClass = (value: number) =>
  value < 0 ? "trend down" : value > 0 ? "trend" : "muted-strong";
const deltaLabel = (value: number) =>
  `${value > 0 ? "↗" : value < 0 ? "↘" : "•"} ${Math.abs(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

const recentRoutes = computed(() =>
  [...routes.value]
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )
    .slice(0, 5),
);

const openSession = computed(
  () => sessions.value.find((s) => !s.endTime) ?? null,
);
const activeContainers = computed(
  () => containers.value.filter((c) => c.isActive).length,
);
const allDevices = computed(() => containers.value.flatMap((c) => c.devices));
const totalDevices = computed(() => allDevices.value.length);
const connectedDevices = computed(
  () => allDevices.value.filter((d) => d.connected).length,
);
const monthRidesCount = computed(
  () => monthRoutes.value.filter((r) => r.status === "Finished").length,
);

async function loadDashboard() {
  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const now = new Date();
    const weekStart = startOfDay(-6).toISOString();
    const todayIso = startOfDay(0).toISOString();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();

    const responses = await Promise.all([
      $httpClient.finance.FinanceList({
        startDate: weekStart,
        endDate: todayIso,
      }),
      $httpClient.route.RouteList({ startDate: weekStart, endDate: todayIso }),
      $httpClient.route.RouteList({
        startDate: monthStart,
        endDate: todayIso,
      }),
      $httpClient.finance.FinanceSummary({
        startDate: monthStart,
        endDate: todayIso,
      }),
      $httpClient.container.ContainerList(),
      $httpClient.workSession.WorkSessionList({
        startDate: todayIso,
        endDate: todayIso,
      }),
    ]);
    const [entriesRes, routesRes, monthRoutesRes, summaryRes, containersRes, sessionsRes] =
      responses;

    const failed = responses.find((r) => !r.success);
    if (failed) {
      isOnline.value = false;
      toast.error(
        failed.errors[0] ?? "Não foi possível carregar a visão geral.",
      );
      return;
    }

    entries.value = entriesRes.result as IFinanceEntry[];
    routes.value = routesRes.result as IRouteSummary[];
    monthRoutes.value = monthRoutesRes.result as IRouteSummary[];
    monthBalance.value = (summaryRes.result as { balance: number }).balance;
    containers.value = containersRes.result as IContainer[];
    sessions.value = sessionsRes.result as IWorkSession[];
    isOnline.value = true;
  } catch (cause: any) {
    isOnline.value = false;
    toast.error(
      cause?.errors?.[0] ?? "Não foi possível carregar a visão geral.",
    );
  } finally {
    loadingPop();
  }
}

onMounted(loadDashboard);
</script>

<style lang="scss" scoped>
.icon-button {
  color: var(--fg-829089);
  position: relative;
  background: transparent;
  border: 0;
  font-size: 23px;
}

.icon-bell {
  display: block;
  stroke: currentColor;
}

.notification-dot {
  position: absolute;
  width: 5px;
  height: 5px;
  background: var(--bg-e87c64);
  border-radius: 50%;
  right: 1px;
  top: 3px;
}

.heading-copy {
  color: var(--muted);
  margin: 8px 0 0;
  font-size: 13px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.metric-card {
  position: relative;
  min-height: 151px;
  background: var(--bg-ffffff);
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 19px;
  overflow: hidden;

  .highlight {
    background: var(--bg-eaf7ef);
    border-color: var(--bd-d9eee0);
  }

  strong small {
    color: var(--fg-859088);
    font: 500 13px "DM Sans";
  }
}

.metric-top,
.metric-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-top {
  color: var(--fg-89948d);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.9px;
}

.metric-icon {
  color: var(--green);
  background: var(--bg-d8f0e1);
  border-radius: 5px;
  padding: 5px 6px;
  font-size: 10px;
  font-weight: 700;

  .orange {
    color: var(--fg-cf8334);
    background: var(--bg-fff0da);
    font-size: 18px;
    padding: 1px 6px;
  }

  .blue {
    color: var(--fg-5892ac);
    background: var(--bg-e4f3f8);
    font-size: 18px;
    padding: 1px 6px;
  }

  .purple {
    color: var(--fg-8e84ac);
    background: var(--bg-eeebf6);
    font-size: 15px;
    padding: 2px 6px;
  }
}

.metric-card > strong {
  display: block;
  font: 700 26px "Space Grotesk";
  margin: 14px 0 7px;
}

.metric-bottom {
  position: relative;
  z-index: 1;
  justify-content: flex-start;
  gap: 7px;
  color: var(--fg-99a39d);
  font-size: 10px;
}

.trend {
  color: var(--fg-37a36e);
  font-weight: 700;
}

.trend.down {
  color: var(--bg-e87c64);
}

.idle {
  margin-left: auto;
  color: var(--fg-99a39d);
  font-size: 10px;

  i {
    width: 5px;
    height: 5px;
    display: inline-block;
    background: var(--fg-99a39d);
    border-radius: 50%;
    margin-right: 3px;
  }
}

.muted-strong {
  color: var(--fg-5e6c64);
  font-weight: 600;
}

.sparkline,
.mini-bars {
  position: absolute;
  bottom: 0;
  right: 15px;
  display: flex;
  align-items: end;
  gap: 4px;
  opacity: 0.45;
}

.sparkline {
  height: 49px;
  transform: skew(-25deg);

  span {
    width: 9px;
    border-radius: 2px;
    background: var(--bg-8bd0a9);
  }

  span:nth-child(1) {
    height: 15px;
  }
  span:nth-child(2) {
    height: 25px;
  }
  span:nth-child(3) {
    height: 19px;
  }
  span:nth-child(4) {
    height: 32px;
  }
  span:nth-child(5) {
    height: 27px;
  }
  span:nth-child(6) {
    height: 39px;
  }
  span:nth-child(7) {
    height: 34px;
  }
  span:nth-child(8) {
    height: 47px;
  }
}

.mini-bars {
  height: 44px;

  i {
    width: 6px;
    background: var(--bg-f2c383);
    border-radius: 2px 2px 0 0;
  }

  i:nth-child(odd) {
    height: 19px;
  }
  i:nth-child(even) {
    height: 30px;
  }
  i:last-child {
    height: 43px;
  }
}

.distance-line,
.average-line {
  height: 2px;
  background: var(--bg-e4f1f3);
  position: absolute;
  bottom: 25px;
  left: 19px;
  right: 19px;
  transform: skew(-35deg);
}

.distance-line span,
.average-line span {
  display: block;
  width: 62%;
  height: 2px;
  background: var(--bg-9bc4cf);
}

.average-line {
  background: var(--bg-eeeaf6);

  span {
    width: 74%;
    background: var(--bg-b2a7d4);
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.38fr 1fr;
  gap: 14px;
  margin-top: 14px;
}

.earnings-panel,
.sync-panel {
  min-height: 337px;
  padding: 23px;
}

.panel-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;

  h2 {
    font: 600 16px "Space Grotesk";
    margin: 0 0 5px;
  }
  p {
    margin: 0;
    color: var(--muted);
    font-size: 11px;
  }
}

.select-button,
.refresh-button {
  color: var(--fg-6d7972);
  background: var(--bg-f6f8f6);
  border: 1px solid var(--bd-e5ebe6);
  border-radius: 4px;
}

.select-button {
  padding: 8px 10px;
  font-size: 10px;

  span {
    padding-left: 12px;
  }
}

.chart-legend {
  display: flex;
  gap: 23px;
  margin: 29px 0 13px 34px;
  color: var(--fg-758079);
  font-size: 10px;

  b {
    margin-left: 5px;
    color: var(--fg-34433a);
  }
}

.legend-dot {
  width: 7px;
  height: 7px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 4px;

  .green {
    background: var(--bg-62bb84);
  }
  .red {
    background: var(--bg-e58579);
  }
}

.chart-wrap {
  display: flex;
  height: 181px;
}

.y-labels {
  width: 34px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--fg-a1aaa4);
  font-size: 9px;
  padding-bottom: 22px;
}

.chart {
  position: relative;
  flex: 1;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px dashed var(--bd-e8ede9);

  .top {
    top: 0;
  }
  .mid {
    top: 33%;
  }
  .low {
    top: 66%;
  }
}

.bars {
  position: absolute;
  inset: 0 8px;
  display: flex;
  justify-content: space-between;
  align-items: end;

  small {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    color: var(--fg-9ca6a0);
    font-size: 9px;
  }
}

.bars > div {
  height: 100%;
  width: 8%;
  display: flex;
  gap: 3px;
  align-items: end;
  position: relative;
  padding-bottom: 21px;
}

.bar {
  width: 48%;
  border-radius: 3px 3px 0 0;
  display: block;
  min-height: 5px;
}

.green-bar {
  background: var(--bg-8bd0a5);
}

.red-bar {
  background: var(--bg-ecaaa0);
}

.bars .today .green-bar {
  background: var(--green);
}

.bars .today .red-bar {
  background: var(--bg-e87568);
}

.refresh-button {
  font-size: 20px;
  width: 29px;
  height: 29px;
}

.sync-list {
  margin: 22px 0 17px;
}

.sync-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--bd-f0f3f0);

  strong,
  div span {
    display: block;
  }

  strong {
    font-size: 12px;
  }

  div span {
    color: var(--muted);
    font-size: 10px;
    margin-top: 3px;
  }
}

.platform-logo {
  width: 29px;
  height: 29px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 11px;
}

.logo-99 {
  background: var(--bg-eef0ff);
  color: var(--fg-5266bf);
}

.logo-ifood {
  background: var(--bg-fff0ed);
  color: var(--fg-e66c56);
  font-style: italic;
}

.connected {
  margin-left: auto;
  color: var(--fg-43a975);
  font-size: 10px;

  i {
    width: 5px;
    height: 5px;
    display: inline-block;
    background: var(--bg-47b87a);
    border-radius: 50%;
    margin-right: 3px;
  }
}

.sync-callout {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-f0f9f3);
  padding: 10px;
  border-radius: 4px;

  strong {
    font-size: 11px;
  }

  p {
    color: var(--fg-76927f);
    margin: 3px 0 0;
    font-size: 10px;
  }
}

.sync-callout > span {
  color: var(--green);
  font-size: 18px;
}

.outline-button {
  display: block;
  width: 100%;
  margin-top: 13px;
  background: var(--bg-ffffff);
  border: 1px solid var(--bd-dce6df);
  color: var(--fg-4e695a);
  border-radius: 4px;
  padding: 9px;
  text-align: left;
  font-size: 11px;
}

.outline-button span,
.text-button span {
  float: right;
  font-size: 15px;
}

.activity-panel {
  margin-top: 14px;
  padding: 22px 23px 8px;
}

.text-button {
  background: transparent;
  color: var(--green);
  font-size: 11px;
}

.table-wrap {
  overflow-x: auto;
  margin-top: 20px;
}

table {
  border-collapse: collapse;
  width: 100%;
  min-width: 700px;
}

th {
  text-align: left;
  color: var(--fg-a0aaa4);
  font-size: 9px;
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

.table-app {
  display: grid;
  place-items: center;
  width: 28px;
  height: 23px;
  border-radius: 5px;
  font-weight: 700;
}

.app-99 {
  background: var(--bg-eef0ff);
  color: var(--fg-5667b9);
}

.app-ifood {
  background: var(--bg-fff0ed);
  color: var(--fg-e06b57);
  font-style: italic;
}

.route-cell {
  color: var(--fg-48564e);
  font-weight: 600;
}

.value-cell {
  color: var(--fg-394a40);
  font-weight: 700;
}

.status-pill {
  border-radius: 20px;
  padding: 5px 8px;
  font-size: 10px;

  i {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    margin-right: 5px;
  }
  .in-progress {
    color: var(--fg-c77b2d);
    background: var(--bg-fff4e4);
  }
  .in-progress i {
    background: var(--bg-efa04e);
  }
  .done {
    color: var(--fg-44956c);
    background: var(--bg-edf8f0);
  }
  .done i {
    background: var(--bg-55b47a);
  }
}

footer {
  text-align: right;
  color: var(--fg-adb6b0);
  font-size: 10px;
  padding: 19px 0 0;
}

footer span {
  margin: 0 5px;
  color: var(--fg-d0d6d1);
}

@media (max-width: 1050px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 680px) {
  .primary-button {
    align-self: stretch;
    text-align: center;
  }

  .metric-grid {
    gap: 10px;
  }

  .metric-card {
    padding: 14px 12px;
    min-height: 140px;
  }

  .metric-top {
    font-size: 8px;
  }

  .metric-card > strong {
    font-size: 21px;
    margin-top: 15px;
  }

  .metric-bottom {
    font-size: 9px;
    flex-direction: column;
    align-items: start;
    gap: 2px;
  }

  .earnings-panel,
  .sync-panel {
    padding: 18px 14px;
  }

  .chart-legend {
    margin-left: 0;
    gap: 10px;
  }
  
  .activity-panel {
    padding: 18px 14px 8px;
  }
}
</style>
