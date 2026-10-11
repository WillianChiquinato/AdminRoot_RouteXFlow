<template>
  <div class="app-shell">
    <Sidebar />
    <main class="content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Painel</span><b>/</b><strong>Auditoria</strong>
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
          <h1>Auditoria</h1>
          <p class="heading-copy">
            Registro de todas as requisições da API e das alterações feitas no
            banco de dados. Visível apenas para o perfil de Desenvolvedor.
          </p>
        </div>
        <button class="outline-button" @click="loadLogs">
          <RefreshCw :size="13" /> Atualizar
        </button>
      </section>

      <section class="panel filters">
        <form class="filter-grid" @submit.prevent="applyFilters">
          <label
            >Método
            <select v-model="filters.httpMethod">
              <option value="">Todos</option>
              <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
            </select>
          </label>
          <label
            >Caminho
            <input v-model="filters.path" placeholder="ex: /api/User" />
          </label>
          <label
            >Status
            <input
              v-model="filters.statusCode"
              type="number"
              min="100"
              max="599"
              placeholder="ex: 500"
            />
          </label>
          <label
            >ID do usuário
            <input v-model="filters.userId" type="number" min="1" />
          </label>
          <label
            >Trace ID
            <input v-model="filters.traceId" />
          </label>
          <label
            >De
            <input v-model="filters.from" type="date" />
          </label>
          <label
            >Até
            <input v-model="filters.to" type="date" />
          </label>
          <div class="filter-checks">
            <label class="check"
              ><input v-model="filters.onlyErrors" type="checkbox" /> Só
              erros</label
            >
            <label class="check"
              ><input v-model="filters.onlyWithChanges" type="checkbox" /> Só
              com alterações</label
            >
          </div>
          <div class="filter-actions">
            <button type="button" class="outline-button" @click="clearFilters">
              Limpar
            </button>
            <button type="submit" class="primary-button">Filtrar</button>
          </div>
        </form>
      </section>

      <section v-if="!logs.length && !loading" class="panel empty-state">
        <span class="empty-icon"><ScrollText :size="22" /></span>
        <h2>Nenhum registro encontrado</h2>
        <p>Ajuste os filtros para ver outros registros de auditoria.</p>
      </section>

      <section v-else class="panel table-panel">
        <div class="table-scroll">
          <table class="audit-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Usuário</th>
                <th>Requisição</th>
                <th>Status</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.id" @click="openDetail(log.id)">
                <td class="nowrap">{{ formatDateTime(log.createdAt) }}</td>
                <td>{{ log.userEmail ?? "Anônimo" }}</td>
                <td class="request-cell">
                  <span :class="['method', log.httpMethod.toLowerCase()]">{{
                    log.httpMethod
                  }}</span>
                  <span class="path">{{ log.path }}</span>
                </td>
                <td>
                  <span :class="['status-pill', statusClass(log)]"
                    ><i></i>{{ log.statusCode }}</span
                  >
                </td>
                <td class="nowrap">{{ log.durationMs }} ms</td>
                <td class="tags">
                  <span v-if="log.hasChanges" class="tag">Alterações</span>
                  <span v-if="log.exceptionType" class="tag danger">Exceção</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <span>{{ totalRows }} registro(s)</span>
          <div class="pagination-controls">
            <button
              class="outline-button"
              :disabled="page <= 1 || loading"
              @click="goToPage(page - 1)"
            >
              <ChevronLeft :size="13" />
            </button>
            <span>Página {{ page }} de {{ totalPages }}</span>
            <button
              class="outline-button"
              :disabled="page >= totalPages || loading"
              @click="goToPage(page + 1)"
            >
              <ChevronRight :size="13" />
            </button>
          </div>
        </div>
      </section>

      <footer>RouteXFlow <span>·</span> Painel administrativo</footer>
    </main>

    <Dialog
      v-model:visible="showDetail"
      modal
      header="Detalhes do registro"
      :style="{ width: '760px', maxWidth: '95vw' }"
    >
      <div v-if="detail" class="detail">
        <div class="detail-grid">
          <div>
            <span class="detail-label">Data</span>
            <span>{{ formatDateTime(detail.createdAt) }}</span>
          </div>
          <div>
            <span class="detail-label">Usuário</span>
            <span>{{ detail.userEmail ?? "Anônimo" }}</span>
          </div>
          <div>
            <span class="detail-label">Requisição</span>
            <span>{{ detail.httpMethod }} {{ detail.path }}</span>
          </div>
          <div>
            <span class="detail-label">Status / Duração</span>
            <span>{{ detail.statusCode }} · {{ detail.durationMs }} ms</span>
          </div>
          <div>
            <span class="detail-label">IP</span>
            <span>{{ detail.ipAddress ?? "—" }}</span>
          </div>
          <div>
            <span class="detail-label">Trace ID</span>
            <span class="mono">{{ detail.traceId }}</span>
          </div>
          <div v-if="detail.endpoint" class="full">
            <span class="detail-label">Endpoint</span>
            <span>{{ detail.endpoint }}</span>
          </div>
          <div v-if="detail.queryString" class="full">
            <span class="detail-label">Query string</span>
            <span class="mono">{{ detail.queryString }}</span>
          </div>
          <div v-if="detail.userAgent" class="full">
            <span class="detail-label">User agent</span>
            <span>{{ detail.userAgent }}</span>
          </div>
        </div>

        <template v-if="detail.exceptionType">
          <h3>Exceção</h3>
          <p class="exception-title">
            {{ detail.exceptionType }}: {{ detail.exceptionMessage }}
          </p>
          <pre v-if="detail.exceptionStackTrace">{{
            detail.exceptionStackTrace
          }}</pre>
        </template>

        <template v-if="detail.changes?.length">
          <h3>Alterações no banco</h3>
          <div
            v-for="(change, index) in detail.changes"
            :key="index"
            class="change"
          >
            <div class="change-head">
              <strong>{{ change.entity }}</strong>
              <span class="tag">{{ change.action }}</span>
              <span v-if="change.key !== undefined" class="mono"
                >#{{ formatValue(change.key) }}</span
              >
            </div>
            <div class="change-body">
              <div v-if="change.before">
                <span class="detail-label">Antes</span>
                <pre>{{ formatJson(change.before) }}</pre>
              </div>
              <div v-if="change.after">
                <span class="detail-label">Depois</span>
                <pre>{{ formatJson(change.after) }}</pre>
              </div>
            </div>
          </div>
        </template>

        <template v-if="detail.requestBody">
          <h3>Corpo da requisição</h3>
          <pre>{{ prettyBody(detail.requestBody) }}</pre>
        </template>

        <template v-if="detail.responseBody">
          <h3>Corpo da resposta</h3>
          <pre>{{ prettyBody(detail.responseBody) }}</pre>
        </template>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { RefreshCw, ScrollText, ChevronLeft, ChevronRight } from "@lucide/vue";
