<template>
  <div class="app-shell">
    <Sidebar />
    <main class="content">
      <header class="topbar">
        <div class="breadcrumb">
          <span>Painel</span><b>/</b><strong>Financeiro</strong>
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
          <h1>Financeiro</h1>
          <p class="heading-copy">
            Acompanhe resgates, ganhos e despesas, e feche o mês para liberar
            a análise da IA.
          </p>
        </div>
        <button class="primary-button" @click="openCreateEntry">
          <span>+</span> Novo lançamento
        </button>
      </section>

      <section class="metric-grid" aria-label="Resumo financeiro">
        <article class="metric-card highlight">
          <div class="metric-top">
            <span>GANHOS NO PERÍODO</span><span class="metric-icon">R$</span>
          </div>
          <strong>{{ formatCurrency(summary.totalEarnings) }}</strong>
          <div class="metric-bottom">
            <span class="muted-strong">{{ formatCurrency(summary.totalResgates) }}</span>
            <span>em resgates</span>
          </div>
        </article>
        <article class="metric-card">
          <div class="metric-top">
            <span>DESPESAS NO PERÍODO</span><span class="metric-icon orange">−</span>
          </div>
          <strong>{{ formatCurrency(summary.totalExpenses) }}</strong>
        </article>
        <article class="metric-card">
          <div class="metric-top">
            <span>SALDO NO PERÍODO</span><span class="metric-icon blue">=</span>
          </div>
          <strong :class="{ negative: summary.balance < 0 }">{{
            formatCurrency(summary.balance)
          }}</strong>
        </article>
        <article class="metric-card">
          <div class="metric-top">
            <span>TOTAL DE TRANSAÇÕES</span><span class="metric-icon purple">✎</span>
          </div>
          <strong>{{ formatCurrency(summary.totalManual) }}</strong>
          <div class="metric-bottom">
            <span>salário, freelas e outros</span>
          </div>
        </article>
      </section>

      <section class="panel filter-panel">
        <div class="filter-row">
          <label
            >Data inicial
            <DatePicker
              v-model="filters.startDate"
              dateFormat="dd/mm/yy"
              showIcon
              fluid
          /></label>
          <label
            >Data final
            <DatePicker
              v-model="filters.endDate"
              dateFormat="dd/mm/yy"
              showIcon
              fluid
          /></label>
          <label
            >Tipo
            <Dropdown
              v-model="filters.type"
              :options="typeFilterOptions"
              optionLabel="label"
              optionValue="value"
              fluid
          /></label>
          <label class="search-field"
            >Buscar
            <InputText
              v-model="filters.search"
              placeholder="Buscar pela Descrição"
              fluid
          /></label>
        </div>
        <div class="filter-actions">
          <button class="outline-button" @click="resetFilters">Limpar</button>
          <button class="primary-button" @click="loadFinanceData">
            Filtrar
          </button>
        </div>
      </section>

      <section class="panel entries-panel">
        <div class="panel-heading">
          <div>
            <h2>Lançamentos</h2>
            <p>Resgates automáticos e lançamentos manuais do período</p>
          </div>
        </div>

        <div v-if="entries.length === 0" class="empty-state">
          <span class="empty-icon">✦</span>
          <h2>Nenhum lançamento no período</h2>
          <p>
            Ajuste os filtros ou adicione um ganho ou despesa manualmente
            para começar.
          </p>
          <button class="primary-button" @click="openCreateEntry">
            Novo lançamento
          </button>
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>DATA</th>
                <th>DESCRIÇÃO</th>
                <th>CATEGORIA</th>
                <th>ORIGEM</th>
                <th>VALOR</th>
                <th>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in entries" :key="entry.id">
                <td>{{ formatDate(entry.date) }}</td>
                <td class="route-cell">{{ entry.description }}</td>
                <td><span class="category-pill">{{ categoryLabel(entry.category) }}</span></td>
                <td>
                  <span
                    :class="[
                      'status-pill',
                      entry.source === 'resgate' ? 'in-progress' : 'done',
                    ]"
                    ><i></i>{{ entry.source === "resgate" ? "Resgate" : "Manual" }}</span
                  >
                </td>
                <td
                  :class="[
                    'value-cell',
                    entry.type === 'expense' ? 'negative' : 'positive',
                  ]"
                >
                  {{ entry.type === "expense" ? "−" : "+" }}
                  {{ formatCurrency(entry.amount) }}
                </td>
                <td>
                  <div v-if="entry.source === 'manual'" class="device-actions">
                    <button
                      class="icon-button-sm"
                      aria-label="Editar lançamento"
                      @click="openEditEntry(entry)"
                    >
                      <Pencil :size="13" />
                    </button>
                    <button
                      class="icon-button-sm danger"
                      aria-label="Remover lançamento"
                      @click="openDeleteEntry(entry)"
                    >
                      <Trash2 :size="13" />
                    </button>
                  </div>
                  <span v-else class="muted-hint">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel closing-panel">
        <div class="panel-heading">
          <div>
            <h2>Fechamento do mês</h2>
            <p>
              Feche o mês para consolidar os lançamentos e liberar o
              relatório de IA.
            </p>
          </div>
        </div>

        <div class="closing-body">
          <label
            >Mês de referência
            <DatePicker
              v-model="referenceMonth"
              view="month"
              dateFormat="mm/yy"
              showIcon
              fluid
              @update:modelValue="loadMonthClosure"
          /></label>

          <div class="closing-status">
            <span v-if="monthClosure" class="status-pill done"
              ><i></i>Mês fechado em {{ formatDate(monthClosure.closedAt) }}</span
            >
            <span v-else class="status-pill in-progress"
              ><i></i>Mês em aberto</span
            >
          </div>

          <div class="closing-actions">
            <button
              class="primary-button"
              :disabled="!!monthClosure"
              @click="showCloseMonth = true"
            >
              Fechar mês
            </button>
            <button
              class="primary-button"
              :disabled="!monthClosure"
              @click="generateAiReport"
            >
              Gerar relatório com IA
            </button>
          </div>
        </div>

        <p v-if="closeMonthError" class="form-error">{{ closeMonthError }}</p>

        <div v-if="aiReport" class="ai-report">
          <h3>Análise da IA</h3>
          <p>{{ aiReport.summary }}</p>
          <ul v-if="aiReport.recommendations.length">
            <li v-for="(recommendation, index) in aiReport.recommendations" :key="index">
              {{ recommendation }}
            </li>
          </ul>
        </div>
      </section>

      <footer>RouteXFlow <span>·</span> Painel administrativo</footer>
    </main>

    <Dialog
      v-model:visible="showEntryDialog"
      modal
      :header="entryDialogMode === 'create' ? 'Novo lançamento' : 'Editar lançamento'"
      class="finance-dialog"
      :style="{ width: '460px' }"
    >
      <form class="dialog-form" @submit.prevent="submitEntry">
        <label for="entry-type"
          >Tipo
          <Dropdown
            id="entry-type"
            v-model="entryForm.type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            fluid
          />
        </label>

        <label for="entry-category"
          >Categoria
          <Dropdown
            id="entry-category"
            v-model="entryForm.category"
            :options="categoryOptionsForType"
            optionLabel="label"
            optionValue="value"
            fluid
          />
        </label>

        <label for="entry-description"
          >Descrição
          <InputText
            id="entry-description"
            v-model="entryForm.description"
            placeholder="Ex: Salário CLT de setembro"
            fluid
        /></label>

        <label for="entry-amount"
          >Valor
          <InputNumber
            id="entry-amount"
            v-model="entryForm.amount"
            mode="currency"
            currency="BRL"
            locale="pt-BR"
            fluid
        /></label>

        <label for="entry-date"
          >Data
          <DatePicker
            id="entry-date"
            v-model="entryForm.date"
            dateFormat="dd/mm/yy"
            showIcon
            fluid
        /></label>

        <p v-if="entryError" class="form-error">{{ entryError }}</p>

        <div class="dialog-actions">
          <button
            type="button"
            class="outline-button"
            @click="showEntryDialog = false"
          >
            Cancelar
          </button>
          <button type="submit" class="primary-button">
            {{ entryDialogMode === "create" ? "Cadastrar lançamento" : "Salvar alterações" }}
          </button>
        </div>
      </form>
    </Dialog>

    <Dialog
      v-model:visible="showDeleteEntry"
      modal
      header="Remover lançamento"
      class="finance-dialog"
      :style="{ width: '400px' }"
    >
      <p class="delete-confirm-text">
        Tem certeza que deseja remover o lançamento
        <strong>{{ deleteEntryTarget?.description }}</strong>? Essa ação não
        pode ser desfeita.
      </p>

      <p v-if="deleteEntryError" class="form-error">{{ deleteEntryError }}</p>

      <div class="dialog-actions">
        <button
          type="button"
          class="outline-button"
          @click="showDeleteEntry = false"
        >
          Cancelar
        </button>
        <button type="button" class="danger-button" @click="deleteEntry">
          Remover lançamento
        </button>
      </div>
    </Dialog>

    <Dialog
      v-model:visible="showCloseMonth"
      modal
      header="Fechar mês"
      class="finance-dialog"
      :style="{ width: '400px' }"
    >
      <p class="delete-confirm-text">
        Ao fechar
        <strong>{{ referenceMonthLabel }}</strong>, os lançamentos deste mês
        serão consolidados e não poderão mais ser alterados. Esta ação libera
        o relatório de IA.
      </p>

      <p v-if="closeMonthError" class="form-error">{{ closeMonthError }}</p>

      <div class="dialog-actions">
        <button
          type="button"
          class="outline-button"
          @click="showCloseMonth = false"
        >
          Cancelar
        </button>
        <button type="button" class="primary-button" @click="closeMonth">
          Fechar mês
        </button>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { Pencil, Trash2 } from "@lucide/vue";
