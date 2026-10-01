<template>
  <button
    class="menu-toggle"
    :aria-label="isOpen ? 'Fechar menu' : 'Abrir menu'"
    :aria-expanded="isOpen"
    @click="isOpen = !isOpen"
  >
    <component class="menu-toggle-icon" :is="isOpen ? X : Menu" />
  </button>
  <Transition name="sidebar-fade">
    <div v-if="isOpen" class="sidebar-backdrop" @click="isOpen = false"></div>
  </Transition>
  <aside class="sidebar" :class="{ open: isOpen }">
    <div class="brand">
      <div class="brand-mark"><span></span><span></span><span></span></div>
      <span>route<span class="brand-accent">X</span>flow</span>
    </div>
    <div class="profile-card">
      <div class="avatar">{{ userInitials }}</div>
      <div>
        <strong>{{ userName }}</strong
        ><span>Administrador · Mauá, SP</span>
      </div>
      <button
        class="more-button"
        aria-label="Mais opções"
        aria-haspopup="menu"
        :aria-expanded="isMenuOpen"
        @click.stop="isMenuOpen = !isMenuOpen"
      >
        •••
      </button>
      <Transition name="menu-pop">
        <div v-if="isMenuOpen" class="profile-menu" role="menu" @click.stop>
          <div class="profile-menu-header">
            <strong>{{ userName }}</strong>
            <span v-if="user?.email">{{ user.email }}</span>
            <span v-if="user?.phoneNumber">{{ user.phoneNumber }}</span>
          </div>
          <NuxtLink to="/settings" class="profile-menu-item" role="menuitem">
            <component class="profile-menu-icon" :is="User" />
            <span>Meu perfil</span>
          </NuxtLink>
          <NuxtLink to="/settings" class="profile-menu-item" role="menuitem">
            <component class="profile-menu-icon" :is="Settings" />
            <span>Configurações</span>
          </NuxtLink>
          <button class="profile-menu-item" role="menuitem" @click="toggleTheme">
            <component class="profile-menu-icon" :is="theme === 'dark' ? Sun : Moon" />
            <span>{{ theme === "dark" ? "Tema claro" : "Tema escuro" }}</span>
          </button>
          <button class="profile-menu-item danger" role="menuitem" @click="logout">
            <component class="profile-menu-icon" :is="LogOut" />
            <span>Sair</span>
          </button>
        </div>
      </Transition>
    </div>
    <nav class="main-nav" aria-label="Navegação principal">
      <p class="nav-label">OPERAÇÃO</p>
      <NuxtLink
        v-for="item in navigation"
        :key="item.label"
        :to="item.to"
        class="nav-item"
        :class="{ active: route.path === item.to }"
      >
        <span class="nav-icon"
          ><component class="nav-icon-component" :is="item.icon"
        /></span>
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </NuxtLink>
      <p class="nav-label nav-label-spaced">CONTA</p>
      <NuxtLink
        to="/settings"
        class="nav-item"
        :class="{ active: route.path === '/settings' }"
      >
        <span class="nav-icon"
          ><component class="nav-icon-component" :is="Settings"
        /></span>
        <span>Configurações</span>
      </NuxtLink>
    </nav>
    <div class="sidebar-bottom">
      <div class="support-box">
      </div>
      <button class="logout" @click="logout">
        <span class="nav-icon"
          ><component class="nav-icon-component" :is="LogOut"
        /></span>
        <span>Sair da conta</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  RefreshCw,
  Car,
  Route,
  Wallet,
  LogOut,
  Settings,
  CircleQuestionMark,
  Menu,
  X,
  User,
  Sun,
  Moon,
} from "@lucide/vue";
import { logout as logoutUser } from "~/composable/useAuth";
import { useTheme } from "~/composable/useTheme";
import type { IUserProfile } from "~/infra/interfaces/services/user";

const route = useRoute();
const isOpen = ref(false);

const user = useState<IUserProfile | null>("auth-user", () => null);
const userName = computed(() => user.value?.name || "Minha conta");
const userInitials = computed(() => {
  const initials = (user.value?.name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "RX";
});

const isMenuOpen = ref(false);
const { theme, setTheme } = useTheme();

function toggleTheme() {
  setTheme(theme.value === "dark" ? "light" : "dark");
  isMenuOpen.value = false;
}

watch(
  () => route.path,
  () => {
    isOpen.value = false;
    isMenuOpen.value = false;
  },
);

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    isOpen.value = false;
    isMenuOpen.value = false;
  }
}
function closeMenu() {
  isMenuOpen.value = false;
}
onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("click", closeMenu);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("click", closeMenu);
});
const navigation = [
  { label: "Visão geral", icon: LayoutDashboard, to: "/" },
  { label: "Sincronizar", icon: RefreshCw, badge: "2", to: "/sync" },
  { label: "Corridas", icon: Car, to: "/rides" },
  { label: "Rotas", icon: Route, to: "/routes" },
  { label: "Financeiro", icon: Wallet, to: "/finance" },
];

