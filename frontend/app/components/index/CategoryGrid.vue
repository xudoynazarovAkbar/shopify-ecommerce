<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Category } from '../../types';

const props = defineProps<{
  categories: Category[];
  loading: boolean;
  modelValue: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | null): void;
}>();

const handleSelect = (catId: string) => {
  if (props.modelValue === catId) {
    emit('update:modelValue', null);
  } else {
    emit('update:modelValue', catId);
  }
};

// Limit visible categories, remainder goes to "More" dropdown
const MAX_VISIBLE = 7;
const visibleCategories = computed(() => props.categories.slice(0, MAX_VISIBLE));
const overflowCategories = computed(() => props.categories.slice(MAX_VISIBLE));

const isDropdownOpen = ref(false);

const closeDropdown = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.more-dropdown-container')) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<template>
  <section>
    <div v-if="loading" class="flex items-center gap-4 overflow-x-auto hide-scrollbar py-2">
      <div
        v-for="i in 6"
        :key="i"
        class="h-10 w-28 bg-appBg border border-appBorder animate-pulse rounded-full flex-shrink-0"
      />
    </div>
    
    <div v-else-if="categories.length === 0" class="text-textMuted text-sm">
      {{ $t('home.noCategories') }}
    </div>
    
    <div v-else class="flex items-center gap-2 py-2 max-w-full overflow-hidden">
      <!-- Scrollable Categories -->
      <div class="flex items-center gap-1 md:gap-2 overflow-x-auto hide-scrollbar min-w-0">
        <template v-for="(cat, index) in visibleCategories" :key="cat.id">
          <button
            class="px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition cursor-pointer flex-shrink-0 focus:outline-none"
            :class="[
              modelValue === cat.id
                ? 'bg-cardBg text-textPrimary shadow-sm border border-appBorder'
                : 'bg-transparent text-textSecondary hover:text-textPrimary hover:bg-cardBg/60'
            ]"
            @click="handleSelect(cat.id)"
          >
            {{ cat.name }}
          </button>
          
          <!-- Faint vertical separator -->
          <div v-if="index < visibleCategories.length - 1" class="h-4 w-px bg-appBorder flex-shrink-0"/>
        </template>
      </div>

      <!-- More Dropdown -->
      <div v-if="overflowCategories.length > 0" class="relative more-dropdown-container flex-shrink-0">
        <button
          class="px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 bg-brand text-brandText hover:bg-brandHover transition shadow-sm focus:outline-none"
          @click="isDropdownOpen = !isDropdownOpen"
        >
          {{ $t('common.more') }}
          <Icon :name="isDropdownOpen ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="w-4 h-4 ml-1" />
        </button>

        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div v-if="isDropdownOpen" class="absolute right-0 top-full mt-2 w-56 bg-cardBg border border-appBorder rounded-xl shadow-lg z-50 py-2">
            <button
              v-for="cat in overflowCategories"
              :key="cat.id"
              class="w-full text-left px-5 py-3 text-sm transition font-medium"
              :class="[
                modelValue === cat.id
                  ? 'bg-appBg text-textPrimary'
                  : 'bg-transparent text-textSecondary hover:bg-appBg/50 hover:text-textPrimary'
              ]"
              @click="handleSelect(cat.id); isDropdownOpen = false"
            >
              {{ cat.name }}
            </button>
          </div>
        </transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Utility to hide scrollbar but keep functionality */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>