import { DatePicker, InputNumber } from "primevue";
import { useNuxtApp } from "#app";
import useLoading from "~/composable/useLoading";
import { useToastService } from "~/composable/useToast";
import { getLoggedUser } from "~/composable/useAuth";
import type {
  IFinanceEntry,
  FinanceEntryType,
  FinanceCategory,
  IFinanceSummary,
  IFinanceMonthClosure,
  IFinanceAiReport,
} from "~/infra/interfaces/services/finance";

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

const typeOptions: { label: string; value: FinanceEntryType }[] = [
  { label: "Ganho", value: "earning" },
  { label: "Despesa", value: "expense" },
];

const typeFilterOptions: { label: string; value: FinanceEntryType | null }[] = [
  { label: "Todos", value: null },
  ...typeOptions,
];

const manualEarningCategoryOptions: { label: string; value: FinanceCategory }[] = [
  { label: "Salário CLT", value: "salario_clt" },
  { label: "Freelance", value: "freela" },
  { label: "Entregas", value: "resgate_entregas_marketplace" },
  { label: "Outro ganho", value: "outro_ganho" },
];

const expenseCategoryOptions: { label: string; value: FinanceCategory }[] = [
  { label: "Combustível", value: "combustivel" },
  { label: "Manutenção", value: "manutencao" },
  { label: "Alimentação", value: "alimentacao" },
  { label: "Aluguel/Financiamento", value: "aluguel" },
  { label: "Imposto", value: "imposto" },
  { label: "Outro gasto", value: "outro_gasto" },
];

