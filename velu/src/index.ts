import VirtualScroll from './components/VirtualScroll.vue'
import type { App } from 'vue'

// Export components
export { VirtualScroll }

// Export types for better TypeScript support
export interface VirtualScrollProps<T = any> {
  items: T[]
  itemHeight: number
  containerHeight?: number
  buffer?: number
}

export interface VirtualScrollEmits {
  'visible-change': (payload: { start: number; end: number }) => void
}

export interface VirtualScrollExpose {
  scrollToIndex: (index: number) => void
}

// Default export for convenience
export default {
  VirtualScroll,
}

// Install function for Vue.use()
export const install = (app: App) => {
  app.component('VeluVirtualScroll', VirtualScroll)
}
