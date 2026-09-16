<template>
  <AppToast />
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
import LoadingScreen from './components/UI/LoadingScreen.vue';
import useLoading from "~/composable/useLoading";

const { isLoading } = useLoading();
</script>

<style lang="scss" scoped>
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
  z-index: 9999;
}
</style>
