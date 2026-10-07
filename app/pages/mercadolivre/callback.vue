<template>
  <main class="callback-page">
    <section class="callback-card panel">
      <div class="brand">
        <div class="brand-mark"><span></span><span></span><span></span></div>
        <span>route<span class="brand-accent">X</span>flow</span>
      </div>

      <div :class="['status-icon', `status-icon--${status}`]">
        <LoaderCircle v-if="status === 'processing'" :size="30" class="spin" />
        <CircleCheck v-else-if="status === 'success'" :size="30" />
        <CircleX v-else :size="30" />
      </div>

      <h1>{{ title }}</h1>
      <p>{{ message }}</p>

      <p v-if="status === 'success' && nickname" class="account">
        Conta: <strong>{{ nickname }}</strong>
      </p>

      <NuxtLink v-if="status !== 'processing'" class="back-button" to="/sync">
        Voltar para sincronização
      </NuxtLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { CircleCheck, CircleX, LoaderCircle } from "@lucide/vue";
import { useNuxtApp } from "#app";

type Status = "processing" | "success" | "error";

const route = useRoute();
const status = ref<Status>("processing");
const errorMessage = ref("");
const nickname = ref("");

const title = computed(() => {
  if (status.value === "processing") return "Conectando ao Mercado Livre";
  if (status.value === "success") return "Conta sincronizada";
  return "Não foi possível sincronizar";
});

const message = computed(() => {
  if (status.value === "processing") {
    return "Estamos finalizando a autorização da sua conta. Isso leva só alguns segundos.";
  }
  if (status.value === "success") {
    return "Tudo certo! Sua conta do Mercado Livre já está conectada ao RouteXFlow.";
  }
  return errorMessage.value || "A autorização foi recusada ou expirou. Tente sincronizar novamente.";
});

function fail(text?: string) {
  errorMessage.value = text ?? "";
  status.value = "error";
}

async function loadAccount() {
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.mercadoLivre.Me();
    nickname.value = response.success ? (response.result?.nickname ?? "") : "";
  } catch {
    // O nome da conta é só um detalhe visual.
  }
}

async function finish() {
  status.value = "success";
  await loadAccount();
  setTimeout(() => navigateTo("/sync"), 3500);
}

async function handleCallback() {
  const { code, state, error, error_description, status: backStatus, message: backMessage } =
    route.query as Record<string, string | undefined>;

  // Mercado Livre devolveu erro (ex.: usuário negou o acesso).
  if (error) {
    fail(error_description ?? "O acesso à conta do Mercado Livre foi negado.");
    return;
  }

  // O back já tratou o callback e só redirecionou para cá com o resultado.
  if (backStatus) {
    if (backStatus === "success") await finish();
    else fail(backMessage);
    return;
  }

  if (!code || !state) {
    fail("Link de retorno incompleto. Inicie a sincronização novamente.");
    return;
  }

  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.mercadoLivre.Callback(code, state);

    if (!response.success) {
      fail(response.errors?.[0]);
      return;
    }

    await finish();
  } catch (cause: any) {
    fail(cause?.errors?.[0]);
  }
}

// O code do OAuth só pode ser usado uma vez, então roda apenas no mount.
onMounted(handleCallback);
</script>

<style lang="scss" scoped>
.callback-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--bg-eaf7ef);
}

.callback-card {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 36px 32px;

  h1 {
    font: 700 24px "Space Grotesk";
    letter-spacing: -0.8px;
    margin: 20px 0 8px;
  }

  p {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.6;
    margin: 0 0 20px;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font: 700 18px "Space Grotesk";
  letter-spacing: -0.8px;
  margin-bottom: 28px;
}

.brand-accent {
  color: var(--green);
}

.brand-mark {
  width: 26px;
  height: 24px;
  display: flex;
  align-items: end;
  gap: 3px;
  transform: skew(-23deg);

  span {
    width: 6px;
    border-radius: 2px;
    background: var(--green);
  }

  span:nth-child(1) {
    height: 12px;
    opacity: 0.55;
  }
  span:nth-child(2) {
    height: 18px;
    opacity: 0.78;
  }
  span:nth-child(3) {
    height: 24px;
  }
}

.status-icon {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: grid;
  place-items: center;

  &--processing,
  &--success {
    background: var(--bg-eaf7ef);
    color: var(--green);
  }

  &--error {
    background: #fdecea;
    color: var(--fg-c65b4d);
  }
}

.account {
  margin-top: -6px;

  strong {
    color: var(--ink);
  }
}

.back-button {
  display: block;
  width: 100%;
  padding: 13px;
  background: var(--green);
  color: var(--fg-ffffff);
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease;

  &:hover {
    background: var(--bg-22714e);
  }
}

.spin {
  animation: callback-spin 0.9s linear infinite;
}

@keyframes callback-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
