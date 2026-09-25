<template>
  <div class="app-shell">
    <Sidebar />
    <main class="content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Painel</span><b>/</b><strong>Sincronização</strong>
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
          <div>
          <p class="eyebrow">{{ getDateNow.toUpperCase() }}</p>
        </div>
          <h1>Sincronização de dispositivos</h1>
          <p class="heading-copy">Sincronizações para começar suas entregas.</p>
        </div>
        <button class="primary-button" @click="openRegisterContainer">
          <span>+</span> Novo container
        </button>
      </section>

      <section v-if="containers.length === 0" class="empty-state panel">
        <span class="empty-icon">✦</span>
        <h2>Nenhum container cadastrado</h2>
        <p>
          Crie um container e associe os dispositivos owner e navigation que vão
          se conectar aos seus apps.
        </p>
        <button class="primary-button" @click="openRegisterContainer">
          Cadastrar container
        </button>
      </section>

      <section v-else class="container-grid">
        <article
          v-for="container in containers"
          :key="container.id"
          class="panel container-card"
        >
          <div class="container-card-header">
            <div>
              <h2>{{ container.name }}</h2>
              <p>
                {{ ownerDevices(container).length }} owner ·
                {{ navigationDevices(container).length }} navegação
              </p>
            </div>
            <div class="header-actions">
              <button
                class="icon-button-sm"
                aria-label="Editar container"
                @click="openEditContainer(container)"
              >
                <Pencil :size="14" />
              </button>
              <button class="outline-button" @click="openAddDevice(container)">
                + Dispositivo
              </button>
            </div>
          </div>

          <div v-if="container.devices.length === 0" class="device-empty">
            Nenhum dispositivo vinculado a este container.
          </div>

          <div v-else class="device-list">
            <div
              v-for="device in container.devices"
              :key="device.id"
              class="device-row"
            >
              <span class="device-icon"><Smartphone :size="15" /></span>
              <div class="device-info">
                <strong>{{ device.name }}</strong>
                <span :class="['device-status', { offline: !device.connected }]"
                  ><i></i
                  >{{ device.connected ? "Conectado" : "Desconectado" }}</span
                >
              </div>
              <span :class="['role-badge', device.deviceIdentifier]">{{
                device.deviceIdentifier === "owner" ? "Mestre" : "Navegação"
              }}</span>
              <div class="device-actions">
                <button
                  class="icon-button-sm"
                  aria-label="Editar dispositivo"
                  @click="openEditDevice(device)"
                >
                  <Pencil :size="13" />
                </button>
                <button
                  class="icon-button-sm danger"
                  aria-label="Remover dispositivo"
                  @click="openDeleteDevice(device)"
                >
                  <Trash2 :size="13" />
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>

      <footer>RouteXFlow <span>·</span> Painel administrativo</footer>
    </main>

    <Dialog
      v-model:visible="showRegisterContainer"
      modal
      header="Novo container de conexão"
      class="sync-dialog"
      :style="{ width: '480px' }"
    >
      <form class="dialog-form" @submit.prevent="submitRegisterContainer">
        <label for="container-name"
          >Nome do container
          <InputText
            id="container-name"
            v-model="registerForm.name"
            placeholder="Ex: Entregas da semana 5"
            fluid
        /></label>

        <div class="device-fields">
          <p class="field-label">Dispositivos</p>
          <div
            v-for="(device, index) in registerForm.devices"
            :key="index"
            class="device-field-row"
          >
            <InputText
              v-model="device.name"
              placeholder="Nome do dispositivo"
            />
            <Dropdown
              v-model="device.role"
              :options="roleOptions"
              optionLabel="label"
              optionValue="value"
              class="role-dropdown"
            />
            <button
              type="button"
              class="remove-device-button"
              aria-label="Remover dispositivo"
              :disabled="registerForm.devices.length === 1"
              @click="removeDeviceRow(index)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
          <button type="button" class="add-device-button" @click="addDeviceRow">
            <Plus :size="14" /> Adicionar dispositivo
          </button>
        </div>

        <p v-if="registerError" class="form-error">{{ registerError }}</p>

        <div class="dialog-actions">
          <button
            type="button"
            class="outline-button"
            @click="showRegisterContainer = false"
          >
            Cancelar
          </button>
          <button type="submit" class="primary-button">
            Cadastrar container
          </button>
        </div>
      </form>
    </Dialog>

    <Dialog
      v-model:visible="showAddDevice"
      modal
      :header="`Novo dispositivo · ${addDeviceTarget?.name ?? ''}`"
      class="sync-dialog"
      :style="{ width: '400px' }"
    >
      <form class="dialog-form" @submit.prevent="submitAddDevice">
        <label for="device-name"
          >Nome do dispositivo
          <InputText
            id="device-name"
            v-model="addDeviceForm.name"
            placeholder="Ex: Dispositivo do vizinho"
            fluid
        /></label>
        <label for="device-role"
          >Papel do dispositivo
          <Dropdown
            id="device-role"
            v-model="addDeviceForm.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            class="role-dropdown"
            fluid
          />
        </label>

        <p v-if="addDeviceError" class="form-error">{{ addDeviceError }}</p>

        <div class="dialog-actions">
          <button
            type="button"
            class="outline-button"
            @click="showAddDevice = false"
          >
            Cancelar
          </button>
          <button type="submit" class="primary-button">
            Cadastrar dispositivo
          </button>
        </div>
      </form>
    </Dialog>

    <Dialog
      v-model:visible="showEditContainer"
      modal
      header="Editar container"
      class="sync-dialog"
      :style="{ width: '400px' }"
    >
      <form class="dialog-form" @submit.prevent="submitEditContainer">
        <label for="edit-container-name"
          >Nome do container
          <InputText
            id="edit-container-name"
            v-model="editContainerForm.name"
            placeholder="Ex: Entregas da semana 5"
            fluid
        /></label>

        <label class="checkbox-field">
          <Checkbox v-model="editContainerForm.isActive" binary />
          <span>Container ativo</span>
        </label>

        <p v-if="editContainerError" class="form-error">
          {{ editContainerError }}
        </p>

        <div class="dialog-actions">
          <button
            type="button"
            class="outline-button"
            @click="showEditContainer = false"
          >
            Cancelar
          </button>
          <button type="submit" class="primary-button">
            Salvar alterações
          </button>
        </div>
      </form>
    </Dialog>

    <Dialog
      v-model:visible="showEditDevice"
      modal
      :header="`Editar dispositivo · ${editDeviceTarget?.name ?? ''}`"
      class="sync-dialog"
      :style="{ width: '400px' }"
    >
      <form class="dialog-form" @submit.prevent="submitEditDevice">
        <label for="edit-device-name"
          >Nome do dispositivo
          <InputText
            id="edit-device-name"
            v-model="editDeviceForm.name"
            placeholder="Ex: Moto XRE 300"
            fluid
        /></label>
        <label for="edit-device-role"
          >Papel do dispositivo
          <Dropdown
            id="edit-device-role"
            v-model="editDeviceForm.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            class="role-dropdown"
            fluid
          />
        </label>

        <p v-if="editDeviceError" class="form-error">{{ editDeviceError }}</p>

        <div class="dialog-actions">
          <button
            type="button"
            class="outline-button"
            @click="showEditDevice = false"
          >
            Cancelar
          </button>
          <button type="submit" class="primary-button">
            Salvar alterações
          </button>
        </div>
      </form>
    </Dialog>

    <Dialog
      v-model:visible="showDeleteDevice"
      modal
      :header="`Remover dispositivo · ${deleteDeviceTarget?.name ?? ''}`"
      class="sync-dialog"
      :style="{ width: '400px' }"
    >
      <p class="delete-confirm-text">
        Tem certeza que deseja remover o dispositivo
        <strong>{{ deleteDeviceTarget?.name }}</strong
        >? Essa ação não pode ser desfeita.
      </p>

      <p v-if="deleteDeviceError" class="form-error">{{ deleteDeviceError }}</p>

      <div class="dialog-actions">
        <button
          type="button"
          class="outline-button"
          @click="showDeleteDevice = false"
        >
          Cancelar
        </button>
        <button type="button" class="danger-button" @click="deleteDevice">
          Remover dispositivo
        </button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { Smartphone, Plus, Pencil, Trash2 } from "@lucide/vue";
