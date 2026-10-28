<template>
  <div class="site">
    <header class="nav">
      <div class="wrap nav-inner">
        <a href="#topo" class="brand">
          <div class="brand-mark"><span></span><span></span><span></span></div>
          <span>route<span class="brand-accent">X</span>flow</span>
          <span class="by-vn">
            <img
              v-if="vnLogoOk"
              src="/vn-logo.png"
              alt=""
              @error="vnLogoOk = false"
            />
            <small>by VN Transporte</small>
          </span>
        </a>
        <nav class="nav-links">
          <a href="#problema">Por que</a>
          <a href="#recursos">Recursos</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#auditoria">Auditoria</a>
          <a href="#faq">Dúvidas</a>
        </nav>
        <div class="nav-cta">
          <a href="/login" class="btn ghost" @click.prevent="go('/login')">Entrar</a>
          <a href="/login?tab=register" class="btn solid" @click.prevent="go('/login?tab=register')">Criar conta</a>
        </div>
      </div>
    </header>

    <main id="topo">
      <!-- HERO -->
      <section class="hero">
        <div class="wrap hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">PARA ENTREGADORES DE MERCADO LIVRE E SHOPEE</p>
            <h1>Todas as suas entregas.<br /><em>Em um só lugar.</em></h1>
            <p class="lead">
              Chega de alternar entre app de rota, app oficial para dar baixa e
              outro para conferir o financeiro. O RouteXFlow centraliza a
              operação e dá baixa automática nos sistemas do Mercado Livre e da
              Shopee quando você conclui a entrega.
            </p>
            <div class="hero-actions">
              <a href="/login?tab=register" class="btn solid big" @click.prevent="go('/login?tab=register')">Começar agora</a>
              <a href="#como-funciona" class="btn ghost big">Ver como funciona</a>
            </div>
            <ul class="hero-points">
              <li>Baixa automática no Mercado Livre e na Shopee</li>
              <li>Financeiro e rotas no mesmo painel</li>
              <li>Logs e auditoria de cada pacote</li>
            </ul>
          </div>

          <div class="hero-visual" aria-hidden="true">
            <div class="panel">
              <div class="panel-top">
                <span class="dot"></span><span class="dot"></span
                ><span class="dot"></span>
                <small>Painel · Hoje</small>
              </div>
              <div class="panel-stats">
                <div>
                  <small>Entregues</small><strong>42</strong>
                </div>
                <div>
                  <small>Pendentes</small><strong>9</strong>
                </div>
                <div>
                  <small>A receber</small><strong>R$ 386</strong>
                </div>
              </div>
              <ul class="panel-list">
                <li>
                  <span class="chip ml">Mercado Livre</span>
                  <b>Pacote entregue</b>
                  <em class="ok">Baixa enviada</em>
                </li>
                <li>
                  <span class="chip sp">Shopee</span>
                  <b>Pacote entregue</b>
                  <em class="ok">Baixa enviada</em>
                </li>
                <li>
                  <span class="chip ml">Mercado Livre</span>
                  <b>Em rota</b>
                  <em class="run">Parada 4 de 12</em>
                </li>
              </ul>
              <div class="panel-route">
                <span class="pt start"></span><span class="ln"></span
                ><span class="pt"></span><span class="ln"></span
                ><span class="pt end"></span>
                <div>
                  <strong>Centro → Bairro</strong>
                  <small>Rota otimizada · 8,4 km</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PROBLEMA -> SOLUÇÃO -->
      <section id="problema" class="section">
        <div class="wrap">
          <p class="eyebrow center">O PROBLEMA</p>
          <h2 class="center">Sua rotina hoje é um malabarismo de apps</h2>
          <div class="compare">
            <div class="compare-card before">
              <h3>Sem o RouteXFlow</h3>
              <ul>
                <li>Um app para traçar a rota</li>
                <li>O app oficial do Mercado Livre e da Shopee para dar baixa, um por um</li>
                <li>Outro lugar para ver o relatório financeiro</li>
                <li>Pacote sumiu? Sem histórico para provar o que aconteceu</li>
              </ul>
            </div>
            <div class="compare-card after">
              <h3>Com o RouteXFlow</h3>
              <ul>
                <li>Rotas e paradas organizadas no mesmo painel</li>
                <li>Você dá baixa uma vez e o sistema replica no ML e na Shopee</li>
                <li>Financeiro consolidado, sem trocar de tela</li>
                <li>Registro completo de cada pacote para qualquer contestação</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- RECURSOS -->
      <section id="recursos" class="section alt">
        <div class="wrap">
          <p class="eyebrow center">RECURSOS</p>
          <h2 class="center">Tudo o que a operação precisa, centralizado</h2>
          <div class="features">
            <article class="feature">
              <div class="ico"><Route :size="22" :stroke-width="1.8" /></div>
              <h3>Rotas em um só lugar</h3>
              <p>
                Organize as paradas do dia e visualize o melhor caminho em um
                mapa, sem depender de vários aplicativos de rota.
              </p>
            </article>
            <article class="feature">
              <div class="ico">
                <RefreshCw :size="22" :stroke-width="1.8" />
              </div>
              <h3>Baixa automática</h3>
              <p>
                Ao dar baixa no RouteXFlow, a baixa é enviada automaticamente
                aos sistemas do Mercado Livre e da Shopee. Sem abrir o app
                oficial.
              </p>
            </article>
            <article class="feature">
              <div class="ico">
                <Wallet :size="22" :stroke-width="1.8" />
              </div>
              <h3>Relatório financeiro</h3>
              <p>
                Acompanhe seus ganhos por plataforma e por período sem sair do
                painel, com tudo conciliado com as entregas realizadas.
              </p>
            </article>
            <article class="feature">
              <div class="ico">
                <ScrollText :size="22" :stroke-width="1.8" />
              </div>
              <h3>Logs e auditoria</h3>
              <p>
                Cada ação fica registrada. Se um pacote for extraviado ou
                cancelado, você tem o histórico completo para esclarecer.
              </p>
            </article>
            <article class="feature">
              <div class="ico">
                <Plug :size="22" :stroke-width="1.8" />
              </div>
              <h3>Mercado Livre e Shopee</h3>
              <p>
                Conecte suas contas e trabalhe com as duas plataformas de forma
                unificada, no mesmo fluxo.
              </p>
            </article>
            <article class="feature">
              <div class="ico">
                <Users :size="22" :stroke-width="1.8" />
              </div>
              <h3>Subcontas e equipe</h3>
              <p>
                Tem ajudantes ou mais de um motorista? Gerencie subcontas e
                permissões de acesso pelo painel.
              </p>
            </article>
          </div>
        </div>
      </section>

      <!-- COMO FUNCIONA -->
      <section id="como-funciona" class="section">
        <div class="wrap">
          <p class="eyebrow center">COMO FUNCIONA</p>
          <h2 class="center">Do primeiro acesso à baixa, em três passos</h2>
          <ol class="steps">
            <li>
              <span class="num">1</span>
              <h3>Conecte suas contas</h3>
              <p>Autorize o Mercado Livre e a Shopee com poucos cliques.</p>
            </li>
            <li>
              <span class="num">2</span>
              <h3>Faça suas entregas</h3>
              <p>
                Siga a rota e dê baixa nos pacotes direto pelo RouteXFlow.
              </p>
            </li>
            <li>
              <span class="num">3</span>
              <h3>Deixe o resto com a gente</h3>
              <p>
                A baixa é replicada nas plataformas e tudo fica registrado no
                financeiro e na auditoria.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <!-- AUDITORIA -->
      <section id="auditoria" class="section audit">
        <div class="wrap audit-grid">
          <div>
            <p class="eyebrow">SEGURANÇA PARA O SEU TRABALHO</p>
            <h2>Pacote extraviado ou cancelado? Você tem como provar.</h2>
            <p class="lead">
              Disputas sobre entregas acontecem. Com o histórico de cada pacote
              registrado, você sabe quando foi baixado, por quem e em qual
              plataforma, e não fica no prejuízo por falta de prova.
            </p>
          </div>
          <ul class="timeline" aria-hidden="true">
            <li><b>Pacote recebido</b><small>Entrou na sua rota</small></li>
            <li><b>Entrega concluída</b><small>Baixa registrada no RouteXFlow</small></li>
            <li><b>Baixa enviada</b><small>Confirmada na plataforma de origem</small></li>
            <li><b>Histórico guardado</b><small>Disponível na auditoria</small></li>
          </ul>
        </div>
      </section>

      <!-- FAQ -->
      <section id="faq" class="section">
        <div class="wrap narrow">
          <p class="eyebrow center">DÚVIDAS FREQUENTES</p>
          <h2 class="center">Perguntas comuns</h2>
          <div
            v-for="(item, i) in faqs"
            :key="i"
            :class="['faq-item', { open: openFaq === i }]"
          >
            <button
              type="button"
              class="faq-q"
              :aria-expanded="openFaq === i"
              :aria-controls="`faq-a-${i}`"
              @click="openFaq = openFaq === i ? null : i"
            >
              {{ item.q }}
            </button>
            <div :id="`faq-a-${i}`" class="faq-a" role="region">
              <div class="faq-a-inner">
                <p>{{ item.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta">
        <div class="wrap">
          <h2>Menos apps. Mais entregas.</h2>
          <p>Centralize sua operação no RouteXFlow.</p>
          <a href="/login?tab=register" class="btn solid big" @click.prevent="go('/login?tab=register')">Criar minha conta</a>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="wrap footer-inner">
        <div class="brand">
          <div class="brand-mark"><span></span><span></span><span></span></div>
          <span>route<span class="brand-accent">X</span>flow</span>
        </div>
        <p>RouteXFlow · Feito para quem está na rua</p>
        <div class="vn">
          <img
            v-if="vnLogoOk"
            src="/vn-logo.png"
            alt="VN Transporte"
            class="vn-logo"
            @error="vnLogoOk = false"
          />
          <p>
            Um produto <strong>VN Transporte LTDA</strong><br />
            CNPJ 53.378.822/0001-77
          </p>
        </div>
        <p class="legal">
          Mercado Livre e Shopee são marcas de seus respectivos titulares,
          sem vínculo com o RouteXFlow.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import usePageTransition from "~/composable/usePageTransition";
import { Route, RefreshCw, Wallet, ScrollText, Plug, Users } from "@lucide/vue";

definePageMeta({ layout: false });

const { go } = usePageTransition();

// Logo da VN em public/vn-logo.png; se o arquivo não existir, o bloco mostra só o texto.
const vnLogoOk = ref(true);

const openFaq = ref<number | null>(null);
const faqs = [
  {
    q: "Preciso continuar usando o app oficial do ML e da Shopee?",
    a: "Não para dar baixa. Ao concluir a entrega no RouteXFlow, a baixa é enviada automaticamente aos sistemas das plataformas.",
  },
  {
    q: "Quais plataformas são suportadas?",
    a: "Atualmente o Mercado Livre e a Shopee.",
  },
  {
    q: "Como funciona a auditoria?",
    a: "Cada ação relevante sobre um pacote é registrada em log. Em caso de extravio ou cancelamento, você consulta o histórico completo pelo painel.",
  },
  {
    q: "Posso adicionar outras pessoas à minha operação?",
    a: "Sim. É possível criar subcontas e definir o que cada pessoa pode acessar.",
  },
];

useHead({
  title: "RouteXFlow · Entregas do Mercado Livre e Shopee em um só lugar",
  meta: [
    {
      name: "description",
      content:
        "Centralize rotas, baixa automática no Mercado Livre e na Shopee, financeiro e auditoria de pacotes em um único sistema.",
    },
  ],
});
</script>

<style lang="scss" scoped>
.site {
  --soft: var(--bg-eaf7ef);
  color: var(--ink);
  scroll-behavior: smooth;
  line-height: 1.55;
  font-size: 16px;
}

.wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
}
.narrow {
  max-width: 760px;
}
.center {
  text-align: center;
}

h1,
h2,
h3 {
  font-family: "Space Grotesk", sans-serif;
  letter-spacing: -0.03em;
  margin: 0;
}
h1 {
  font-size: clamp(36px, 5.4vw, 60px);
  line-height: 1.05;
}
h1 em {
  font-style: normal;
  color: var(--green);
}
h2 {
  font-size: clamp(26px, 3.4vw, 38px);
  line-height: 1.15;
}
h3 {
  font-size: 19px;
}
p {
  margin: 0;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--green);
  margin-bottom: 14px;
}
.lead {
  font-size: 18px;
  color: var(--muted);
  margin-top: 20px;
}

