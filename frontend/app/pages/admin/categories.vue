<script setup lang="ts">
import { useAdminCategories } from '../../composables/useAdminCategories';
import { useToastStore } from '../../stores/toast';
import type { Category } from '../../types';

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'role'],
  meta: { roles: ['ADMIN'] },
});

const {
  categories,
  loading,
  error,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = useAdminCategories();

const toastStore = useToastStore();

const showModal = ref(false);
const editingCategory = ref<Category | null>(null);

onMounted(async () => {
  await fetchCategories();
});

const openAddModal = () => {
  editingCategory.value = null;
  showModal.value = true;
};

const openEditModal = (cat: Category) => {
  editingCategory.value = cat;
  showModal.value = true;
};

const closeModal = () => {
  editingCategory.value = null;
  showModal.value = false;
};

const handleFormSubmit = async (payload: { name: string; description?: string; icon?: string }) => {
  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, payload);
      toastStore.success(useNuxtApp().$i18n.t('admin.categoryUpdatedSuccess'));
    } else {
      await createCategory(payload);
      toastStore.success(useNuxtApp().$i18n.t('admin.categoryCreatedSuccess'));
    }
    closeModal();
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to save category';
    toastStore.error(errMsg);
  }
};

const handleDelete = async (catId: string) => {
  if (!confirm(useNuxtApp().$i18n.t('admin.categoryDeleteConfirmation'))) return;

  try {
    await deleteCategory(catId);
    toastStore.success(useNuxtApp().$i18n.t('admin.categoryDeletedSuccess'));
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to delete category';
    toastStore.error(errMsg);
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-black text-textPrimary tracking-tight">
          {{ $t('admin.categoriesTitle') }}
        </h1>
        <p class="text-xs text-textMuted">
          {{ $t('admin.categoriesSubtitle') }}
        </p>
      </div>

      <button
        type="button"
        class="bg-brand hover:bg-brandHover text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2 self-start sm:self-auto"
        @click="openAddModal"
      >
        <Icon name="heroicons:plus-20-solid" class="w-5 h-5" />
        {{ $t('admin.addCategory') }}
      </button>
    </div>

    <!-- Error alert banner -->
    <div
      v-if="error"
      class="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2"
    >
      <Icon name="heroicons:exclamation-circle" class="w-5 h-5 shrink-0" />
      {{ error }}
    </div>

    <!-- Skeletons -->
    <div v-if="loading && categories.length === 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-32 bg-cardBg border border-appBorder rounded-2xl animate-pulse" />
    </div>

    <!-- Empty global categories -->
    <div
      v-else-if="categories.length === 0"
      class="border border-appBorder bg-cardBg rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm"
    >
      <div class="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
        <Icon name="heroicons:tag" class="w-6 h-6" />
      </div>
      <div class="space-y-1">
        <h3 class="font-extrabold text-textPrimary text-sm">
          {{ $t('admin.emptyCategoriesTitle') }}
        </h3>
        <p class="text-xs text-textMuted">
          {{ $t('admin.emptyCategoriesSubtitle') }}
        </p>
      </div>
    </div>

    <!-- Interactive categories listing -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="bg-cardBg border border-appBorder rounded-2xl p-6 shadow-sm hover:shadow transition flex flex-col justify-between space-y-4"
      >
        <div class="flex items-start gap-4">
          <!-- Icon Tag wrapper -->
          <div class="w-12 h-12 rounded-xl bg-brand/5 border border-brand/10 flex items-center justify-center text-brand shrink-0">
            <Icon :name="cat.icon || 'heroicons:tag-solid'" class="w-6 h-6" />
          </div>
          <div class="space-y-1">
            <h3 class="font-bold text-textPrimary text-sm leading-snug">
              {{ cat.name }}
            </h3>
            <p class="text-xs text-textMuted line-clamp-2 leading-relaxed">
              {{ cat.description || $t('home.noDescription') }}
            </p>
          </div>
        </div>

        <!-- Controls panel -->
        <div class="flex items-center gap-3 pt-3 border-t border-appBorder">
          <button
            type="button"
            class="flex-1 bg-appBg hover:bg-appBg/80 text-textPrimary border border-appBorder py-2 font-bold rounded-lg text-xs transition active:scale-95 flex items-center justify-center gap-1.5 focus:outline-none"
            @click="openEditModal(cat)"
          >
            <Icon name="heroicons:pencil-square" class="w-4 h-4 text-textMuted" />
            <span>{{ $t('vendor.edit') }}</span>
          </button>
          <button
            type="button"
            class="bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 p-2 rounded-lg border border-rose-500/20 transition active:scale-95 focus:outline-none"
            @click="handleDelete(cat.id)"
          >
            <Icon name="heroicons:trash" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Category addition/editing modal form -->
    <AdminCategoryFormModal
      :show="showModal"
      :category="editingCategory"
      @close="closeModal"
      @submit="handleFormSubmit"
    />
  </div>
</template>
