<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '../../composables/useApi';
import { useImageResolver } from '../../composables/useImageResolver';
import { register } from 'swiper/element/bundle';

interface ActiveCampaign {
  id: string;
  vendorId: string;
  image: string;
  label: string | null;
  labelColor: string | null;
  vendor: {
    id: string;
    shopName: string;
  };
}

const api = useApi();
const { resolveImageUrl } = useImageResolver();

const activeCampaigns = ref<ActiveCampaign[]>([]);
const loading = ref(true);

const fetchActiveCampaigns = async () => {
  try {
    const res = await api.get<ActiveCampaign[]>('/campaigns/active');
    activeCampaigns.value = res || [];
  } catch (err) {
    console.error('Failed to fetch active ad campaigns:', err);
  } finally {
    loading.value = false;
  }
};

interface SwiperInstance {
  slideNext: () => void;
  slidePrev: () => void;
}

interface SwiperRefElement {
  swiper: SwiperInstance;
}

const swiperRef = ref<SwiperRefElement | null>(null);

const nextSlide = () => {
  if (swiperRef.value && swiperRef.value.swiper) {
    swiperRef.value.swiper.slideNext();
  }
};

const prevSlide = () => {
  if (swiperRef.value && swiperRef.value.swiper) {
    swiperRef.value.swiper.slidePrev();
  }
};

onMounted(async () => {
  // Explicitly register Swiper Elements on client side
  register();
  await fetchActiveCampaigns();
});

// Helper to resolve tag/label color styles
const getLabelBgClass = (color: string | null) => {
  const c = (color || 'red').toLowerCase();
  if (c === 'red') return 'bg-rose-600 text-white';
  if (c === 'blue') return 'bg-sky-600 text-white';
  if (c === 'green') return 'bg-emerald-600 text-white';
  if (c === 'gold' || c === 'yellow') return 'bg-amber-500 text-slate-950';
  return 'bg-brand text-brandText';
};
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="h-44 sm:h-64 bg-cardBg border border-appBorder rounded-2xl animate-pulse flex items-center justify-center">
      <Icon name="svg-spinners:ring-resize" class="w-8 h-8 text-brand" />
    </div>

    <!-- Active Swiper Banner (if campaigns exist) -->
    <ClientOnly v-else>
      <div
        v-if="activeCampaigns.length > 0"
        class="relative w-full h-44 sm:h-64 rounded-2xl overflow-hidden shadow-md border border-appBorder bg-zinc-950 group"
      >
        <swiper-container
          ref="swiperRef"
          :loop="true"
          :autoplay="{
            delay: 5000,
            disableOnInteraction: false
          }"
          :pagination="{ clickable: true }"
          class="w-full h-full"
        >
          <swiper-slide
            v-for="campaign in activeCampaigns"
            :key="campaign.id"
            class="relative w-full h-full flex items-center"
          >
            <!-- Background Creative Image -->
            <img
              :src="resolveImageUrl(campaign.image)"
              :alt="campaign.vendor.shopName"
              class="w-full h-full object-cover select-none"
            >
            
            <!-- Banner Overlay Sheet -->
            <div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex flex-col justify-center px-8 sm:px-16 space-y-3">
              <div class="space-y-1">
                <!-- Custom colored advertising label -->
                <span
                  v-if="campaign.label"
                  :class="['inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm', getLabelBgClass(campaign.labelColor)]"
                >
                  {{ campaign.label }}
                </span>
                <h2 class="text-xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  {{ campaign.vendor.shopName }}
                </h2>
              </div>
              
              <div>
                <NuxtLink
                  :to="`/vendors/${campaign.vendorId}`"
                  class="inline-flex items-center gap-1 text-xs font-bold bg-brand hover:bg-brandHover text-brandText px-4 py-2 rounded-xl shadow transition"
                >
                  <span>Browse Store</span>
                  <Icon name="heroicons:arrow-right-20-solid" class="w-4 h-4" />
                </NuxtLink>
              </div>
            </div>
          </swiper-slide>
        </swiper-container>

        <!-- Arrow Controls -->
        <button
          type="button"
          class="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          @click="prevSlide"
        >
          <Icon name="heroicons:chevron-left" class="w-5 h-5" />
        </button>
        <button
          type="button"
          class="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          @click="nextSlide"
        >
          <Icon name="heroicons:chevron-right" class="w-5 h-5" />
        </button>
      </div>

      <!-- Standard Fallback Banner (if no campaigns are currently active) -->
      <section
        v-else
        class="bg-brand text-brandText rounded-2xl p-8 sm:p-12 text-center shadow-md relative overflow-hidden transition-colors"
      >
        <div class="max-w-2xl mx-auto relative z-10 space-y-4">
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {{ $t('home.heroTitle') }}
          </h1>
          <p class="text-sm sm:text-base text-brandText/80">
            {{ $t('home.heroSubtitle') }}
          </p>
        </div>
        <div class="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
      </section>
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Swiper Pagination custom bullet styles */
swiper-container::part(bullet) {
  background-color: rgba(255, 255, 255, 0.5);
  opacity: 1;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  transition: all 0.2s ease-in-out;
}

swiper-container::part(bullet-active) {
  background-color: rgb(var(--brand));
  width: 1.25rem;
}
</style>