const categoryLabels: Record<FinanceCategory, string> = {
  resgate_delivery: "Resgate Delivery",
  resgate_entregas_marketplace: "Resgate Entregas MarketPalce",
  salario_clt: "Salário CLT",
  freela: "Freelance",
  outro_ganho: "Outro ganho",
  combustivel: "Combustível",
  manutencao: "Manutenção",
  alimentacao: "Alimentação",
  aluguel: "Aluguel/Financiamento",
  imposto: "Imposto",
  outro_gasto: "Outro gasto",
};

function categoryLabel(category: FinanceCategory) {
  return categoryLabels[category] ?? category;
}

const categoryOptionsForType = computed(() =>
  entryForm.type === "expense" ? expenseCategoryOptions : manualEarningCategoryOptions,
);

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toIsoDate(date: Date | null | undefined) {
  if (!date) return undefined;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

const filters = reactive({
  startDate: startOfMonth(new Date()),
  endDate: new Date(),
  search: "",
  type: null as FinanceEntryType | null,
});

function resetFilters() {
  filters.startDate = startOfMonth(new Date());
  filters.endDate = new Date();
  filters.search = "";
  filters.type = null;
  loadFinanceData();
}

const entries = ref<IFinanceEntry[]>([]);
const summary = ref<IFinanceSummary>({
  totalEarnings: 0,
  totalExpenses: 0,
  balance: 0,
  totalResgates: 0,
  totalManual: 0,
});

async function loadFinanceData() {
  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const filter = {
      startDate: toIsoDate(filters.startDate),
      endDate: toIsoDate(filters.endDate),
      search: filters.search || undefined,
      type: filters.type ?? undefined,
    };

    const [entriesResponse, summaryResponse] = await Promise.all([
      $httpClient.finance.FinanceList(filter),
      $httpClient.finance.FinanceSummary(filter),
    ]);

    if (!entriesResponse.success) {
      toast.error(entriesResponse.errors[0] ?? "Não foi possível carregar os lançamentos.");
    } else {
      entries.value = entriesResponse.result;
    }

    if (summaryResponse.success) {
      summary.value = summaryResponse.result;
    }
  } catch (cause: any) {
    toast.error(cause?.errors?.[0] ?? "Não foi possível carregar os lançamentos.");
  } finally {
    loadingPop();
  }
}

