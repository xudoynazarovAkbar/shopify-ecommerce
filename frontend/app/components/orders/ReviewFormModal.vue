<script setup lang="ts">
import type { Order } from '../../types';

defineProps<{
  show: boolean;
  order: Order | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', rating: number, comment: string): void;
}>();

const rating = ref(5);
const comment = ref('');
const isSubmitting = ref(false);

const selectRating = (stars: number) => {
  rating.value = stars;
};

const handleCancel = () => {
  rating.value = 5;
  comment.value = '';
  emit('close');
};

const handleSubmit = async () => {
  if (rating.value < 1 || rating.value > 5) return;
  isSubmitting.value = true;
  try {
    emit('submit', rating.value, comment.value);
    rating.value = 5;
    comment.value = '';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="show && order"
    class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition"
  >
    <!-- Modal Dialog card -->
    <div
      class="relative bg-cardBg rounded-2xl border border-appBorder shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 transition duration-300 flex flex-col"
    >
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-appBorder flex items-center justify-between">
        <div>
          <h3 class="font-black text-textPrimary text-lg">
            {{ $t('reviews.writeReview') }}
          </h3>
          <p class="text-xs text-textMuted mt-0.5">
            {{ $t('reviews.forStore') }} <span class="font-bold text-brand">{{ order.vendor?.shopName }}</span>
          </p>
        </div>
        <button
          class="p-1 rounded-lg text-textMuted hover:text-textPrimary hover:bg-appBg/80 transition"
          @click="handleCancel"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-6 flex-1">
        <!-- Interactive 1-to-5 Stars Selector -->
        <div class="space-y-2 text-center sm:text-left">
          <label class="text-sm font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('reviews.rating') }}
          </label>
          <div class="flex items-center justify-center sm:justify-start gap-1.5 mt-2">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="p-1 transition-transform transform active:scale-95 focus:outline-none"
              @click="selectRating(star)"
            >
              <Icon
                name="heroicons:star-solid"
                :class="[
                  'w-8 h-8 transition-colors',
                  star <= rating
                    ? 'text-amber-400'
                    : 'text-textMuted/20 hover:text-amber-400/50',
                ]"
              />
            </button>
          </div>
          <span class="text-xs font-bold text-brand block mt-1">
            {{ rating }} / 5 ({{ $t(`reviews.starLabel.${rating}`) }})
          </span>
        </div>

        <!-- Custom Feedback text area -->
        <div class="space-y-2">
          <label class="text-sm font-bold text-textPrimary uppercase tracking-wider block">
            {{ $t('reviews.comment') }}
          </label>
          <textarea
            v-model="comment"
            rows="4"
            class="w-full bg-appBg text-textPrimary border border-appBorder rounded-xl p-3.5 text-sm placeholder:text-textMuted/65 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
            :placeholder="$t('reviews.placeholder')"
            maxlength="400"
          />
          <div class="flex justify-end">
            <span class="text-[11px] text-textMuted">
              {{ comment.length }} / 400
            </span>
          </div>
        </div>
      </div>

      <!-- Modal Footer Action row -->
      <div class="px-6 py-4 bg-appBg/50 border-t border-appBorder flex items-center justify-end gap-3">
        <button
          type="button"
          class="px-4 py-2 text-sm font-bold text-textSecondary hover:text-textPrimary rounded-xl transition hover:bg-appBg"
          @click="handleCancel"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          class="px-5 py-2 bg-brand hover:bg-brandHover text-white font-bold rounded-xl text-sm transition shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
          @click="handleSubmit"
        >
          <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" class="w-4 h-4" />
          <Icon v-else name="heroicons:paper-airplane" class="w-4 h-4" />
          {{ $t('reviews.submit') }}
        </button>
      </div>
    </div>
  </div>
</template>