/* Botões */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  border: 1px solid transparent;
  transition: transform 0.15s, background 0.15s;
  &:hover {
    transform: translateY(-1px);
  }
  &.solid {
    background: var(--green);
    color: #fff;
    &:hover {
      background: var(--dark-green);
    }
  }
  &.ghost {
    color: var(--ink);
    border-color: var(--line);
    background: transparent;
  }
  &.big {
    padding: 14px 26px;
    font-size: 16px;
  }
}

/* Marca */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font: 700 20px "Space Grotesk", sans-serif;
  letter-spacing: -0.8px;
  color: var(--ink);
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

.by-vn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 6px;
  padding-left: 14px;
  border-left: 1px solid var(--line);
  font: 500 12px "DM Sans", sans-serif;
  letter-spacing: 0;
  color: var(--muted);
  img {
    height: 22px;
    width: auto;
  }
}

/* Navegação */
.nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: color-mix(in srgb, var(--bg-fcfdfc) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.nav-inner {
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.nav-links {
  display: flex;
  gap: 26px;
  a {
    color: var(--muted);
    font-weight: 500;
    font-size: 15px;
    &:hover {
      color: var(--ink);
    }
  }
}
.nav-cta {
  display: flex;
  gap: 8px;
}

/* Hero */
.hero {
  background: var(--soft);
  position: relative;
  overflow: hidden;
  padding: 72px 0 88px;
  &::after {
    content: "";
    position: absolute;
    width: 560px;
    height: 560px;
    border: 1px solid var(--bd-c8e8d3);
    border-radius: 50%;
    right: -220px;
    bottom: -240px;
  }
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 48px;
  align-items: center;
  position: relative;
  z-index: 1;
}
.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  flex-wrap: wrap;
}
.hero-points {
  list-style: none;
  padding: 0;
  margin: 28px 0 0;
  display: grid;
  gap: 8px;
  color: var(--ink);
  font-weight: 500;
  li::before {
    content: "✓";
    color: var(--green);
    font-weight: 700;
    margin-right: 10px;
  }
}

/* Mockup do painel */
.panel {
  background: var(--bg-ffffff);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 24px 60px -24px rgba(19, 101, 65, 0.35);
  padding: 18px;
  transform: rotate(1.2deg);
}
.panel-top {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--line);
  }
  small {
    margin-left: auto;
    color: var(--muted);
  }
}
.panel-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  div {
    background: var(--bg-f6faf7);
    border-radius: 12px;
    padding: 12px;
    display: grid;
  }
  small {
    color: var(--muted);
    font-size: 12px;
  }
  strong {
    font: 700 22px "Space Grotesk", sans-serif;
  }
}
.panel-list {
  list-style: none;
  padding: 0;
  margin: 14px 0;
  display: grid;
  gap: 8px;
  li {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    align-items: center;
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 10px 12px;
    font-size: 13px;
  }
  em {
    font-style: normal;
    font-size: 12px;
    font-weight: 600;
    &.ok {
      color: var(--green);
    }
    &.run {
      color: #b7791f;
    }
  }
}
.chip {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  &.ml {
    background: #fff4c2;
    color: #6b5500;
  }
  &.sp {
    background: #ffe3dc;
    color: #a8321a;
  }
}
.panel-route {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-f6faf7);
  border-radius: 12px;
  padding: 12px;
  .pt {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--green);
    background: #fff;
    &.start {
      background: var(--green);
    }
    &.end {
      background: var(--dark-green);
      border-color: var(--dark-green);
    }
  }
  .ln {
    width: 34px;
    height: 2px;
    background: var(--green);
    opacity: 0.5;
  }
  div {
    margin-left: auto;
    display: grid;
    text-align: right;
  }
  small {
    color: var(--muted);
  }
}

