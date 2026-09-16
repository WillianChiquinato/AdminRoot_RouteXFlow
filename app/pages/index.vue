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
          ><button class="mini-avatar">WSC</button>
        </div>
        <div v-if="showNotifications" class="notification-popover">
          Nenhuma notificação nova
        </div>
      </header>
      <section class="page-heading">
        <div>
          <p class="eyebrow">{{ getDateNow.toUpperCase() }}</p>
          <h1>{{ getActiveHours() }}, Willian</h1>
          <p class="heading-copy">
            Aqui está o resumo das suas entregas de hoje.
          </p>
        </div>
        <NuxtLink class="primary-button" to="/sync"
          ><span>↗</span> Sincronizar apps</NuxtLink
        >
      </section>
      <section class="metric-grid" aria-label="Resumo financeiro">
        <article class="metric-card highlight">
          <div class="metric-top">
            <span>GANHOS HOJE</span><span class="metric-icon">R$</span>
          </div>
          <strong>R$ 86,40</strong>
          <div class="metric-bottom">
            <span class="trend">↗ 12,5%</span><span>vs. ontem</span>
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
          <strong>8</strong>
          <div class="metric-bottom">
            <span class="trend">↗ 2 corridas</span><span>vs. ontem</span>
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
          <strong>42,8 <small>km</small></strong>
          <div class="metric-bottom">
            <span class="muted-strong">5,3 km</span><span>por corrida</span>
          </div>
          <div class="distance-line"><span></span></div>
        </article>
        <article class="metric-card">
          <div class="metric-top">
            <span>TICKET MÉDIO</span><span class="metric-icon purple">◷</span>
          </div>
          <strong>R$ 10,80</strong>
          <div class="metric-bottom">
            <span class="trend">↗ R$ 1,20</span><span>vs. ontem</span>
          </div>
          <div class="average-line"><span></span></div>
        </article>
      </section>
      <section class="dashboard-grid">
        <article class="panel earnings-panel">
          <div class="panel-heading">
            <div>
              <h2>Ganhos por aplicativo</h2>
              <p>Comparativo dos últimos 7 dias</p>
            </div>
            <button class="select-button">Esta semana <span>⌄</span></button>
          </div>
          <div class="chart-legend">
            <span><i class="legend-dot green"></i> 99Food <b>R$ 48,20</b></span
            ><span><i class="legend-dot red"></i> iFood <b>R$ 38,20</b></span>
          </div>
          <div class="chart-wrap">
            <div class="y-labels">
              <span>R$ 60</span><span>R$ 40</span><span>R$ 20</span
              ><span>R$ 0</span>
            </div>
            <div class="chart">
              <div class="grid-line top"></div>
              <div class="grid-line mid"></div>
              <div class="grid-line low"></div>
              <div class="bars">
                <div
                  v-for="(bar, index) in [42, 57, 35, 72, 60, 78, 82]"
                  :key="index"
                  :class="{ today: index === 6 }"
                >
                  <i class="bar green-bar" :style="{ height: `${bar}%` }"></i
                  ><i
                    class="bar red-bar"
                    :style="{ height: `${bar * 0.68}%` }"
                  ></i
                  ><small>{{
                    ["qui", "sex", "sáb", "dom", "seg", "ter", "hoje"][index]
                  }}</small>
                </div>
              </div>
            </div>
          </div>
        </article>
        <article class="panel sync-panel">
          <div class="panel-heading">
            <div>
              <h2>Sincronização</h2>
              <p>Status dos seus aplicativos</p>
            </div>
            <button
              class="refresh-button"
              aria-label="Atualizar status"
              @click="isOnline = !isOnline"
            >
              ↻
            </button>
          </div>
          <div class="sync-list">
            <div class="sync-row">
              <span class="platform-logo logo-99">99</span>
              <div>
                <strong>99Food</strong><span>Última atualização há 2 min</span>
              </div>
              <span class="connected"><i></i> Conectado</span>
            </div>
            <div class="sync-row">
              <span class="platform-logo logo-ifood">iF</span>
              <div>
                <strong>iFood</strong><span>Última atualização há 4 min</span>
              </div>
              <span class="connected"><i></i> Conectado</span>
            </div>
          </div>
          <div class="sync-callout">
            <span>✦</span>
            <div>
              <strong>Pronto para combinar</strong>
              <p>Seus apps estão ativos e buscando novas corridas.</p>
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
                <th>APLICATIVO</th>
                <th>ROTA</th>
                <th>VALOR</th>
                <th>DISTÂNCIA</th>
                <th>HORÁRIO</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="delivery in deliveries" :key="delivery.route">
                <td>
                  <span :class="['table-app', delivery.appClass]">{{
                    delivery.app
                  }}</span>
                </td>
                <td class="route-cell">{{ delivery.route }}</td>
                <td class="value-cell">{{ delivery.value }}</td>
                <td>{{ delivery.distance }}</td>
                <td>{{ delivery.time }}</td>
                <td>
                  <span :class="['status-pill', delivery.statusClass]"
                    ><i></i>{{ delivery.status }}</span
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

