<template>
    <Transition name="loading-fade">
        <div class="loading-screen" role="status" aria-live="polite">
            <div class="loading-content">
                <div class="brand-lockup">
                    <div class="brand-mark" aria-hidden="true">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <span>route<span class="brand-accent">X</span>flow</span>
                </div>

                <div class="route-visual" aria-hidden="true">
                    <svg class="route-svg" viewBox="0 0 270 135" preserveAspectRatio="none">
                        <path
                            class="route-path"
                            d="M42,112 L42,76 L158,76 L158,24 L238,24"
                            pathLength="1"
                            fill="none"
                        />
                    </svg>

                    <span class="route-pin route-pin-origin"></span>
                    <span class="route-pin route-pin-dest"></span>

                    <div class="route-vehicle">
                        <span class="route-vehicle-wheel"></span>
                        <span class="route-vehicle-wheel"></span>
                    </div>
                </div>

                <div class="loading-copy">
                    <span class="loading-label">CENTRAL DE OPERACOES</span>
                    <p class="loading-text">{{ displayedText }}</p>
                    <div class="progress-bar" role="progressbar" aria-label="Carregando">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from "vue";

const loadingMessages = [
    "Organizando o fluxo de entregas",
    "Sincronizando suas corridas",
    "Carregando dados do painel",
    "Otimizando rotas e corridas",
];

const displayedText = ref("");
let typingInterval: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
    let index = 0;
    const message = loadingMessages[Math.floor(Math.random() * loadingMessages.length)] ?? "Carregando dados do painel";

    typingInterval = setInterval(() => {
        displayedText.value += message[index] ?? "";
        index++;

        if (index >= message.length && typingInterval) {
            clearInterval(typingInterval);
        }
    }, 45);
});

onUnmounted(() => {
    if (typingInterval) clearInterval(typingInterval);
});
</script>

<style scoped lang="scss">
.loading-fade-enter-active,
.loading-fade-leave-active {
    transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
    opacity: 0;
}

.loading-screen {
    position: fixed;
    inset: 0;
    z-index: 9000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: var(--ink);
    background: rgba(246, 248, 246, 0.97);
    backdrop-filter: blur(10px);

    &::before,
    &::after {
        content: "";
        position: absolute;
        width: 360px;
        height: 360px;
        border: 1px solid rgba(44, 154, 107, 0.12);
        border-radius: 50%;
    }

    &::before { transform: translate(-48vw, -36vh); }
    &::after { transform: translate(48vw, 38vh); }
}

.loading-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(420px, calc(100vw - 40px));
    animation: content-appear 0.5s ease-out both;
}

.brand-lockup {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--ink);
    font: 700 25px "Space Grotesk", sans-serif;
    letter-spacing: -1px;
}

.brand-accent { color: var(--green); }

.brand-mark {
    display: flex;
    align-items: end;
    gap: 3px;
    width: 30px;
    height: 26px;
    transform: skew(-23deg);

    span {
        display: block;
        width: 6px;
        border-radius: 2px 2px 0 0;
        background: var(--green);
        animation: mark-pulse 1.8s ease-in-out infinite;

        &:nth-child(1) { height: 12px; animation-delay: 0.1s; }
        &:nth-child(2) { height: 20px; animation-delay: 0.2s; }
        &:nth-child(3) { height: 16px; animation-delay: 0.3s; }
    }
}

/* ---------- Rota central (refeita) ---------- */

.route-visual {
    position: relative;
    flex: 0 0 135px;
    margin-top: 28px;
    width: 270px;
    height: 135px;
    animation: route-appear 0.8s 0.15s ease-out both;
}

.route-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.route-path {
    stroke: var(--green);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    opacity: 0;
    animation: draw-route 3.2s ease-in-out infinite;
}

.route-pin {
    position: absolute;
}

.route-pin-origin {
    top: 105px;
    left: 35px;
    width: 14px;
    height: 14px;
    border: 3px solid var(--green);
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 0 5px rgba(44, 154, 107, 0.1);
}

