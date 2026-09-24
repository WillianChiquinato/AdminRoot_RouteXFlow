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
        <div class="route-preview">
          <span class="route-point start"></span>
          <span class="route-line"></span>

          <span class="route-point finish"></span>
          <span class="route-line-variant"></span>

          <span class="route-point finish"></span>
          <span class="route-line-variant"></span>

          <span class="route-point finish"></span>

          <div>
            <strong>Centro → Bairro</strong>
            <small>Rota otimizada · 8,4 km</small>
          </div>
        </div>
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

        <Tabs v-model:value="activeTab" class="auth-tabs">
          <TabList>
            <Tab value="login">Entrar</Tab>
            <Tab value="register">Criar conta</Tab>
            <Tab value="forgot">Recuperar senha</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="login">
              <p class="eyebrow">BEM-VINDO</p>
              <h2>Entre no seu painel</h2>
              <p class="form-intro">
                Acompanhe suas corridas e organize seu dia.
              </p>
              <form @submit.prevent="login">
                <label for="email"
                  >E-mail<input
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="voce@email.com"
                    autocomplete="email"
                /></label>

                <label for="password"
                  >Senha
                  <div class="password-field">
                    <input
                      id="password"
                      v-model="password"
                      :type="flagPasswordEye ? 'text' : 'password'"
                      placeholder="Digite sua senha"
                      autocomplete="current-password"
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      :aria-label="
                        flagPasswordEye ? 'Ocultar senha' : 'Mostrar senha'
                      "
                      @click="flagPasswordEye = !flagPasswordEye"
                    >
                      <EyeOff v-if="!flagPasswordEye" :size="17" />
                      <Eye v-else :size="17" />
                    </button>
                  </div></label
                >
                <div class="form-options">
                  <label class="remember"
                    ><Checkbox v-model="remember" binary /><span
                      >Lembrar de mim</span
                    ></label
                  ><a href="#" @click.prevent="activeTab = 'forgot'"
                    >Esqueci minha senha</a
                  >
                </div>
                <p v-if="error" class="form-error">{{ error }}</p>
                <button class="login-button" type="submit">
                  Entrar no painel <span>→</span>
                </button>
              </form>
              <p class="signup-copy">
                Ainda não tem uma conta?
                <a href="#" @click.prevent="activeTab = 'register'"
                  >Criar conta</a
                >
              </p>
            </TabPanel>

            <TabPanel value="register">
              <p class="eyebrow">CRIE SUA CONTA</p>
              <h2>Cadastre-se no RouteXFlow</h2>
              <p class="form-intro">
                Preencha seus dados para começar a otimizar suas rotas.
              </p>
              <form @submit.prevent="register">
                <label for="register-name"
                  >Nome completo<input
                    id="register-name"
                    v-model="registerForm.name"
                    type="text"
                    placeholder="Seu nome completo"
                    autocomplete="name"
                /></label>

                <label for="register-email"
                  >E-mail<input
                    id="register-email"
                    v-model="registerForm.email"
                    type="email"
                    placeholder="voce@email.com"
                    autocomplete="email"
                /></label>

                <div class="field-row">
                  <label for="register-cpf"
                    >CPF<InputMask
                      id="register-cpf"
                      v-model="registerForm.cpf"
                      mask="999.999.999-99"
                      type="text"
                      placeholder="000.000.000-00"
                      autocomplete="off"
                  /></label>
                  <label for="register-phone"
                    >Telefone<InputMask
                      id="register-phone"
                      v-model="registerForm.phoneNumber"
                      mask="(99)99999-9999"
                      type="text"
                      placeholder="(00) 00000-0000"
                      autocomplete="tel"
                  /></label>
                </div>

                <label for="register-role"
                  >Perfil de acesso
                  <Select
                    id="register-role"
                    v-model="registerForm.roleId"
                    :options="roles"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Selecione um perfil"
                    class="form-dropdown"
                    fluid
                  />
                </label>

                <label for="register-apps"
                  >Aplicativos que você usa
                  <MultiSelect
                    id="register-apps"
                    v-model="registerForm.appActives"
                    :options="apps"
                    optionLabel="name"
                    optionValue="id"
                    placeholder="Selecione os aplicativos"
                    display="chip"
                    class="form-dropdown"
                    fluid
                  />
                </label>

                <label for="register-password"
                  >Senha
                  <div class="password-field">
                    <input
                      id="register-password"
                      v-model="registerForm.password"
                      :type="flagRegisterPasswordEye ? 'text' : 'password'"
                      placeholder="Crie uma senha"
                      autocomplete="new-password"
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      :aria-label="
                        flagRegisterPasswordEye
                          ? 'Ocultar senha'
                          : 'Mostrar senha'
                      "
                      @click="
                        flagRegisterPasswordEye = !flagRegisterPasswordEye
                      "
                    >
                      <EyeOff v-if="!flagRegisterPasswordEye" :size="17" />
                      <Eye v-else :size="17" />
                    </button>
                  </div></label
                >

                <label for="register-confirm-password"
                  >Confirmar senha
                  <div class="password-field">
                    <input
                      id="register-confirm-password"
                      v-model="registerForm.confirmPassword"
                      :type="flagConfirmPasswordEye ? 'text' : 'password'"
                      placeholder="Repita a senha"
                      autocomplete="new-password"
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      :aria-label="
                        flagConfirmPasswordEye
                          ? 'Ocultar senha'
                          : 'Mostrar senha'
                      "
                      @click="
                        flagConfirmPasswordEye = !flagConfirmPasswordEye
                      "
                    >
                      <EyeOff v-if="!flagConfirmPasswordEye" :size="17" />
                      <Eye v-else :size="17" />
                    </button>
                  </div></label
                >

                <p v-if="registerError" class="form-error">
                  {{ registerError }}
                </p>
                <button class="login-button" type="submit">
                  Criar conta <span>→</span>
                </button>
              </form>
              <p class="signup-copy">
                Já tem uma conta?
                <a href="#" @click.prevent="activeTab = 'login'">Entrar</a>
              </p>
            </TabPanel>

            <TabPanel value="forgot">
              <p class="eyebrow">RECUPERAR SENHA</p>
              <h2>Esqueceu sua senha?</h2>
              <p class="form-intro">
                Informe seu e-mail e enviaremos instruções para redefinir sua
                senha.
              </p>
              <form @submit.prevent="forgotPassword">
                <label for="forgot-email"
                  >E-mail<input
                    id="forgot-email"
                    v-model="forgotEmail"
                    type="email"
                    placeholder="voce@email.com"
                    autocomplete="email"
                /></label>

                <p v-if="forgotError" class="form-error">{{ forgotError }}</p>
                <p v-if="forgotSent" class="form-success">
                  Se o e-mail informado existir em nossa base, você receberá
                  as instruções em instantes.
                </p>
                <button class="login-button" type="submit">
                  Enviar instruções <span>→</span>
                </button>
              </form>
              <p class="signup-copy">
                Lembrou sua senha?
                <a href="#" @click.prevent="activeTab = 'login'">Entrar</a>
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
      <p class="legal-copy">
        Ao continuar, você concorda com nossos termos de uso e política de
        privacidade.
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";

