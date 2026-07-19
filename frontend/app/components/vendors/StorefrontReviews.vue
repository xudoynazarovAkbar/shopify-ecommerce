<script setup lang="ts">
import type { Review } from '../../types';

defineProps<{
  reviews: Review[];
  loading: boolean;
}>();

// Helper to mask buyer emails (e.g. b***r@test.com)
const maskEmail = (email?: string) => {
  if (!email) return 'Anonymous Buyer';
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local.charAt(0)}***@${domain}`;
  return `${local.charAt(0)}***${local.charAt(local.length - 1)}@${domain}`;
};
</script>

<template>
  <div class="space-y-8">
    <!-- Reviews Header -->
    <div class="border-b border-appBorder pb-4">
      <h2 class="text-xl font-extrabold text-textPrimary flex items-center gap-2">
        <Icon name="heroicons:chat-bubble-bottom-center-text-20-solid" class="w-6 h-6 text-brand" />
        <span>{{ $t('reviews.title') || 'Customer Reviews' }}</span>
        <span class="text-textMuted text-xs font-normal">({{ reviews.length }} reviews)</span>
      </h2>
    </div>

    <!-- Empty Reviews State -->
    <div v-if="reviews.length === 0" class="text-center py-12 bg-cardBg rounded-2xl border border-appBorder p-8 max-w-md mx-auto">
      <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-12 h-12 text-textMuted mx-auto mb-3" />
      <h3 class="text-lg font-bold text-textPrimary mb-1">{{ $t('reviews.noReviews') || 'No reviews yet' }}</h3>
      <p class="text-textSecondary text-sm">Be the first to review this store after placing an order!</p>
    </div>

    <!-- Reviews Ledger -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="bg-cardBg border border-appBorder rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between"
      >
        <div>
          <!-- Review User & Stars -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <div class="flex items-center gap-2">
              <!-- Avatar Circle Placeholder -->
              <div class="w-8 h-8 rounded-full bg-appBg border border-appBorder flex items-center justify-center text-textSecondary font-bold text-xs shrink-0">
                <Icon name="heroicons:user" class="w-4 h-4 text-textMuted" />
              </div>
              <span class="text-xs font-bold text-textPrimary">
                {{ maskEmail(review.buyer?.email) }}
              </span>
            </div>

            <!-- Stars Row -->
            <div class="flex items-center gap-0.5 shrink-0">
              <Icon
                v-for="star in 5"
                :key="'star-' + review.id + '-' + star"
                name="heroicons:star-20-solid"
                :class="[
                  star <= review.rating ? 'text-amber-500' : 'text-appBorder',
                  'w-4 h-4 shrink-0'
                ]"
              />
            </div>
          </div>

          <!-- Review Comment -->
          <p class="text-textSecondary text-sm leading-relaxed italic mb-4">
            "{{ review.comment || 'No written comment provided.' }}"
          </p>
        </div>

        <!-- Review Date -->
        <div class="text-[10px] text-textMuted text-right border-t border-appBorder/60 pt-3">
          Reviewed on {{ new Date(review.createdAt).toLocaleDateString() }}
        </div>
      </div>
    </div>
  </div>
</template>
