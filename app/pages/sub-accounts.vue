<template>
  <div class="app-shell">
    <Sidebar />
    <main class="content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Painel</span><b>/</b><strong>Sub-contas</strong>
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
          <h1>Sub-contas</h1>
          <p class="heading-copy">
            Contas filiais usadas nos celulares da operação. Cada nome de
            usuário é único e não pode ser repetido.
          </p>
        </div>
        <button class="primary-button" @click="openCreate">
          <span>+</span> Nova sub-conta
        </button>
      </section>

      <section v-if="subAccounts.length === 0" class="empty-state panel">
        <span class="empty-icon">✦</span>
        <h2>Nenhuma sub-conta cadastrada</h2>
        <p>
          Crie uma sub-conta com nome de usuário e senha para entrar com ela
          no aplicativo do celular.
        </p>
        <button class="primary-button" @click="openCreate">
          Adicionar sub-conta
        </button>
      </section>

      <section v-else class="panel account-list">
        <div v-for="account in subAccounts" :key="account.id" class="account-row">
          <span class="account-icon"><UserRound :size="15" /></span>
          <div class="account-info">
            <strong>{{ account.username }}</strong>
            <span>Criada em {{ formatDate(account.createdAt) }}</span>
          </div>
          <button
            class="icon-button-sm danger"
            aria-label="Remover sub-conta"
            @click="openDelete(account)"
          >
            <Trash2 :size="13" />
          </button>
        </div>
      </section>

      <footer>RouteXFlow <span>·</span> Painel administrativo</footer>
    </main>

    <Dialog
      v-model:visible="showCreate"
      modal
      header="Nova sub-conta"
      :style="{ width: '400px' }"
    >
      <form class="dialog-form" @submit.prevent="submitCreate">
        <label for="sub-username"
          >Nome de usuário
          <InputText
            id="sub-username"
            v-model="form.username"
            placeholder="ex: filial.centro"
            autocomplete="off"
            maxlength="30"
            fluid
        /></label>
        <label for="sub-password"
          >Senha
          <InputText
            id="sub-password"
            v-model="form.password"
            type="password"
            placeholder="Mínimo de 8 caracteres"
            autocomplete="new-password"
            fluid
        /></label>

        <p v-if="formError" class="form-error">{{ formError }}</p>

        <div class="dialog-actions">
          <button type="button" class="outline-button" @click="showCreate = false">
            Cancelar
          </button>
          <button type="submit" class="primary-button" :disabled="saving">
            Criar sub-conta
          </button>
        </div>
      </form>
    </Dialog>

    <Dialog
      v-model:visible="showDelete"
      modal
      header="Remover sub-conta"
      :style="{ width: '400px' }"
    >
      <p class="delete-confirm-text">
        Tem certeza que deseja remover a sub-conta
        <strong>{{ deleteTarget?.username }}</strong
        >? Os celulares que usam esse acesso perderão a conexão.
      </p>

      <div class="dialog-actions">
        <button type="button" class="outline-button" @click="showDelete = false">
          Cancelar
        </button>
        <button type="button" class="danger-button" @click="confirmDelete">
          Remover sub-conta
        </button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { UserRound, Trash2 } from "@lucide/vue";
import { useNuxtApp } from "#app";
import useLoading from "~/composable/useLoading";
import { useToastService } from "~/composable/useToast";
import { getLoggedUser } from "~/composable/useAuth";
import { loadSubAccounts, useSubAccountsState } from "~/composable/useSubAccounts";
import type { ISubAccount } from "~/infra/interfaces/services/subAccount";

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

const subAccounts = useSubAccountsState();

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

onMounted(async () => {
  loadingPush();
  try {
    await loadSubAccounts();
  } catch (cause: any) {
    toast.error(cause?.errors?.[0] ?? "Não foi possível carregar as sub-contas.");
  } finally {
    loadingPop();
  }
});

const showCreate = ref(false);
const saving = ref(false);
const form = reactive({ username: "", password: "" });
const formError = ref("");

function openCreate() {
  form.username = "";
  form.password = "";
  formError.value = "";
  showCreate.value = true;
}

async function submitCreate() {
  formError.value = "";
  const username = form.username.trim().toLowerCase();

  if (!/^[a-z0-9._]{3,30}$/.test(username)) {
    formError.value =
      "O usuário deve ter de 3 a 30 caracteres: letras, números, ponto ou underline.";
    return;
  }

  if (form.password.length < 8) {
    formError.value = "A senha deve ter pelo menos 8 caracteres.";
    return;
  }

  saving.value = true;
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.subAccount.Create({
      username,
      password: form.password,
    });

    subAccounts.value = [...subAccounts.value, response.result];
    showCreate.value = false;
    toast.success("Sub-conta criada com sucesso.");
  } catch (cause: any) {
    formError.value = cause?.errors?.[0] ?? "Não foi possível criar a sub-conta.";
  } finally {
    saving.value = false;
  }
}

const showDelete = ref(false);
const deleteTarget = ref<ISubAccount | null>(null);

function openDelete(account: ISubAccount) {
  deleteTarget.value = account;
  showDelete.value = true;
}

async function confirmDelete() {
  if (!deleteTarget.value) return;

  const id = deleteTarget.value.id;
  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    await $httpClient.subAccount.Delete(id);
    subAccounts.value = subAccounts.value.filter((account) => account.id !== id);
    showDelete.value = false;
    toast.success("Sub-conta removida.");
  } catch (cause: any) {
    toast.error(cause?.errors?.[0] ?? "Não foi possível remover a sub-conta.");
  } finally {
    loadingPop();
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
  max-width: 480px;
  color: var(--muted);
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.empty-state {
  min-height: 300px;
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
    max-width: 370px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.6;
    margin: 0 0 20px;
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
  font-size: 22px;
}

.account-list {
  padding: 8px 20px;
}

.account-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--bd-f0f3f0);

  &:last-child {
    border-bottom: 0;
  }
}

.account-icon {
  width: 29px;
  height: 29px;
  flex: 0 0 29px;
  display: grid;
  place-items: center;
  background: var(--bg-f2f6f3);
  color: var(--fg-5e6c64);
  border-radius: 8px;
}

.account-info {
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 13px;
  }

  span {
    color: var(--muted);
    font-size: 11px;
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

  &.danger:hover {
    background: var(--bg-fdf1ef);
    color: var(--fg-c65b4d);
    border-color: var(--bd-f2d5d0);
  }
}

.dialog-form {
  display: flex;
  flex-direction: column;

  > label {
    display: block;
    color: var(--fg-506057);
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 16px;
  }
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.form-error {
  color: var(--fg-c65b4d);
  font-size: 11px;
  margin: -6px 0 14px;
}

.delete-confirm-text {
  color: var(--fg-506057);
  font-size: 12px;
  line-height: 1.6;
  margin: 0 0 20px;

  strong {
    color: var(--ink);
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

@media (max-width: 680px) {
  .page-heading {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