import { Eye } from "@lucide/vue";
import { EyeOff } from "@lucide/vue";
import {
  Checkbox,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Select,
  MultiSelect,
  InputMask
} from "primevue";
import useLoading from "~/composable/useLoading";
import { setLoggedUser } from "~/composable/useAuth";
import { useNuxtApp } from "#app";
import type { IRole } from "~/infra/interfaces/services/role";
import type { IApp } from "~/infra/interfaces/services/app";

import { useToastService } from "~/composable/useToast";
const toast = useToastService();

const { loadingPush, loadingPop } = useLoading();

const activeTab = ref("login");

const email = ref("");
const password = ref("");
const remember = ref(true);
const error = ref("");

const flagPasswordEye = ref(false);

async function login() {
  loadingPush();

  if (!email.value || !password.value) {
    error.value = "Informe seu e-mail e sua senha para continuar.";
    toast.error(error.value);
    loadingPop();
    return;
  }

  error.value = "";

  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.auth.Login({
      email: email.value,
      password: password.value,
    });

    if (!response.success) {
      toast.error(response.errors[0] ?? "Usuário nao Identificado");
      return;
    }

    setLoggedUser(response.result);
    toast.success("Login realizado com sucesso");
    await new Promise((resolve) => setTimeout(resolve, 300));
    await navigateTo("/");
  } catch (cause: any) {
    const message = cause?.errors?.[0] ?? "Não foi possível entrar. Tente novamente.";
    error.value = message;
    toast.error(message);
  } finally {
    loadingPop();
  }
}