import { Checkbox } from "primevue";
import { useNuxtApp } from "#app";
import useLoading from "~/composable/useLoading";
import { useToastService } from "~/composable/useToast";
import { getLoggedUser } from "~/composable/useAuth";
import type { IContainer } from "~/infra/interfaces/services/container";
import type {
  IDevice,
  DeviceRole,
  DeviceType,
} from "~/infra/interfaces/services/device";

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

const roleOptions: { label: string; value: DeviceRole; type: DeviceType }[] = [
  { label: "Mestre", value: "owner", type: 1 },
  { label: "Navegação", value: "navigation", type: 2 },
];

function roleToType(role: DeviceRole): DeviceType {
  return roleOptions.find((option) => option.value === role)?.type ?? 1;
}

const containers = ref<IContainer[]>([]);

function ownerDevices(container: IContainer) {
  return container.devices.filter(
    (device) => device.deviceIdentifier === "owner",
  );
}

function navigationDevices(container: IContainer) {
  return container.devices.filter(
    (device) => device.deviceIdentifier === "navigation",
  );
}

async function loadContainers() {
  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.container.ContainerList();

    if (!response.success) {
      toast.error(
        response.errors[0] ?? "Não foi possível carregar os containers.",
      );
      return;
    }

    containers.value = response.result;
  } catch (cause: any) {
    toast.error(
      cause?.errors?.[0] ?? "Não foi possível carregar os containers.",
    );
  } finally {
    loadingPop();
  }
}

