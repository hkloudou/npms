<script setup lang="ts" generic="T = any">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps<{
  items: T[] // 需要显示的数据列表
  itemHeight: number // 每个项目的高度
  containerHeight?: number // 容器最大高度
  buffer?: number // 上下缓冲的项目数量
}>()

const emit = defineEmits<{
  'visible-change': [{ start: number; end: number }]
}>()

// 默认值
const defaultBuffer = 5

// 虚拟滚动相关数据
const containerRef = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const actualContainerHeight = ref(0)
const buffer = computed(() => props.buffer || defaultBuffer)

// 更新实际容器高度
const updateContainerHeight = () => {
  if (containerRef.value) {
    actualContainerHeight.value = containerRef.value.clientHeight
    // 高度变化时也触发可见范围变化事件
    emit('visible-change', {
      start: visibleRange.value.start,
      end: visibleRange.value.end,
    })
  }
}

// 监听滚动事件
const handleScroll = (e: Event) => {
  if (containerRef.value) {
    scrollTop.value = (e.target as HTMLElement).scrollTop
    // 发出可见范围变化
    emit('visible-change', {
      start: visibleRange.value.start,
      end: visibleRange.value.end,
    })
  }
}

// 计算可见项目的起始和结束索引
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight) - buffer.value
  const end =
    Math.ceil((scrollTop.value + actualContainerHeight.value) / props.itemHeight) + buffer.value

  return {
    start: Math.max(0, start),
    end: Math.min(props.items.length, end),
  }
})

// 计算总高度
const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

// 计算可见项目
const visibleItems = computed(() => {
  if (!props.items || props.items.length === 0) return []

  const { start, end } = visibleRange.value
  return props.items.slice(start, end)
})

// 计算偏移量
const offsetY = computed(() => {
  const { start } = visibleRange.value
  return start * props.itemHeight
})

// 计算容器样式
const containerStyle = computed(() => {
  if (props.containerHeight) {
    // 如果指定了高度，使用 max-height
    return {
      maxHeight: `${props.containerHeight}px`,
      height: '100%',
    }
  } else {
    // 如果没有指定高度，使用 100% 高度
    return {
      height: '100%',
    }
  }
})

// 滚动到指定索引位置
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

// 监听数据变化
watch(
  () => props.items,
  (newItems: T[], oldItems: T[]) => {
    if (newItems.length !== oldItems.length) {
      // 只有数组长度变化时，重置滚动位置
      scrollTop.value = 0
      if (containerRef.value) {
        containerRef.value.scrollTop = 0
      }
    }
    // 如果长度相同，保持当前滚动位置
  },
  { deep: true },
)

// 监听容器大小变化
watch(containerRef, (newRef) => {
  if (newRef) {
    const resizeObserver = new ResizeObserver(() => {
      updateContainerHeight()
    })
    resizeObserver.observe(newRef)

    // 清理函数
    return () => {
      resizeObserver.disconnect()
    }
  }
})

onMounted(() => {
  if (containerRef.value) {
    containerRef.value.addEventListener('scroll', handleScroll)
    updateContainerHeight()

    // 初始化完成后触发一次可见范围变化
    nextTick(() => {
      emit('visible-change', {
        start: visibleRange.value.start,
        end: visibleRange.value.end,
      })
    })
  }
})

// 暴露方法供父组件调用
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

/* 滚动条美化 */
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