import { useNuxtApp } from "#app";
import useLoading from "~/composable/useLoading";
import { useToastService } from "~/composable/useToast";
import { getLoggedUser } from "~/composable/useAuth";
import type {
  IAuditLogDetail,
  IAuditLogFilter,
  IAuditLogListItem,
} from "~/infra/interfaces/services/audit";

const SUPER_ADMIN_ROLE_ID = 999;

// O middleware global já carregou o usuário; só o Admin-Dev entra aqui.
definePageMeta({
  middleware: () => {
    if (getLoggedUser()?.roleId !== SUPER_ADMIN_ROLE_ID) return navigateTo("/");
  },
});

const toast = useToastService();
const { loadingPush, loadingPop } = useLoading();

const user = getLoggedUser();
const userInitials = computed(() => {
  const initials = (user?.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "RX";
});

const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const PAGE_SIZE = 25;

const emptyFilters = () => ({
  httpMethod: "",
  path: "",
  statusCode: "" as number | "",
  userId: "" as number | "",
  traceId: "",
  from: "",
  to: "",
  onlyErrors: false,
  onlyWithChanges: false,
});

const filters = reactive(emptyFilters());
const logs = ref<IAuditLogListItem[]>([]);
const totalRows = ref(0);
const page = ref(1);
const loading = ref(false);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalRows.value / PAGE_SIZE)),
);

function buildQuery(): IAuditLogFilter {
  const query: IAuditLogFilter = { page: page.value, pageSize: PAGE_SIZE };
  if (filters.httpMethod) query.httpMethod = filters.httpMethod;
  if (filters.path.trim()) query.path = filters.path.trim();
  if (filters.statusCode !== "") query.statusCode = Number(filters.statusCode);
  if (filters.userId !== "") query.userId = Number(filters.userId);
  if (filters.traceId.trim()) query.traceId = filters.traceId.trim();
  if (filters.onlyErrors) query.onlyErrors = true;
  if (filters.onlyWithChanges) query.onlyWithChanges = true;
  // Datas do input são locais; o backend converte para UTC.
  if (filters.from)
    query.from = new Date(`${filters.from}T00:00:00`).toISOString();
  if (filters.to) query.to = new Date(`${filters.to}T23:59:59`).toISOString();
  return query;
}

async function loadLogs() {
  loading.value = true;
  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.audit.GetLogs(buildQuery());
    logs.value = response.result;
    totalRows.value = response.totalRows;
  } catch (cause: any) {
    toast.error(cause?.errors?.[0] ?? "Não foi possível carregar os registros.");
  } finally {
    loading.value = false;
    loadingPop();
  }
}

function applyFilters() {
  page.value = 1;
  loadLogs();
}

