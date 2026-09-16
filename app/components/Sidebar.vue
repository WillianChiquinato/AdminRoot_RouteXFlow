<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark"><span></span><span></span><span></span></div>
      <span>route<span class="brand-accent">X</span>flow</span>
    </div>
    <div class="profile-card">
      <div class="avatar">WSC</div>
      <div>
        <strong>Willian de Sena Chiquinato</strong
        ><span>Administrador · Mauá, SP</span>
      </div>
      <button class="more-button" aria-label="Mais opções">•••</button>
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
      <button class="nav-item">
        <span class="nav-icon"
          ><component class="nav-icon-component" :is="Settings"
        /></span>
        <span>Configurações</span>
      </button>
    </nav>
    <div class="sidebar-bottom">
      <div class="support-box">
        <component class="nav-icon-component" :is="CircleQuestionMark" />
        <div>
          <strong>Precisa de ajuda?</strong><span>Fale com o suporte</span>
        </div>
        <span class="arrow">→</span>
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
} from "@lucide/vue";
import { logout as logoutUser } from "~/composable/useAuth";

const route = useRoute();
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
  border-right: 1px solid #e8ede9;
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
  background: #fff;
  border: 1px solid #e9eeea;
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
  background: #dbeee3;
  color: #2e795a;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 10px;
  font-weight: 700;
}

.more-button {
  margin-left: auto;
  background: transparent;
  color: #a4aea8;
  letter-spacing: 1px;
  border: 0;
}

.nav-label {
  color: #a1aba5;
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
  color: #727e77;
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
    background: #edf3ef;
    color: #1f4a38;
    transform: translateX(2px);
  }
}

.nav-item.active {
  color: #22714e;
  background: #e4f3e9;
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
  background: #d2eddd;
  color: #26845b;
  border-radius: 10px;
  padding: 2px 7px;
  font-size: 10px;
}

.sidebar-bottom {
  margin-top: auto;
}

.support-box {
  display: flex;
  gap: 9px;
  align-items: center;
  border-top: 1px solid #e3e9e4;
  padding: 22px 5px 18px;
  border-radius: 8px;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  strong,
  span {
    display: block;
    font-size: 11px;
  }

  div span {
    color: var(--muted);
    margin-top: 3px;
    font-size: 10px;
  }

  &:hover {
    background: #edf3ef;
    color: #1f4a38;
  }

  .arrow {
    margin-left: auto;
    font-size: 15px;
    color: #a4ada7;
  }
}

.logout {
  display: flex;
  align-items: center;
  flex-direction: row;
  color: #87918b;
  background: transparent;
  border: 0;
  padding: 10px 10px 0;
  font-size: 12px;
  border-radius: 6px;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: #edf3ef;
    color: #1f4a38;
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
@media (max-width: 680px) {
  .sidebar {
    width: 64px;
    flex-basis: 64px;
    padding: 20px 8px;
  }

  .brand {
    padding: 0 10px 30px;
  }

  .brand > span,
  .profile-card > div:not(.avatar),
  .more-button,
  .nav-label,
  .nav-item > span:not(.nav-icon),
  .nav-badge,
  .support-box,
  .logout {
    display: none;
  }
  .profile-card {
    padding: 7px;
    border: 0;
    background: transparent;
    margin-bottom: 24px;
  }
  .nav-item {
    justify-content: center;
    padding: 12px 0;
  }
  .nav-icon {
    font-size: 20px;
  }
}
</style>