const showEntryDialog = ref(false);
const entryDialogMode = ref<"create" | "edit">("create");
const editingEntryId = ref<number | null>(null);
const entryForm = reactive({
  type: "earning" as FinanceEntryType,
  category: "salario_clt" as FinanceCategory,
  description: "",
  amount: 0,
  date: new Date(),
});
const entryError = ref("");

function openCreateEntry() {
  entryDialogMode.value = "create";
  editingEntryId.value = null;
  entryForm.type = "earning";
  entryForm.category = "salario_clt";
  entryForm.description = "";
  entryForm.amount = 0;
  entryForm.date = new Date();
  entryError.value = "";
  showEntryDialog.value = true;
}

function openEditEntry(entry: IFinanceEntry) {
  entryDialogMode.value = "edit";
  editingEntryId.value = entry.id;
  entryForm.type = entry.type;
  entryForm.category = entry.category;
  entryForm.description = entry.description;
  entryForm.amount = entry.amount;
  entryForm.date = new Date(entry.date);
  entryError.value = "";
  showEntryDialog.value = true;
}

async function submitEntry() {
  entryError.value = "";

  if (!entryForm.description) {
    entryError.value = "Informe uma descrição para o lançamento.";
    toast.error(entryError.value);
    return;
  }

  if (!entryForm.amount || entryForm.amount <= 0) {
    entryError.value = "Informe um valor maior que zero.";
    toast.error(entryError.value);
    return;
  }

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const payload = {
      type: entryForm.type,
      category: entryForm.category,
      description: entryForm.description,
      amount: entryForm.amount,
      date: toIsoDate(entryForm.date) ?? new Date().toISOString(),
    };

    const response =
      entryDialogMode.value === "create"
        ? await $httpClient.finance.RegisterEntry(payload)
        : await $httpClient.finance.UpdateEntry({ id: editingEntryId.value!, ...payload });

    if (!response.success) {
      toast.error(response.errors[0] ?? "Não foi possível salvar o lançamento.");
      return;
    }

    toast.success(
      entryDialogMode.value === "create"
        ? "Lançamento cadastrado com sucesso."
        : "Lançamento atualizado com sucesso.",
    );
    showEntryDialog.value = false;
    await loadFinanceData();
  } catch (cause: any) {
    const message = cause?.errors?.[0] ?? "Não foi possível salvar o lançamento. Tente novamente.";
    entryError.value = message;
    toast.error(message);
  } finally {
    loadingPop();
  }
}