const roles = ref<IRole[]>([]);
const apps = ref<IApp[]>([]);

const registerForm = reactive({
  name: "",
  email: "",
  cpf: "",
  phoneNumber: "",
  roleId: null as number | null,
  appActives: [] as number[],
  password: "",
  confirmPassword: "",
});
const registerError = ref("");
const flagRegisterPasswordEye = ref(false);
const flagConfirmPasswordEye = ref(false);

async function loadRegisterOptions() {
  try {
    const { $httpClient } = useNuxtApp();
    const [rolesResponse, appsResponse] = await Promise.all([
      $httpClient.role.RoleList(),
      $httpClient.app.AppList(),
    ]);

    if (rolesResponse.success) roles.value = rolesResponse.result;
    if (appsResponse.success) apps.value = appsResponse.result;
  } catch {
    toast.error("Não foi possível carregar os perfis e aplicativos disponíveis.");
  }
}

watch(activeTab, (tab) => {
  if (tab === "register" && roles.value.length === 0 && apps.value.length === 0) {
    loadRegisterOptions();
  }
});

function resetRegisterForm() {
  registerForm.name = "";
  registerForm.email = "";
  registerForm.cpf = "";
  registerForm.phoneNumber = "";
  registerForm.roleId = null;
  registerForm.appActives = [];
  registerForm.password = "";
  registerForm.confirmPassword = "";
}

async function register() {
  loadingPush();
  registerError.value = "";

  if (
    !registerForm.name ||
    !registerForm.email ||
    !registerForm.cpf ||
    !registerForm.phoneNumber ||
    !registerForm.roleId ||
    !registerForm.password
  ) {
    registerError.value = "Preencha todos os campos obrigatórios.";
    toast.error(registerError.value);
    loadingPop();
    return;
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    registerError.value = "As senhas informadas não coincidem.";
    toast.error(registerError.value);
    loadingPop();
    return;
  }

  var formatCPF = cleanNumber(registerForm.cpf);
  var formatTell = cleanNumber(registerForm.phoneNumber);

  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.user.Register({
      name: registerForm.name,
      email: registerForm.email,
      cpf: formatCPF,
      phoneNumber: formatTell,
      password: registerForm.password,
      roleId: registerForm.roleId,
      appActives: registerForm.appActives,
    });

    if (!response.success) {
      toast.error(response.errors[0] ?? "Não foi possível concluir o cadastro.");
      return;
    }

    toast.success("Cadastro realizado com sucesso. Faça login para continuar.");
    email.value = registerForm.email;
    resetRegisterForm();
    activeTab.value = "login";
  } catch (cause: any) {
    const message =
      cause?.errors?.[0] ?? "Não foi possível concluir o cadastro. Tente novamente.";
    registerError.value = message;
    toast.error(message);
  } finally {
    loadingPop();
  }
}

const forgotEmail = ref("");
const forgotError = ref("");
const forgotSent = ref(false);

