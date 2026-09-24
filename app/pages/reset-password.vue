<template>
  <main class="login-page">
    <section class="login-brand-panel">
      <div class="login-brand">
        <div class="brand-mark"><span></span><span></span><span></span></div>
        <span>route<span class="brand-accent">X</span>flow</span>
      </div>
      <div class="login-pitch">
        <p class="eyebrow">CENTRAL DE OPERAÇÕES</p>
        <h1>Mais entregas.<br /><em>Menos desvios.</em></h1>
        <p>
          Conecte seus aplicativos e encontre as melhores combinações para sua
          rota em tempo real.
        </p>
      </div>
      <p class="login-footer">
        RouteXFlow <span>·</span> Feito para quem está na rua
      </p>
    </section>
    <section class="login-form-panel">
      <div class="login-form-wrap">
        <div class="mobile-login-brand">
          <div class="brand-mark"><span></span><span></span><span></span></div>
          <span>route<span class="brand-accent">X</span>flow</span>
        </div>

        <template v-if="!token">
          <p class="eyebrow">LINK INVÁLIDO</p>
          <h2>Link de redefinição inválido</h2>
          <p class="form-intro">
            Este link expirou ou está incompleto. Solicite uma nova recuperação
            de senha.
          </p>
          <NuxtLink class="login-button" to="/login">Voltar ao login</NuxtLink>
        </template>

        <template v-else-if="resetDone">
          <p class="eyebrow">TUDO CERTO</p>
          <h2>Senha redefinida</h2>
          <p class="form-intro">
            Sua senha foi alterada com sucesso. Faça login com a nova senha.
          </p>
          <NuxtLink class="login-button" to="/login">Ir para o login</NuxtLink>
        </template>

        <template v-else>
          <p class="eyebrow">NOVA SENHA</p>
          <h2>Defina sua nova senha</h2>
          <p class="form-intro">Escolha uma nova senha para sua conta.</p>
          <form @submit.prevent="resetPassword">
            <label for="new-password"
              >Nova senha
              <div class="password-field">
                <input
                  id="new-password"
                  v-model="passwordForm.password"
                  :type="flagPasswordEye ? 'text' : 'password'"
                  placeholder="Digite a nova senha"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="flagPasswordEye ? 'Ocultar senha' : 'Mostrar senha'"
                  @click="flagPasswordEye = !flagPasswordEye"
                >
                  <EyeOff v-if="!flagPasswordEye" :size="17" />
                  <Eye v-else :size="17" />
                </button>
              </div></label
            >

            <label for="confirm-new-password"
              >Confirmar nova senha
              <div class="password-field">
                <input
                  id="confirm-new-password"
                  v-model="passwordForm.confirmPassword"
                  :type="flagConfirmPasswordEye ? 'text' : 'password'"
                  placeholder="Repita a nova senha"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="
                    flagConfirmPasswordEye ? 'Ocultar senha' : 'Mostrar senha'
                  "
                  @click="flagConfirmPasswordEye = !flagConfirmPasswordEye"
                >
                  <EyeOff v-if="!flagConfirmPasswordEye" :size="17" />
                  <Eye v-else :size="17" />
                </button>
              </div></label
            >

            <p v-if="error" class="form-error">{{ error }}</p>
            <button class="login-button" type="submit">
              Redefinir senha <span>→</span>
            </button>
          </form>
        </template>
      </div>
      <p class="legal-copy">
        Ao continuar, você concorda com nossos termos de uso e política de
        privacidade.
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { Eye } from "@lucide/vue";
import { EyeOff } from "@lucide/vue";
import useLoading from "~/composable/useLoading";
import { useNuxtApp } from "#app";
import { useToastService } from "~/composable/useToast";

const toast = useToastService();
const { loadingPush, loadingPop } = useLoading();
const route = useRoute();

const token = computed(() => String(route.query.token ?? ""));

const passwordForm = reactive({
  password: "",
  confirmPassword: "",
});
const error = ref("");
const resetDone = ref(false);
const flagPasswordEye = ref(false);
const flagConfirmPasswordEye = ref(false);