const showDeleteEntry = ref(false);
const deleteEntryTarget = ref<IFinanceEntry | null>(null);
const deleteEntryError = ref("");

function openDeleteEntry(entry: IFinanceEntry) {
  deleteEntryTarget.value = entry;
  deleteEntryError.value = "";
  showDeleteEntry.value = true;
}

async function deleteEntry() {
  deleteEntryError.value = "";

  if (!deleteEntryTarget.value) return;

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.finance.DeleteEntry(deleteEntryTarget.value.id);

    if (!response.success) {
      toast.error(response.errors[0] ?? "Não foi possível remover o lançamento.");
      return;
    }

    toast.success("Lançamento removido com sucesso.");
    showDeleteEntry.value = false;
    await loadFinanceData();
  } catch (cause: any) {
    const message = cause?.errors?.[0] ?? "Não foi possível remover o lançamento. Tente novamente.";
    deleteEntryError.value = message;
    toast.error(message);
  } finally {
    loadingPop();
  }
}

const referenceMonth = ref(new Date());
const referenceMonthLabel = computed(() =>
  referenceMonth.value.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
);
const monthClosure = ref<IFinanceMonthClosure | null>(null);
const showCloseMonth = ref(false);
const closeMonthError = ref("");
const aiReport = ref<IFinanceAiReport | null>(null);

function currentPeriod() {
  return {
    month: referenceMonth.value.getMonth() + 1,
    year: referenceMonth.value.getFullYear(),
  };
}

async function loadMonthClosure() {
  aiReport.value = null;
  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.finance.GetMonthClosure(currentPeriod());

    if (!response.success) {
      monthClosure.value = null;
      return;
    }

    monthClosure.value = response.result;
  } catch {
    monthClosure.value = null;
  } finally {
    loadingPop();
  }
}

async function closeMonth() {
  closeMonthError.value = "";

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.finance.CloseMonth(currentPeriod());

    if (!response.success) {
      toast.error(response.errors[0] ?? "Não foi possível fechar o mês.");
      return;
    }

    monthClosure.value = response.result;
    toast.success("Mês fechado com sucesso.");
    showCloseMonth.value = false;
  } catch (cause: any) {
    const message = cause?.errors?.[0] ?? "Não foi possível fechar o mês. Tente novamente.";
    closeMonthError.value = message;
    toast.error(message);
  } finally {
    loadingPop();
  }
}

async function generateAiReport() {
  if (!monthClosure.value) return;

  loadingPush();
  try {
    const { $httpClient } = useNuxtApp();
    const response = await $httpClient.finance.GenerateAiReport(currentPeriod());

    if (!response.success) {
      toast.error(response.errors[0] ?? "Não foi possível gerar o relatório de IA.");
      return;
    }

    aiReport.value = response.result;
    toast.success("Relatório de IA gerado com sucesso.");
  } catch (cause: any) {
    toast.error(cause?.errors?.[0] ?? "Não foi possível gerar o relatório de IA.");
  } finally {
    loadingPop();
  }
}

onMounted(() => {
  loadFinanceData();
  loadMonthClosure();
});
</script>

