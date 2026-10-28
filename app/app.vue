<template>
  <AppToast />
  <PageTransition />
  <div v-if="route.path !== '/institucional'" class="env-banner">
    ⚠️ Ambiente de homologação — sistema em desenvolvimento. Os dados podem ser alterados ou apagados a qualquer momento.
  </div>
  <div>
    <LoadingScreen v-if="isLoading" class="loading-overlay" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useHead, useNuxtApp } from '#app';
import { computed } from 'vue';

import AppToast from './components/Toast/Toast.vue';
import PageTransition from './components/UI/PageTransition.vue';
import LoadingScreen from './components/UI/LoadingScreen.vue';
import useLoading from "~/composable/useLoading";

const { isLoading } = useLoading();
const route = useRoute();
</script>

<style lang="scss" scoped>
.env-banner {
  position: sticky;
  top: 0;
  z-index: 9000;
  padding: 6px 12px;
  background-color: #f59e0b;
  color: #1a1203;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(26, 18, 3, 0.8);
  backdrop-filter: blur(13px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9001;
}
</style>