function clearFilters() {
  Object.assign(filters, emptyFilters());
  applyFilters();
}

function goToPage(target: number) {
  page.value = target;
  loadLogs();
}

onMounted(loadLogs);

const showDetail = ref(false);
const detail = ref<IAuditLogDetail | null>(null);

async function openDetail(id: number) {
  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.audit.GetLog(id);
    detail.value = response.result;
    showDetail.value = true;
  } catch (cause: any) {
    toast.error(cause?.errors?.[0] ?? "Não foi possível carregar o registro.");
  } finally {
    loadingPop();
  }
}

function formatDateTime(value: string) {
  // O backend serializa sem "Z"; trata como UTC para exibir no fuso local.
  const iso = /(Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`;
  return new Date(iso).toLocaleString("pt-BR");
}

function statusClass(log: IAuditLogListItem) {
  if (log.exceptionType || log.statusCode >= 500) return "error";
  if (log.statusCode >= 400) return "in-progress";
  return "done";
}

function formatValue(value: unknown) {
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function prettyBody(body: string) {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}
</script>

<style lang="scss" scoped>
.page-heading {
  padding: 35px 0 27px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;

  h1 {
    font: 700 30px "Space Grotesk";
    letter-spacing: -1.2px;
    margin: 0;
  }
}

.heading-copy {
  max-width: 520px;
  color: var(--muted);
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.outline-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.filters {
  padding: 18px 20px;
  margin-bottom: 18px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
  align-items: end;

  > label {
    display: block;
    color: var(--fg-506057);
    font-size: 11px;
    font-weight: 600;
  }

  input:not([type="checkbox"]),
  select {
    display: block;
    width: 100%;
    margin-top: 6px;
    padding: 8px 10px;
    font-size: 12px;
    color: var(--ink);
    background: var(--bg-ffffff);
    border: 1px solid var(--bd-dce6df);
    border-radius: 6px;
  }
}

.filter-checks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.check {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--fg-506057);
}

.filter-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  grid-column: 1 / -1;
}

.table-panel {
  padding: 0;
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th {
    text-align: left;
    padding: 12px 16px;
    color: var(--fg-a1aba5);
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    border-bottom: 1px solid var(--bd-f0f3f0);
  }

  td {
    padding: 11px 16px;
    border-bottom: 1px solid var(--bd-f0f3f0);
    vertical-align: middle;
  }

  tbody tr {
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: var(--bg-edf3ef);
    }
  }
}

.nowrap {
  white-space: nowrap;
}

.request-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 220px;
}

.path {
  overflow-wrap: anywhere;
}

.method {
  flex: none;
  min-width: 52px;
  text-align: center;
  padding: 3px 7px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 700;
  background: var(--bg-f2f6f3);
  color: var(--fg-5e6c64);

  &.post {
    background: var(--bg-e4f3e9);
    color: var(--fg-22714e);
  }

  &.delete {
    background: var(--bg-fdf1ef);
    color: var(--fg-c65b4d);
  }
}

.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;

  i {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    margin-right: 6px;
    background: currentColor;
  }

  &.done {
    background: var(--bg-e4f3e9);
    color: var(--fg-22714e);
  }

  &.in-progress {
    background: #fff4dc;
    color: #a06a00;
  }

  &.error {
    background: var(--bg-fdf1ef);
    color: var(--fg-c65b4d);
  }
}

.tags {
  white-space: nowrap;
}

.tag {
  display: inline-block;
  margin-right: 4px;
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  background: var(--bg-d2eddd);
  color: var(--fg-26845b);

  &.danger {
    background: var(--bg-fdf1ef);
    color: var(--fg-c65b4d);
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  color: var(--muted);
  font-size: 11px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-state {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;

  h2 {
    font: 600 20px "Space Grotesk";
    margin: 18px 0 8px;
  }

  p {
    color: var(--muted);
    font-size: 12px;
    margin: 0;
  }
}

.empty-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  color: var(--green);
  background: var(--bg-eaf7ef);
  border-radius: 50%;
}

.detail {
  font-size: 12px;

  h3 {
    font: 600 14px "Space Grotesk";
    margin: 22px 0 8px;
  }

  pre {
    margin: 0;
    padding: 10px 12px;
    max-height: 260px;
    overflow: auto;
    background: var(--bg-f2f6f3);
    border-radius: 6px;
    font-size: 11px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;

  > div {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .full {
    grid-column: 1 / -1;
  }
}

.detail-label {
  display: block;
  color: var(--muted);
  font-size: 10px;
  font-weight: 600;
  margin-bottom: 3px;
}

.mono {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 11px;
}

.exception-title {
  color: var(--fg-c65b4d);
  font-weight: 600;
  margin: 0 0 8px;
}

.change {
  border: 1px solid var(--bd-e9eeea);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
}

.change-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.change-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
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

@media (max-width: 680px) {
  .page-heading {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