async function forgotPassword() {
  loadingPush();
  forgotError.value = "";
  forgotSent.value = false;

  if (!forgotEmail.value) {
    forgotError.value = "Informe seu e-mail para continuar.";
    toast.error(forgotError.value);
    loadingPop();
    return;
  }

  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.auth.ForgotPassword({
      email: forgotEmail.value,
    });

    if (!response.success) {
      toast.error(
        response.errors[0] ?? "Não foi possível enviar as instruções."
      );
      return;
    }

    forgotSent.value = true;
    toast.success("Instruções de recuperação enviadas para o seu e-mail.");
  } catch (cause: any) {
    const message =
      cause?.errors?.[0] ??
      "Não foi possível enviar as instruções. Tente novamente.";
    forgotError.value = message;
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

.login-brand-panel::after {
  content: "";
  position: absolute;
  width: 440px;
  height: 440px;
  border: 1px solid #c8e8d3;
  border-radius: 50%;
  right: -190px;
  bottom: -180px;
}

.login-brand,
.mobile-login-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font: 700 20px "Space Grotesk";
  letter-spacing: -0.8px;
}

.login-brand {
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 1;

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

.route-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 50px;

  strong,
  small {
    display: block;
  }

  strong {
    font-size: 12px;
  }
  small {
    color: #7c9785;
    font-size: 10px;
    margin-top: 4px;
  }
}

.route-point {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px var(--green);
}

.finish {
  box-shadow: 0 0 0 2px #e58b6e;
  background: #e58b6e;
}

.start {
  background: var(--green);
  box-shadow: 0 0 0 2px var(--green);
}

.route-line {
  width: 55px;
  border-top: 1px dashed #89b99a;
}

.route-line-variant {
  width: 35px;
  border-top: 1px dashed #e58b6e;
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

.auth-tabs {
  :deep(.p-tablist) {
    margin-bottom: 28px;
    border-bottom: 1px solid #e5ece7;
  }

  :deep(.p-tablist-tab-list) {
    background: transparent;
  }

  :deep(.p-tab) {
    padding: 0 0 12px;
    margin-right: 24px;
    font-size: 12px;
    font-weight: 700;
    color: #9aa79f;
    background: transparent;
    border: none;
  }

  :deep(.p-tab-active) {
    color: var(--green);
  }

  :deep(.p-tablist-active-bar) {
    background: var(--green);
    height: 2px;
  }

  :deep(.p-tabpanels) {
    padding: 0;
    background: transparent;
  }
}

.login-form-panel form > label,
.login-form-panel form > .field-row > label {
  display: block;
  color: #506057;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 18px;
}

.field-row {
  display: flex;
  gap: 12px;

  label {
    flex: 1;
    min-width: 0;
  }
}

.login-form-panel input[type="email"],
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

.form-dropdown {
  margin-top: 8px;

  :deep(.p-select-label),
  :deep(.p-multiselect-label) {
    padding: 13px 14px;
    font-size: 12px;
  }

  &:deep(.p-select),
  &:deep(.p-multiselect) {
    border: 1px solid #dfe8e1;
    border-radius: 5px;
  }

  :deep(.p-select-dropdown svg),
  :deep(.p-multiselect-dropdown svg) {
    transition: transform 0.2s ease;
  }

  :deep(.p-select-open .p-select-dropdown svg),
  :deep(.p-multiselect-open .p-multiselect-dropdown svg) {
    transform: rotate(180deg);
  }
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 23px 0 26px;
  font-size: 11px;
}
.remember {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #7b867f;

  span {
    font-size: 12px;
    font-weight: bold;
  }

  input {
    accent-color: var(--green);
  }
}

.form-options a,
.signup-copy a {
  color: var(--green);
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
}

.login-button {
  width: 100%;
  padding: 13px;
  background: var(--green);
  color: #fff;
  border: 0;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
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

.signup-copy {
  text-align: center;
  color: #8a958e;
  font-size: 11px;
  margin-top: 25px;
}

.form-error {
  color: #c65b4d;
  font-size: 11px;
  margin: -10px 0 15px;
}

.form-success {
  color: var(--green);
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
