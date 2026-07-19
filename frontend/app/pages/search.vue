<script setup lang="ts">
import { useSearch } from '../composables/useSearch';

definePageMeta({
  layout: 'default',
});

const { query, products, vendors, loading } = useSearch();
</script>

<template>
  <div class="space-y-6">
    <!-- Search Query Summary Header -->
    <div v-if="query" class="border-b border-appBorder pb-4">
      <h1 class="text-2xl font-bold text-textPrimary">
        {{ $t('search.resultsFor', { query }) }}
      </h1>
    </div>

    <!-- Search Grid -->
    <SearchSearchResultGrid
      :query="query"
      :products="products"
      :vendors="vendors"
      :loading="loading"
    />
  </div>
</template>
