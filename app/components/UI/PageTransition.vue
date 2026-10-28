<template>
  <div v-if="active" class="pt" aria-hidden="true">
    <div class="pt-sweep dark"></div>
    <div class="pt-sweep light"></div>
    <div class="pt-content">
      <div class="pt-mark"><span></span><span></span><span></span></div>
      <div class="pt-route">
        <svg viewBox="0 0 240 40" width="240" height="40" fill="none">
          <path d="M6 30 C 50 30, 60 8, 100 8 S 160 32, 200 20 S 226 10, 234 10" pathLength="1" />
        </svg>
        <i class="pt-start"></i>
        <i class="pt-dot"></i>
        <i class="pt-end"></i>
      </div>
      <p>route<b>X</b>flow</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import usePageTransition from "~/composable/usePageTransition";

const { active } = usePageTransition();
</script>

<style lang="scss" scoped>
// Linha do tempo (1.2s): 0–40% faixas cobrem a tela · 30–56% marca + rota desenham ·
// 40–60% tela coberta (a página troca aqui) · 60–100% faixas saem revelando a nova página.
$route: "M6 30 C 50 30, 60 8, 100 8 S 160 32, 200 20 S 226 10, 234 10";

.pt {
  position: fixed;
  inset: 0;
  z-index: 9600;
  overflow: hidden;
  pointer-events: all;
}

.pt-sweep {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -30vw;
  width: 160vw;
  animation: pt-sweep 1.2s both;

  &.dark {
    background: var(--dark-green);
  }
  &.light {
    background: linear-gradient(120deg, var(--green), #37a36e);
    animation-delay: 0.09s;
    animation-duration: 1.11s;
  }
}

@keyframes pt-sweep {
  0% {
    transform: translateX(-125%) skewX(-18deg);
    animation-timing-function: cubic-bezier(0.7, 0, 0.25, 1);
  }
  40% {
    transform: translateX(0) skewX(-18deg);
  }
  60% {
    transform: translateX(0) skewX(-18deg);
    animation-timing-function: cubic-bezier(0.7, 0, 0.25, 1);
  }
  100% {
    transform: translateX(125%) skewX(-18deg);
  }
}

.pt-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;
  color: #fff;
  animation: pt-content 1.2s both;

  p {
    margin: 0;
    font: 700 28px "Space Grotesk", sans-serif;
    letter-spacing: -1px;
    b {
      color: #0f3d29;
    }
  }
}

@keyframes pt-content {
  0%,
  28% {
    opacity: 0;
    transform: translateY(8px);
  }
  42%,
  56% {
    opacity: 1;
    transform: translateY(0);
  }
  68%,
  100% {
    opacity: 0;
    transform: translateY(-8px);
  }
}

// Mesma marca do logo (três barras inclinadas), crescendo em sequência.
.pt-mark {
  width: 48px;
  height: 44px;
  display: flex;
  align-items: end;
  gap: 5px;
  transform: skew(-23deg);

  span {
    width: 11px;
    border-radius: 3px;
    background: #fff;
    transform-origin: bottom;
    animation: pt-bar 1.2s both;
  }
  span:nth-child(1) {
    height: 22px;
    opacity: 0.6;
  }
  span:nth-child(2) {
    height: 33px;
    opacity: 0.82;
    animation-delay: 0.04s;
  }
  span:nth-child(3) {
    height: 44px;
    animation-delay: 0.08s;
  }
}

@keyframes pt-bar {
  0%,
  26% {
    transform: scaleY(0);
  }
  40%,
  100% {
    transform: scaleY(1);
  }
}

// Rota que se desenha com um ponto percorrendo o trajeto, do início ao destino.
.pt-route {
  position: relative;
  width: 240px;
  height: 40px;

  svg {
    position: absolute;
    inset: 0;
  }
  path {
    stroke: rgba(255, 255, 255, 0.85);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-dasharray: 1;
    animation: pt-draw 1.2s both;
  }
  i {
    position: absolute;
    left: 0;
    top: 0;
    width: 12px;
    height: 12px;
    margin: -6px 0 0 -6px;
    border-radius: 50%;
  }
  .pt-start {
    left: 6px;
    top: 30px;
    background: #fff;
  }
  .pt-end {
    left: 234px;
    top: 10px;
    background: #0f3d29;
    border: 2px solid #fff;
    animation: pt-pop 1.2s both;
  }
  .pt-dot {
    background: #fff;
    box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.28);
    offset-path: path($route);
    offset-rotate: 0deg;
    animation: pt-travel 1.2s both;
  }
}

@keyframes pt-draw {
  0%,
  30% {
    stroke-dashoffset: 1;
  }
  53%,
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes pt-travel {
  0%,
  30% {
    offset-distance: 0%;
    opacity: 1;
  }
  53% {
    offset-distance: 100%;
    opacity: 1;
  }
  54%,
  100% {
    offset-distance: 100%;
    opacity: 0;
  }
}

@keyframes pt-pop {
  0%,
  52% {
    transform: scale(0);
  }
  58% {
    transform: scale(1.5);
  }
  64%,
  100% {
    transform: scale(1);
  }
}
</style>
