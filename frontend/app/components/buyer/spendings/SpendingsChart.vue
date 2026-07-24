<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

interface SpendingsItem {
  date: string;
  spendings: number;
}

interface Props {
  spendingsDataList: SpendingsItem[];
  loading: boolean;
}

const props = defineProps<Props>();

const spendingsChartDataComputed = computed(() => {
  const labels = props.spendingsDataList.map(item => item.date);
  return {
    labels,
    datasets: [
      {
        label: useNuxtApp().$i18n.t('buyer.spendings.chartTitle'),
        borderColor: '#3b82f6', // Premium Blue
        backgroundColor: '#3b82f6',
        data: props.spendingsDataList.map(item => item.spendings),
        tension: 0.3,
        pointRadius: labels.length > 30 ? 0 : 3,
        pointHoverRadius: 6,
        fill: false,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#94a3b8',
        font: {
          family: 'sans-serif',
          weight: 'bold' as const,
          size: 11,
        },
      },
    },
    tooltip: {
      padding: 12,
      cornerRadius: 8,
      backgroundColor: '#1e293b',
      titleFont: { weight: 'bold' as const },
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(148, 163, 184, 0.05)',
      },
      ticks: {
        color: '#94a3b8',
        font: { size: 10 },
      },
    },
    y: {
      grid: {
        color: 'rgba(148, 163, 184, 0.05)',
      },
      ticks: {
        color: '#94a3b8',
        font: { size: 10 },
      },
    },
  },
};

interface ChartTooltipContext {
  dataset: {
    label: string;
  };
  parsed: {
    y: number;
  };
}

const spendingsChartOptionsComputed = computed(() => {
  const options = JSON.parse(JSON.stringify(chartOptions));
  options.plugins.tooltip.callbacks = {
    label: (context: ChartTooltipContext) => ` ${context.dataset.label}: $${context.parsed.y.toFixed(2)}`,
  };
  options.scales.y.ticks.callback = (value: string | number) => `$${value}`;
  return options;
});
</script>

<template>
  <div class="h-80 w-full relative pt-4">
    <div v-if="loading && spendingsDataList.length === 0" class="absolute inset-0 flex items-center justify-center bg-cardBg/80">
      <div class="text-center space-y-3">
        <Icon name="heroicons:arrow-path" class="w-8 h-8 text-brand animate-spin mx-auto" />
        <p class="text-xs text-textMuted font-bold">{{ $t('buyer.spendings.loading') }}</p>
      </div>
    </div>

    <div v-else-if="spendingsDataList.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-3">
      <div class="w-12 h-12 rounded-full bg-appBg border border-appBorder text-textMuted/40 flex items-center justify-center">
        <Icon name="heroicons:chart-bar" class="w-6 h-6" />
      </div>
      <h4 class="font-bold text-sm text-textPrimary">{{ $t('buyer.spendings.noData') }}</h4>
    </div>

    <div v-else class="h-full w-full">
      <ClientOnly>
        <Line :data="spendingsChartDataComputed" :options="spendingsChartOptionsComputed" />
      </ClientOnly>
    </div>
  </div>
</template>