async function resetPassword() {
  loadingPush();
  error.value = "";

  if (!passwordForm.password || !passwordForm.confirmPassword) {
    error.value = "Preencha a nova senha nos dois campos.";
    toast.error(error.value);
    loadingPop();
    return;
  }

  if (passwordForm.password !== passwordForm.confirmPassword) {
    error.value = "As senhas informadas não coincidem.";
    toast.error(error.value);
    loadingPop();
    return;
  }

  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.auth.ResetPassword({
      token: token.value,
      password: passwordForm.password,
    });

    if (!response.success) {
      toast.error(response.errors[0] ?? "Não foi possível redefinir sua senha.");
      return;
    }

    resetDone.value = true;
    toast.success("Senha redefinida com sucesso.");
  } catch (cause: any) {
    const message =
      cause?.errors?.[0] ?? "Não foi possível redefinir sua senha. Tente novamente.";
    error.value = message;
    toast.error(message);
  } finally {
    loadingPop();
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  background: #fff;
}

.login-brand-panel {
  background: #eaf7ef;
  padding: 42px 9%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.login-brand,
.mobile-login-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font: 700 20px "Space Grotesk";
  letter-spacing: -0.8px;
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

.login-pitch {
  margin: auto 0;

  h1 {
    font: 700 clamp(38px, 5vw, 65px) "Space Grotesk";
    letter-spacing: -3px;
    line-height: 1.03;
    margin: 16px 0;
  }

  h1 em {
    color: var(--green);
    font-style: normal;
  }
}

.login-pitch > p:not(.eyebrow) {
  max-width: 385px;
  color: #6a8273;
  line-height: 1.7;
  font-size: 14px;
}

.login-footer {
  color: #78a088;
  font-size: 10px;

  span {
    margin: 0 5px;
  }
}

.login-form-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 12%;
  position: relative;
}

.login-form-wrap {
  width: 100%;
  max-width: 390px;
  margin: auto;
}

.mobile-login-brand {
  display: none;
}

.login-form-wrap h2 {
  font: 700 32px "Space Grotesk";
  letter-spacing: -1px;
  margin: 0 0 9px;
}

.form-intro {
  color: var(--muted);
  font-size: 13px;
  margin: 0 0 32px;
}

.login-form-panel form > label {
  display: block;
  color: #506057;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 18px;
}

.login-form-panel input[type="password"],
.login-form-panel input[type="text"] {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 13px 14px;
  border: 1px solid #dfe8e1;
  border-radius: 5px;
  outline: none;
  color: var(--ink);
  font-size: 12px;
}

.login-form-panel input:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px #dff2e6;
}

.password-field {
  position: relative;

  input {
    padding-right: 40px !important;
  }

  .password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: none;
    color: #9da9a1;
    display: grid;
    place-items: center;
    padding: 4px;
    cursor: pointer;
  }
}

.login-button {
  display: block;
  width: 100%;
  padding: 13px;
  background: var(--green);
  color: #fff;
  border: 0;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s ease;

  span {
    float: right;
    font-size: 17px;
    line-height: 12px;
  }

  &:hover {
    background: #22714e;
    scale: 1.05;
  }
}

.form-error {
  color: #c65b4d;
  font-size: 11px;
  margin: -10px 0 15px;
}

.legal-copy {
  position: absolute;
  bottom: 28px;
  left: 12%;
  right: 12%;
  text-align: center;
  color: #b1bab4;
  font-size: 10px;
}

@media (max-width: 1050px) {
  .login-brand-panel {
    padding-left: 7%;
    padding-right: 7%;
  }

  .login-form-panel {
    padding-left: 8%;
    padding-right: 8%;
  }
}
@media (max-width: 680px) {
  .login-page {
    display: block;
  }

  .login-brand-panel {
    display: none;
  }

  .login-form-panel {
    min-height: 100vh;
    padding: 32px 26px;
  }

  .mobile-login-brand {
    display: flex;
    margin-bottom: 70px;
  }

  .login-form-wrap h2 {
    font-size: 28px;
  }

  .legal-copy {
    left: 26px;
    right: 26px;
  }
}
</style>