/* Seções */
.section {
  padding: 88px 0;
  &.alt {
    background: var(--bg-f6faf7);
    border-block: 1px solid var(--line);
  }
}

.compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 44px;
}
.compare-card {
  border-radius: 18px;
  padding: 28px;
  border: 1px solid var(--line);
  h3 {
    margin-bottom: 16px;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 12px;
  }
  li {
    padding-left: 26px;
    position: relative;
  }
  li::before {
    position: absolute;
    left: 0;
    font-weight: 700;
  }
  &.before li::before {
    content: "✕";
    color: #c0503a;
  }
  &.after {
    background: var(--soft);
    border-color: var(--bd-c8e8d3);
    li::before {
      content: "✓";
      color: var(--green);
    }
  }
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 44px;
}
.feature {
  background: var(--bg-ffffff);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 26px;
  h3 {
    margin: 16px 0 8px;
  }
  p {
    color: var(--muted);
    font-size: 15px;
  }
}
.ico {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--soft);
  color: var(--green);
}

.steps {
  list-style: none;
  padding: 0;
  margin: 44px 0 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  li {
    text-align: center;
    padding: 8px 12px;
  }
  h3 {
    margin: 16px 0 8px;
  }
  p {
    color: var(--muted);
  }
}
.num {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: inline-grid;
  place-items: center;
  background: var(--green);
  color: #fff;
  font: 700 20px "Space Grotesk", sans-serif;
}