async function logout() {
  await logoutUser();
  await navigateTo("/login");
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 248px;
  flex: 0 0 248px;
  position: sticky;
  top: 0;
  height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  background: var(--sidebar);
  border-right: 1px solid var(--bd-e8ede9);
  padding: 28px 16px 20px;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 13px 35px;
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

.profile-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 11px;
  background: var(--bg-ffffff);
  border: 1px solid var(--bd-e9eeea);
  border-radius: 8px;
  margin-bottom: 30px;

  strong,
  span {
    display: block;
  }

  strong {
    font-size: 12px;
  }

  span {
    color: var(--muted);
    font-size: 10px;
    margin-top: 3px;
  }
}

.avatar {
  width: 45px;
  height: 35px;
  background: var(--bg-dbeee3);
  color: var(--fg-2e795a);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 700;
}

.more-button {
  margin-left: auto;
  background: transparent;
  color: var(--fg-a4aea8);
  letter-spacing: 1px;
  border: 0;
  cursor: pointer;
  border-radius: 6px;
  padding: 4px 6px;

  &:hover {
    background: var(--bg-edf3ef);
    color: var(--fg-1f4a38);
  }
}

.profile-card {
  position: relative;
}

.profile-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 10;
  background: var(--bg-ffffff);
  border: 1px solid var(--bd-e9eeea);
  border-radius: 8px;
  box-shadow: 0 8px 24px #17201d1f;
  padding: 6px;
}

.profile-menu-header {
  padding: 8px 10px 10px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--bd-e9eeea);

  strong {
    font-size: 12px;
  }

  span {
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.profile-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  background: transparent;
  border: 0;
  border-radius: 6px;
  color: var(--fg-727e77);
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  span {
    margin: 0;
    color: inherit;
    font-size: 12px;
  }

  &:hover {
    background: var(--bg-edf3ef);
    color: var(--fg-1f4a38);
  }

  &.danger:hover {
    color: #c0392b;
  }
}

.profile-menu-icon {
  width: 16px;
  height: 16px;
  flex: none;
}

.menu-pop-enter-active,
.menu-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.nav-label {
  color: var(--fg-a1aba5);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.3px;
  padding: 0 13px;
  margin: 0 0 9px;
}

.nav-label-spaced {
  margin-top: 29px;
}

.nav-item {
  width: 100%;
  display: flex;
  gap: 13px;
  align-items: center;
  padding: 11px 13px;
  color: var(--fg-727e77);
  background: transparent;
  border: 0;
  border-radius: 6px;
  text-align: left;
  font-size: 13px;
  margin-bottom: 3px;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: var(--bg-edf3ef);
    color: var(--fg-1f4a38);
    transform: translateX(2px);
  }
}

.nav-item.active {
  color: var(--fg-22714e);
  background: var(--bg-e4f3e9);
  font-weight: 600;
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 10px;

  .nav-icon-component {
    width: 20px;
    height: 20px;
  }
}

.nav-badge {
  margin-left: auto;
  background: var(--bg-d2eddd);
  color: var(--fg-26845b);
  border-radius: 10px;
  padding: 2px 7px;
  font-size: 10px;
}

.sidebar-bottom {
  margin-top: auto;
}

.support-box {
  border-top: 1px solid var(--bd-e3e9e4);
  margin-bottom: 15px;
}

.logout {
  display: flex;
  align-items: center;
  flex-direction: row;
  color: var(--fg-87918b);
  background: transparent;
  border: 0;
  padding: 10px 10px 0;
  font-size: 12px;
  border-radius: 6px;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: var(--bg-edf3ef);
    color: var(--fg-1f4a38);
  }

  span {
    font-size: 14px;
    margin-right: 9px;
  }
}

@media (max-width: 1050px) {
  .sidebar {
    width: 210px;
    flex-basis: 210px;
  }
}
.menu-toggle,
.sidebar-backdrop {
  display: none;
}

@media (max-width: 680px) {
  .menu-toggle {
    position: fixed;
    top: 14px;
    left: 15px;
    z-index: 60;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    background: var(--bg-ffffff);
    color: var(--ink);
    border: 1px solid var(--line);
    border-radius: 8px;
    box-shadow: 0 2px 8px #18302212;
  }

  .menu-toggle-icon {
    width: 20px;
    height: 20px;
  }

  .sidebar-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(23, 32, 29, 0.45);
    z-index: 70;
  }

  .sidebar-fade-enter-active,
  .sidebar-fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .sidebar-fade-enter-from,
  .sidebar-fade-leave-to {
    opacity: 0;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: min(290px, 85vw);
    flex-basis: auto;
    height: 100dvh;
    max-height: 100dvh;
    z-index: 80;
    padding: 24px 16px 20px;
    transform: translateX(-100%);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: 8px 0 30px #17201d30;
  }

  .nav-item {
    padding: 13px;
  }
}
</style>