onMounted(loadContainers);

const showRegisterContainer = ref(false);
const registerForm = reactive({
  name: "",
  devices: [{ name: "", role: "owner" as DeviceRole }],
});
const registerError = ref("");

function openRegisterContainer() {
  registerForm.name = "";
  registerForm.devices = [{ name: "", role: "owner" }];
  registerError.value = "";
  showRegisterContainer.value = true;
}

function addDeviceRow() {
  registerForm.devices.push({ name: "", role: "owner" });
}

function removeDeviceRow(index: number) {
  if (registerForm.devices.length === 1) return;
  registerForm.devices.splice(index, 1);
}

async function submitRegisterContainer() {
  registerError.value = "";

  if (!registerForm.name) {
    registerError.value = "Informe um nome para o container.";
    toast.error(registerError.value);
    return;
  }

  if (registerForm.devices.some((device) => !device.name)) {
    registerError.value = "Informe o nome de todos os dispositivos.";
    toast.error(registerError.value);
    return;
  }

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.container.RegisterContainer({
      name: registerForm.name,
      devices: registerForm.devices.map((device) => ({
        name: device.name,
        role: device.role,
        type: roleToType(device.role),
      })),
    });

    if (!response.success) {
      toast.error(
        response.errors[0] ?? "Não foi possível cadastrar o container.",
      );
      return;
    }

    toast.success("Container cadastrado com sucesso.");
    showRegisterContainer.value = false;
    await loadContainers();
  } catch (cause: any) {
    const message =
      cause?.errors?.[0] ??
      "Não foi possível cadastrar o container. Tente novamente.";
    registerError.value = message;
    toast.error(message);
  } finally {
    loadingPop();
  }
}

const showAddDevice = ref(false);
const addDeviceTarget = ref<IContainer | null>(null);
const addDeviceForm = reactive({ name: "", role: "owner" as DeviceRole });
const addDeviceError = ref("");

