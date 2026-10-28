<template>
  <div class="app-shell">
    <Sidebar />
    <main class="content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Painel</span><b>/</b><strong>Autorizações</strong>
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
          <h1>Autorizações</h1>
          <p class="heading-copy">
            Contas que já confirmaram o e-mail e aguardam a liberação de um
            administrador. Visível apenas para o perfil Root.
          </p>
        </div>
        <button class="outline-button" :disabled="loading" @click="loadPending">
          <RefreshCw :size="13" /> Atualizar
        </button>
      </section>

      <section v-if="!pending.length && !loading" class="panel empty-state">
        <span class="empty-icon"><UserCheck :size="22" /></span>
        <h2>Nenhuma conta pendente</h2>
        <p>Novos cadastros com e-mail confirmado aparecerão aqui.</p>
      </section>

      <section v-else class="panel table-panel">
        <div class="table-scroll">
          <table class="auth-table">
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Perfil solicitado</th>
                <th>Tipo de conta</th>
                <th>Cadastro</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pending" :key="item.id" @click="openDetail(item)">
                <td>
                  <strong>{{ item.name }}</strong>
                  <span class="sub">{{ item.email }}</span>
                </td>
                <td><span class="tag">{{ item.role }}</span></td>
                <td>{{ item.accountType }}</td>
                <td class="nowrap">{{ formatDateTime(item.createdAt) }}</td>
                <td class="actions" @click.stop>
                  <button
                    class="outline-button reject"
                    :disabled="busyId === item.id"
                    @click="askReject(item)"
                  >
                    <X :size="13" /> Recusar
                  </button>
                  <button
                    class="primary-button"
                    :disabled="busyId === item.id"
                    @click="approve(item)"
                  >
                    <Check :size="13" /> Autorizar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span>{{ pending.length }} conta(s) pendente(s)</span>
        </div>
      </section>

      <footer>RouteXFlow <span>·</span> Painel administrativo</footer>
    </main>

    <Dialog
      v-model:visible="showDetail"
      modal
      header="Detalhes da solicitação"
      :style="{ width: '560px', maxWidth: '95vw' }"
    >
      <div v-if="selected" class="detail">
        <div class="detail-grid">
          <div>
            <span class="detail-label">Nome</span>
            <span>{{ selected.name }}</span>
          </div>
          <div>
            <span class="detail-label">E-mail</span>
            <span>{{ selected.email }}</span>
          </div>
          <div>
            <span class="detail-label">CPF</span>
            <span>{{ selected.cpf }}</span>
          </div>
          <div>
            <span class="detail-label">Telefone</span>
            <span>{{ selected.phoneNumber }}</span>
          </div>
          <div>
            <span class="detail-label">Perfil solicitado</span>
            <span>{{ selected.role }}</span>
          </div>
          <div>
            <span class="detail-label">Tipo de conta</span>
            <span>{{ selected.accountType }}</span>
          </div>
          <div>
            <span class="detail-label">Cadastro em</span>
            <span>{{ formatDateTime(selected.createdAt) }}</span>
          </div>
          <div>
            <span class="detail-label">E-mail verificado em</span>
            <span>{{
              selected.emailVerifiedAt
                ? formatDateTime(selected.emailVerifiedAt)
                : "—"
            }}</span>
          </div>
          <div class="full">
            <span class="detail-label">Aplicativos</span>
            <span v-if="selected.apps?.length">
              <span v-for="app in selected.apps" :key="app" class="tag">{{
                app
              }}</span>
            </span>
            <span v-else>—</span>
          </div>
        </div>
        <div class="detail-actions">
          <button class="outline-button reject" @click="askReject(selected)">
            <X :size="13" /> Recusar
          </button>
          <button class="primary-button" @click="approve(selected)">
            <Check :size="13" /> Autorizar
          </button>
        </div>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showReject"
      modal
      header="Recusar solicitação"
      :style="{ width: '440px', maxWidth: '92vw' }"
    >
      <p class="reject-text">
        Recusar o cadastro de <strong>{{ rejecting?.name }}</strong
        >? Informe o motivo da recusa.
      </p>
      <Textarea
        v-model="rejectReason"
        rows="4"
        maxlength="500"
        placeholder="Motivo da recusa"
        class="reject-reason"
        fluid
      />
      <div class="detail-actions">
        <button class="outline-button" @click="showReject = false">
          Cancelar
        </button>
        <button
          class="primary-button danger"
          :disabled="!rejectReason.trim() || busyId === rejecting?.id"
          @click="confirmReject"
        >
          Confirmar recusa
        </button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RefreshCw, UserCheck, Check, X } from "@lucide/vue";
