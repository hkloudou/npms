<script setup lang="ts" generic="T = any">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps<{
  items: T[] // List of items to display
  itemHeight: number // Height of each item in pixels
  containerHeight?: number // Maximum container height
  buffer?: number // Number of buffer items above and below visible area
}>()

const emit = defineEmits<{
  'visible-change': [{ start: number; end: number }]
}>()

// Default values
const defaultBuffer = 5

// Virtual scrolling related data
const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const actualContainerHeight = ref(0)
const buffer = computed(() => props.buffer || defaultBuffer)

// Update actual container height
const updateContainerHeight = () => {
  if (containerRef.value) {
    actualContainerHeight.value = containerRef.value.clientHeight
    // Trigger visible range change event when height changes
    emit('visible-change', {
      start: visibleRange.value.start,
      end: visibleRange.value.end,
    })
  }
}

// Handle scroll events
const handleScroll = (e: Event) => {
  if (containerRef.value) {
    scrollTop.value = (e.target as HTMLElement).scrollTop
    // Emit visible range change
    emit('visible-change', {
      start: visibleRange.value.start,
      end: visibleRange.value.end,
    })
  }
}

// Calculate visible item start and end indices
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight) - buffer.value
  const end =
    Math.ceil((scrollTop.value + actualContainerHeight.value) / props.itemHeight) + buffer.value

  return {
    start: Math.max(0, start),
    end: Math.min(props.items.length, end),
  }
})

// Calculate total height
const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

// Calculate visible items
const visibleItems = computed(() => {
  if (!props.items || props.items.length === 0) return []

  const { start, end } = visibleRange.value
  return props.items.slice(start, end)
})

// Calculate offset
const offsetY = computed(() => {
  const { start } = visibleRange.value
  return start * props.itemHeight
})

// Calculate container styles
const containerStyle = computed(() => {
  if (props.containerHeight) {
    // If height is specified, use max-height
    return {
      maxHeight: `${props.containerHeight}px`,
      height: '100%',
    }
  } else {
    // If no height specified, use 100% height
    return {
      height: '100%',
    }
  }
})

// Scroll to specified index position
const scrollToIndex = (index: number) => {
  if (containerRef.value) {
    containerRef.value.scrollTop = index * props.itemHeight
    scrollTop.value = containerRef.value.scrollTop
    emit('visible-change', {
      start: visibleRange.value.start,
      end: visibleRange.value.end,
    })
  }
}

// Watch for data changes
watch(
  () => props.items,
  (newItems: T[], oldItems: T[]) => {
    if (newItems.length !== oldItems.length) {
      // Reset scroll position only when array length changes
      scrollTop.value = 0
      if (containerRef.value) {
        containerRef.value.scrollTop = 0
      }
    }
    // If length is the same, keep current scroll position
  },
  { deep: true },
)

// Watch for container size changes
watch(containerRef, (newRef) => {
  if (newRef) {
    const resizeObserver = new ResizeObserver(() => {
      updateContainerHeight()
    })
    resizeObserver.observe(newRef)

    // Cleanup function
    return () => {
      resizeObserver.disconnect()
    }
  }
})

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll)
    updateContainerHeight()

    // Trigger visible range change once after initialization
    nextTick(() => {
      emit('visible-change', {
        start: visibleRange.value.start,
        end: visibleRange.value.end,
      })
    })
  }
})

// Expose methods for parent component
defineExpose({
  scrollToIndex,
})
</script>

<template>
  <div ref="containerRef" class="vaux-virtual-scroll" :style="containerStyle">
    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <div :style="{ transform: `translateY(${offsetY}px)`, position: 'absolute', width: '100%' }">
        <template v-for="(item, index) in visibleItems" :key="visibleRange.start + index">
          <slot :item="item" :index="visibleRange.start + index" />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vaux-virtual-scroll {
  overflow: auto;
}

/* Scrollbar styling */
.vaux-virtual-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.vaux-virtual-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.vaux-virtual-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

.vaux-virtual-scroll::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