function openAddDevice(container: IContainer) {
  addDeviceTarget.value = container;
  addDeviceForm.name = "";
  addDeviceForm.role = "owner";
  addDeviceError.value = "";
  showAddDevice.value = true;
}

async function submitAddDevice() {
  addDeviceError.value = "";

  if (!addDeviceTarget.value) return;

  if (!addDeviceForm.name) {
    addDeviceError.value = "Informe o nome do dispositivo.";
    toast.error(addDeviceError.value);
    return;
  }

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.device.RegisterDevice({
      containerIdVinculated: addDeviceTarget.value.id,
      name: addDeviceForm.name,
      role: addDeviceForm.role,
      type: roleToType(addDeviceForm.role),
    });

    if (!response.success) {
      toast.error(
        response.errors[0] ?? "Não foi possível cadastrar o dispositivo.",
      );
      return;
    }

    toast.success("Dispositivo cadastrado com sucesso.");
    showAddDevice.value = false;
    await loadContainers();
  } catch (cause: any) {
    const message =
      cause?.errors?.[0] ??
      "Não foi possível cadastrar o dispositivo. Tente novamente.";
    addDeviceError.value = message;
    toast.error(message);
  } finally {
    loadingPop();
  }
}

const showEditContainer = ref(false);
const editContainerTarget = ref<IContainer | null>(null);
const editContainerForm = reactive({ name: "", isActive: true });
const editContainerError = ref("");

function openEditContainer(container: IContainer) {
  editContainerTarget.value = container;
  editContainerForm.name = container.name;
  editContainerForm.isActive = container.isActive;
  editContainerError.value = "";
  showEditContainer.value = true;
}

async function submitEditContainer() {
  editContainerError.value = "";

  if (!editContainerTarget.value) return;

  if (!editContainerForm.name) {
    editContainerError.value = "Informe um nome para o container.";
    toast.error(editContainerError.value);
    return;
  }

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.container.UpdateContainer({
      id: editContainerTarget.value.id,
      name: editContainerForm.name,
      isActive: editContainerForm.isActive,
    });

    if (!response.success) {
      toast.error(
        response.errors[0] ?? "Não foi possível atualizar o container.",
      );
      return;
    }

    toast.success("Container atualizado com sucesso.");
    showEditContainer.value = false;
    await loadContainers();
  } catch (cause: any) {
    const message =
      cause?.errors?.[0] ??
      "Não foi possível atualizar o container. Tente novamente.";
    editContainerError.value = message;
    toast.error(message);
  } finally {
    loadingPop();
  }
}

const showEditDevice = ref(false);
const editDeviceTarget = ref<IDevice | null>(null);
const editDeviceForm = reactive({ name: "", role: "owner" as DeviceRole });
const editDeviceError = ref("");

const showDeleteDevice = ref(false);
const deleteDeviceTarget = ref<IDevice | null>(null);
const deleteDeviceError = ref("");

function openEditDevice(device: IDevice) {
  editDeviceTarget.value = device;
  editDeviceForm.name = device.name;
  editDeviceForm.role = device.deviceIdentifier;
  editDeviceError.value = "";
  showEditDevice.value = true;
}

function openDeleteDevice(device: IDevice) {
  deleteDeviceTarget.value = device;
  deleteDeviceError.value = "";
  showDeleteDevice.value = true;
}

async function submitEditDevice() {
  editDeviceError.value = "";

  if (!editDeviceTarget.value) return;

  if (!editDeviceForm.name) {
    editDeviceError.value = "Informe o nome do dispositivo.";
    toast.error(editDeviceError.value);
    return;
  }

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.device.UpdateDevice({
      id: editDeviceTarget.value.id,
      name: editDeviceForm.name,
      role: editDeviceForm.role,
      type: roleToType(editDeviceForm.role),
    });

    if (!response.success) {
      toast.error(
        response.errors[0] ?? "Não foi possível atualizar o dispositivo.",
      );
      return;
    }

    toast.success("Dispositivo atualizado com sucesso.");
    showEditDevice.value = false;
    await loadContainers();
  } catch (cause: any) {
    const message =
      cause?.errors?.[0] ??
      "Não foi possível atualizar o dispositivo. Tente novamente.";
    editDeviceError.value = message;
    toast.error(message);
  } finally {
    loadingPop();
  }
}

