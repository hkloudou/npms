import VirtualScroll from './components/VirtualScroll.vue'

// Export components
export { VirtualScroll }

// Export types
export type { 
  // You can add component prop types here as needed
}

// Default export for convenience
export default {
  VirtualScroll,
}

// Install function for Vue.use()
export const install = (app: any) => {
  app.component('VeluVirtualScroll', VirtualScroll)
}