.route-pin-dest {
    top: 17px;
    left: 231px;
    width: 14px;
    height: 14px;
    border-radius: 50% 50% 50% 0;
    background: #df8a69;
    transform: rotate(-45deg);
    box-shadow: 0 0 0 0 rgba(223, 138, 105, 0.35);
    animation: pin-arrive 3.2s ease-in-out infinite;

    &::after {
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #fff;
    }
}

.route-vehicle {
    position: absolute;
    top: 0;
    left: 0;
    width: 31px;
    height: 17px;
    opacity: 0;
    offset-path: path("M42,112 L42,76 L158,76 L158,24 L238,24");
    offset-rotate: auto;
    offset-anchor: 50% 50%;
    animation: vehicle-move 3.2s ease-in-out infinite;

    &::before {
        content: "";
        position: absolute;
        top: 2px;
        left: 6px;
        width: 15px;
        height: 7px;
        border: 2px solid var(--green);
        border-bottom: 0;
        border-radius: 4px 6px 0 0;
        background: #dbeee3;
    }

    &::after {
        content: "";
        position: absolute;
        inset: 3px 0 0;
        border: 2px solid var(--green);
        border-radius: 3px 5px 3px 3px;
        background: #fff;
    }
}

.route-vehicle-wheel {
    position: absolute;
    bottom: -4px;
    z-index: 1;
    width: 8px;
    height: 8px;
    border: 2px solid var(--ink);
    border-radius: 50%;
    background: #fff;

    &:first-child { left: 4px; }
    &:last-child { right: 4px; }
}

/* ---------- Rodape ---------- */

.loading-copy {
    width: 100%;
    margin-top: 22px;
    text-align: center;
}

.loading-label {
    color: #8a9890;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.6px;
}

.loading-text {
    min-height: 22px;
    margin: 9px 0 20px;
    color: white;
    font-size: 15px;
    font-weight: bold;
}

.progress-bar {
    position: relative;
    width: min(500px, 100%);
    height: 7px;
    overflow: hidden;
    border: 1px solid #d6e5db;
    border-radius: 4px;
    background: #edf4ef;
    box-shadow: inset 0 1px 2px rgba(23, 32, 29, 0.06);
}

.progress-fill {
    position: absolute;
    top: 1px;
    bottom: 1px;
    left: 0;
    width: 34%;
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, #2c9a6b 0%, #65c08d 50%, #2c9a6b 100%);
    box-shadow: 0 0 9px rgba(44, 154, 107, 0.28);
    animation: progress-slide 1.8s ease-in-out infinite;

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        width: 28px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
        animation: progress-shine 1.8s ease-in-out infinite;
    }
}

@keyframes content-appear {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes mark-pulse {
    0%, 100% { opacity: 0.55; transform: scaleY(0.85); }
    50% { opacity: 1; transform: scaleY(1); }
}

@keyframes route-appear {
    from { opacity: 0; transform: scale(0.94); }
    to { opacity: 1; transform: scale(1); }
}

@keyframes draw-route {
    0% { stroke-dashoffset: 1; opacity: 0; }
    8% { opacity: 1; }
    55% { stroke-dashoffset: 0; opacity: 1; }
    85% { stroke-dashoffset: 0; opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 0; }
}

@keyframes vehicle-move {
    0% { offset-distance: 0%; opacity: 0; }
    8% { opacity: 1; }
    55% { offset-distance: 100%; opacity: 1; }
    85% { offset-distance: 100%; opacity: 1; }
    100% { offset-distance: 100%; opacity: 0; }
}

@keyframes pin-arrive {
    0%, 50% { box-shadow: 0 0 0 0 rgba(223, 138, 105, 0.35); }
    58% { box-shadow: 0 0 0 6px rgba(223, 138, 105, 0); }
    75%, 100% { box-shadow: 0 0 0 0 rgba(223, 138, 105, 0); }
}

@keyframes progress-slide {
    0% { transform: translateX(-130%); }
    55% { transform: translateX(160%); }
    100% { transform: translateX(320%); }
}

@keyframes progress-shine {
    0%, 45% { transform: translateX(-40px); opacity: 0; }
    60% { opacity: 1; }
    80%, 100% { transform: translateX(90px); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
    }
}
</style>