<style lang="scss" scoped>
.heading-copy {
  max-width: 480px;
  color: var(--muted);
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.6;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.metric-card {
  position: relative;
  min-height: 120px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 19px;
  overflow: hidden;
}

.metric-card.highlight {
  background: #eaf7ef;
  border-color: #d9eee0;
}

.metric-top,
.metric-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metric-top {
  color: #89948d;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.9px;
}

.metric-icon {
  color: var(--green);
  background: #d8f0e1;
  border-radius: 5px;
  padding: 5px 6px;
  font-size: 10px;
  font-weight: 700;

  &.orange {
    color: #cf8334;
    background: #fff0da;
  }

  &.blue {
    color: #5892ac;
    background: #e4f3f8;
  }

  &.purple {
    color: #8e84ac;
    background: #eeebf6;
  }
}

.metric-card > strong {
  display: block;
  font: 700 24px "Space Grotesk";
  margin: 14px 0 7px;

  &.negative {
    color: #c65b4d;
  }
}

.metric-bottom {
  justify-content: flex-start;
  gap: 7px;
  color: #99a39d;
  font-size: 10px;
}

.muted-strong {
  color: #5e6c64;
  font-weight: 600;
}

.filter-panel {
  margin-top: 14px;
  padding: 19px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 14px;

  label {
    display: block;
    color: #506057;
    font-size: 11px;
    font-weight: 600;
  }
}

.search-field {
  grid-column: span 1;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.entries-panel,
.closing-panel {
  margin-top: 14px;
  padding: 22px 23px 8px;
}

.panel-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;

  h2 {
    font: 600 16px "Space Grotesk";
    margin: 0 0 5px;
  }

  p {
    margin: 0;
    color: var(--muted);
    font-size: 11px;
  }
}

.empty-state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;

  h2 {
    font: 600 18px "Space Grotesk";
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

.table-wrap {
  overflow-x: auto;
  margin-top: 20px;
}

table {
  border-collapse: collapse;
  width: 100%;
  min-width: 760px;
}

th {
  text-align: left;
  color: #a0aaa4;
  font-size: 9px;
  letter-spacing: 0.8px;
  padding: 0 10px 12px;
}

td {
  border-top: 1px solid #edf1ee;
  padding: 13px 10px;
  color: #78837c;
  font-size: 11px;
  white-space: nowrap;
}

.route-cell {
  color: #48564e;
  font-weight: 600;
}

.category-pill {
  background: #f2f6f3;
  color: #5e6c64;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.value-cell {
  font-weight: 700;

  &.positive {
    color: #2e795a;
  }

  &.negative {
    color: #c65b4d;
  }
}

.status-pill {
  border-radius: 20px;
  padding: 5px 8px;
  font-size: 10px;
  white-space: nowrap;

  i {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    margin-right: 5px;
  }

  &.in-progress {
    color: #c77b2d;
    background: #fff4e4;

    i {
      background: #efa04e;
    }
  }

  &.done {
    color: #44956c;
    background: #edf8f0;

    i {
      background: #55b47a;
    }
  }
}

.muted-hint {
  color: #c3cac5;
}

.device-actions {
  display: flex;
  align-items: center;
  gap: 6px;
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

.closing-body {
  display: grid;
  grid-template-columns: 220px 1fr auto;
  align-items: end;
  gap: 14px;
  margin: 20px 0 10px;

  label {
    display: block;
    color: #506057;
    font-size: 11px;
    font-weight: 600;
  }
}

.closing-status {
  display: flex;
  align-items: center;
}

.closing-actions {
  display: flex;
  gap: 10px;

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.ai-report {
  background: #f6f8f6;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 18px;
  margin: 18px 0;

  h3 {
    font: 600 14px "Space Grotesk";
    margin: 0 0 8px;
  }

  p {
    color: #48564e;
    font-size: 12px;
    line-height: 1.6;
    margin: 0 0 10px;
  }

  ul {
    margin: 0;
    padding-left: 18px;
    color: #5e6c64;
    font-size: 12px;
    line-height: 1.8;
  }
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

@media (max-width: 1050px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .closing-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    justify-content: stretch;

    button {
      flex: 1;
    }
  }
}
</style>
