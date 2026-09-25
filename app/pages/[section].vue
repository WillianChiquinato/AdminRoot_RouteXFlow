<script setup lang="ts">
const route = useRoute();
const sections: Record<string, { title: string; description: string }> = {
  sync: {
    title: "Sincronizar aplicativos",
    description:
      "Conecte o 99Food e o iFood para combinar suas próximas corridas.",
  },
  routes: {
    title: "Rotas",
    description: "Visualize e organize os melhores caminhos para o seu dia.",
  },
};
const section = computed(
  () =>
    sections[String(route.params.section)] ?? {
      title: "Página em construção",
      description: "Esta área estará disponível em breve.",
    },
);

</script>

<template>
  <div class="app-shell">
    <Sidebar />
    <main class="content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Painel</span><b>/</b><strong>{{ section.title }}</strong>
        </div>
        <div class="top-actions">
          <div class="live-status">
            <span class="status-dot"></span>Sistema online
          </div>
          <button class="mini-avatar">WM</button>
        </div>
      </header>
      <section class="page-heading">
        <div>
          <p class="eyebrow">ROUTEXFLOW</p>
          <h1>{{ section.title }}</h1>
          <p class="heading-copy">{{ section.description }}</p>
        </div>
      </section>
      <section class="empty-state panel">
        <span class="empty-icon">✦</span>
        <h2>Estamos preparando esta área</h2>
        <p>
          O painel inicial já está pronto. Esta funcionalidade será conectada
          aos seus aplicativos na próxima etapa.
        </p>
        <NuxtLink class="primary-button" to="/"
          >Voltar para a visão geral</NuxtLink
        >
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  min-height: 330px;
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
</style>