const getDateNow = ref(
  new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }),
);

const getActiveHours = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) {
    return "Bom dia";
  } else if (currentHour >= 12 && currentHour < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
};

const isOnline = ref(true);
const showNotifications = ref(false);
const deliveries = [
  {
    app: "99",
    appClass: "app-99",
    route: "Vila Bocaina → Jardim Zaíra",
    value: "R$ 18,90",
    distance: "6,4 km",
    time: "há 8 min",
    status: "Em andamento",
    statusClass: "in-progress",
  },
  {
    app: "ifood",
    appClass: "app-ifood",
    route: "Parque São Vicente → Itapark",
    value: "R$ 12,50",
    distance: "4,1 km",
    time: "há 22 min",
    status: "Concluída",
    statusClass: "done",
  },
  {
    app: "99",
    appClass: "app-99",
    route: "Centro → Jardim Miranda",
    value: "R$ 9,80",
    distance: "3,8 km",
    time: "há 41 min",
    status: "Concluída",
    statusClass: "done",
  },
];

</script>

<style lang="scss" scoped>
.icon-button {
  color: #829089;
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
  background: #e87c64;
  border-radius: 50%;
  right: 1px;
  top: 3px;
}

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

  h1 span {
    font-size: 23px;
    margin-left: 5px;
  }
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
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 19px;
  overflow: hidden;

  .highlight {
    background: #eaf7ef;
    border-color: #d9eee0;
  }

  strong small {
    color: #859088;
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
  color: #89948d;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.9px;
}

.metric-icon {
  color: var(--green);
  background: #d8f0e1;
  border-radius: 5px;
  padding: 5px 6px;
  font-size: 10px;
  font-weight: 700;

  .orange {
    color: #cf8334;
    background: #fff0da;
    font-size: 18px;
    padding: 1px 6px;
  }

  .blue {
    color: #5892ac;
    background: #e4f3f8;
    font-size: 18px;
    padding: 1px 6px;
  }

  .purple {
    color: #8e84ac;
    background: #eeebf6;
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
  color: #99a39d;
  font-size: 10px;
}

.trend {
  color: #37a36e;
  font-weight: 700;
}

.muted-strong {
  color: #5e6c64;
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
    background: #8bd0a9;
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
    background: #f2c383;
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
  background: #e4f1f3;
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
  background: #9bc4cf;
}

.average-line {
  background: #eeeaf6;

  span {
    width: 74%;
    background: #b2a7d4;
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
  color: #6d7972;
  background: #f6f8f6;
  border: 1px solid #e5ebe6;
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
  color: #758079;
  font-size: 10px;

  b {
    margin-left: 5px;
    color: #34433a;
  }
}

.legend-dot {
  width: 7px;
  height: 7px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 4px;

  .green {
    background: #62bb84;
  }
  .red {
    background: #e58579;
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
  color: #a1aaa4;
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
  border-top: 1px dashed #e8ede9;

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
    color: #9ca6a0;
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
  background: #8bd0a5;
}

.red-bar {
  background: #ecaaa0;
}

.bars .today .green-bar {
  background: var(--green);
}

.bars .today .red-bar {
  background: #e87568;
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
  border-bottom: 1px solid #f0f3f0;

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
  background: #eef0ff;
  color: #5266bf;
}

.logo-ifood {
  background: #fff0ed;
  color: #e66c56;
  font-style: italic;
}

.connected {
  margin-left: auto;
  color: #43a975;
  font-size: 10px;

  i {
    width: 5px;
    height: 5px;
    display: inline-block;
    background: #47b87a;
    border-radius: 50%;
    margin-right: 3px;
  }
}

.sync-callout {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f0f9f3;
  padding: 10px;
  border-radius: 4px;

  strong {
    font-size: 11px;
  }

  p {
    color: #76927f;
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
  background: #fff;
  border: 1px solid #dce6df;
  color: #4e695a;
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
  color: #a0aaa4;
  font-size: 9px;
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

.table-app {
  display: grid;
  place-items: center;
  width: 28px;
  height: 23px;
  border-radius: 5px;
  font-weight: 700;
}

.app-99 {
  background: #eef0ff;
  color: #5667b9;
}

.app-ifood {
  background: #fff0ed;
  color: #e06b57;
  font-style: italic;
}

.route-cell {
  color: #48564e;
  font-weight: 600;
}

.value-cell {
  color: #394a40;
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
    color: #c77b2d;
    background: #fff4e4;
  }
  .in-progress i {
    background: #efa04e;
  }
  .done {
    color: #44956c;
    background: #edf8f0;
  }
  .done i {
    background: #55b47a;
  }
}

footer {
  text-align: right;
  color: #adb6b0;
  font-size: 10px;
  padding: 19px 0 0;
}

footer span {
  margin: 0 5px;
  color: #d0d6d1;
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
  .page-heading {
    align-items: start;
    flex-direction: column;
    gap: 19px;
    padding: 27px 0 23px;
    
    h1 {
      font-size: 25px;
    }
  }

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