/* Auditoria */
.audit {
  background: #10281f;
  color: #e4ece7;
  .lead {
    color: #a9bdb2;
  }
}
.audit-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 56px;
  align-items: center;
}
.timeline {
  list-style: none;
  margin: 0;
  padding: 0 0 0 26px;
  border-left: 2px solid rgba(137, 185, 154, 0.35);
  display: grid;
  gap: 22px;
  li {
    position: relative;
    display: grid;
  }
  li::before {
    content: "";
    position: absolute;
    left: -34px;
    top: 5px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 0 4px #10281f;
  }
  small {
    color: #a9bdb2;
  }
}

/* FAQ */
.faq-item {
  border-bottom: 1px solid var(--line);
}
.faq-q {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 18px 0;
  background: none;
  border: 0;
  color: var(--ink);
  text-align: left;
  font-weight: 600;
  font-size: 17px;
  &::after {
    content: "+";
    flex: none;
    color: var(--green);
    font-size: 24px;
    line-height: 1;
    transition: transform 0.3s ease;
  }
  &:hover {
    color: var(--green);
  }
}
.faq-item.open .faq-q::after {
  transform: rotate(45deg);
}
/* Anima a altura de 0 até o conteúdo via grid-template-rows */
.faq-a {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 0.35s ease,
    opacity 0.3s ease;
}
.faq-item.open .faq-a {
  grid-template-rows: 1fr;
  opacity: 1;
}
.faq-a-inner {
  overflow: hidden;
  p {
    padding-bottom: 18px;
    color: var(--muted);
  }
}
@media (prefers-reduced-motion: reduce) {
  .faq-a,
  .faq-q::after {
    transition: none;
  }
}
.narrow h2 {
  margin-bottom: 28px;
}

/* CTA */
.cta {
  background: var(--soft);
  text-align: center;
  padding: 80px 0;
  p {
    color: var(--muted);
    font-size: 18px;
    margin: 12px 0 28px;
  }
}

/* Rodapé */
.footer {
  padding: 36px 0;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 14px;
}
.footer-inner {
  display: grid;
  gap: 10px;
  justify-items: center;
  text-align: center;
}
.vn {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  text-align: left;
  line-height: 1.4;
  strong {
    color: var(--ink);
  }
}
.vn-logo {
  height: 44px;
  width: auto;
}
.legal {
  font-size: 12px;
  max-width: 560px;
}

/* Responsivo */
@media (max-width: 900px) {
  .nav-links {
    display: none;
  }
  .hero-grid,
  .audit-grid,
  .compare,
  .steps {
    grid-template-columns: 1fr;
  }
  .features {
    grid-template-columns: 1fr 1fr;
  }
  .panel {
    transform: none;
  }
  .hero {
    padding: 48px 0 64px;
  }
  .section {
    padding: 64px 0;
  }
}
@media (max-width: 560px) {
  .by-vn small {
    display: none;
  }
  .features {
    grid-template-columns: 1fr;
  }
  .nav-cta .ghost {
    display: none;
  }
}
</style>