import { Textarea } from "primevue";
import { useNuxtApp } from "#app";
import useLoading from "~/composable/useLoading";
import { useToastService } from "~/composable/useToast";
import { getLoggedUser } from "~/composable/useAuth";
import type { IPendingUser } from "~/infra/interfaces/services/user";

const SUPER_ADMIN_ROLE_ID = 999;

// O middleware global já carregou o usuário; só o Root entra aqui.
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

const pending = ref<IPendingUser[]>([]);
const loading = ref(false);
const busyId = ref<number | null>(null);

const showDetail = ref(false);
const selected = ref<IPendingUser | null>(null);
const showReject = ref(false);
const rejecting = ref<IPendingUser | null>(null);
const rejectReason = ref("");

async function loadPending() {
  loading.value = true;
  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.user.GetPending();
    pending.value = response.result;
  } catch (cause: any) {
    toast.error(cause?.errors?.[0] ?? "Não foi possível carregar as solicitações.");
  } finally {
    loading.value = false;
    loadingPop();
  }
}

onMounted(loadPending);

function openDetail(item: IPendingUser) {
  selected.value = item;
  showDetail.value = true;
}

function removeFromList(id: number) {
  pending.value = pending.value.filter((item) => item.id !== id);
}

async function approve(item: IPendingUser) {
  busyId.value = item.id;
  try {
    const { $httpClient } = useNuxtApp();
    await $httpClient.user.Approve(item.id);
    removeFromList(item.id);
    showDetail.value = false;
    toast.success(`Conta de ${item.name} autorizada.`);
  } catch (cause: any) {
    toast.error(cause?.errors?.[0] ?? "Não foi possível autorizar a conta.");
  } finally {
    busyId.value = null;
  }
}

function askReject(item: IPendingUser) {
  rejecting.value = item;
  rejectReason.value = "";
  showReject.value = true;
}

async function confirmReject() {
  
  const item = rejecting.value;
  const reason = rejectReason.value.trim();
  if (!item || !reason)
  {
    console.log("item: ", item, reason);
    return;
  }

  busyId.value = item.id;
  try {
    const { $httpClient } = useNuxtApp();
    await $httpClient.user.Reject(item.id, { reason });
    removeFromList(item.id);
    showReject.value = false;
    showDetail.value = false;
    toast.success(`Cadastro de ${item.name} recusado.`);
  } catch (cause: any) {
    toast.error(cause?.errors?.[0] ?? "Não foi possível recusar a conta.");
  } finally {
    busyId.value = null;
  }
}

function formatDateTime(value: string) {
  // O backend serializa sem "Z"; trata como UTC para exibir no fuso local.
  const iso = /(Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`;
  return new Date(iso).toLocaleString("pt-BR");
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

.outline-button,
.primary-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.outline-button.reject {
  color: var(--fg-c65b4d);
}

.primary-button.danger {
  background: var(--fg-c65b4d);
}

.table-panel {
  padding: 0;
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.auth-table {
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

  .sub {
    display: block;
    margin-top: 2px;
    color: var(--muted);
    font-size: 11px;
  }

  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    white-space: nowrap;
  }
}

.nowrap {
  white-space: nowrap;
}

.tag {
  display: inline-block;
  margin: 0 4px 4px 0;
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  background: var(--bg-d2eddd);
  color: var(--fg-26845b);
}

.pagination {
  padding: 12px 16px;
  color: var(--muted);
  font-size: 11px;
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

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.reject-text {
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
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