async function deleteDevice() {
  deleteDeviceError.value = "";

  if (!deleteDeviceTarget.value) return;

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.device.DeleteDevice(
      deleteDeviceTarget.value.id,
    );

    if (!response.success) {
      toast.error(
        response.errors[0] ?? "Não foi possível remover o dispositivo.",
      );
      return;
    }

    toast.success("Dispositivo removido com sucesso.");
    showDeleteDevice.value = false;
    await loadContainers();
  } catch (cause: any) {
    const message =
      cause?.errors?.[0] ??
      "Não foi possível remover o dispositivo. Tente novamente.";
    deleteDeviceError.value = message;
    toast.error(message);
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
  background: #eaf7ef;
  border-radius: 50%;
  font-size: 22px;
}

.container-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.container-card {
  padding: 19px;
}

.container-card-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;

  h2 {
    font: 600 15px "Space Grotesk";
    margin: 0 0 4px;
  }

  p {
    margin: 0;
    color: var(--muted);
    font-size: 11px;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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

  &.danger:hover {
    background: #fdf1ef;
    color: #c65b4d;
    border-color: #f2d5d0;
  }
}

.device-empty {
  color: var(--muted);
  font-size: 11px;
  padding: 14px 0;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.device-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f3f0;

  &:last-child {
    border-bottom: 0;
  }
}

.device-icon {
  width: 29px;
  height: 29px;
  flex: 0 0 29px;
  display: grid;
  place-items: center;
  background: #f2f6f3;
  color: #5e6c64;
  border-radius: 8px;
}

.device-info {
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 12px;
  }
}

.device-status {
  display: flex;
  align-items: center;
  color: #43a975;
  font-size: 10px;
  margin-top: 3px;

  i {
    width: 5px;
    height: 5px;
    display: inline-block;
    background: #47b87a;
    border-radius: 50%;
    margin-right: 4px;
  }

  &.offline {
    color: #c07a4e;

    i {
      background: #df8a69;
    }
  }
}

.role-badge {
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;

  &.owner {
    color: #22714e;
    background: #e4f3e9;
  }

  &.navigation {
    color: #5892ac;
    background: #e4f3f8;
  }
}

.device-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
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

  > label {
    display: block;
    color: #506057;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 16px;
  }
}

.checkbox-field {
  display: flex !important;
  align-items: center;
  gap: 8px;
}

.field-label {
  color: #506057;
  font-size: 11px;
  font-weight: 600;
  margin: 0 0 8px;
}

.device-fields {
  margin-bottom: 16px;
}

.device-field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  :deep(.p-inputtext) {
    flex: 1;
    min-width: 0;
  }
}

.role-dropdown {
  width: 140px;
  flex: 0 0 140px;
}

.remove-device-button {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  display: grid;
  place-items: center;
  background: #fdf1ef;
  color: #c65b4d;
  border: 0;
  border-radius: 5px;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.add-device-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: var(--green);
  border: 1px dashed #b9dcc5;
  border-radius: 5px;
  padding: 9px 12px;
  font-size: 11px;
  font-weight: 600;
  width: 100%;
  justify-content: center;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

.form-error {
  color: #c65b4d;
  font-size: 11px;
  margin: -6px 0 14px;
}

.delete-confirm-text {
  color: #506057;
  font-size: 12px;
  line-height: 1.6;
  margin: 0 0 20px;

  strong {
    color: var(--ink);
  }
}
</style>
