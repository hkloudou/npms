# Velu

A modern Vue 3 UI component library with TypeScript support.

## Features

- 🚀 **Vue 3 + TypeScript**: Built with Vue 3 Composition API and full TypeScript support
- ⚡ **Virtual Scrolling**: High-performance virtual scroll component for large datasets
- 🎨 **Customizable**: Flexible styling and configuration options
- 📦 **Tree Shakable**: Import only what you need
- 🔧 **Developer Friendly**: Excellent TypeScript IntelliSense support

## Installation

```bash
npm install velu --save
# or
pnpm add velu
# or
yarn add velu
```

## Quick Start

### Global Registration

```typescript
// main.ts
import { createApp } from 'vue'
import Velu, { install } from 'velu'
import 'velu/style.css'

const app = createApp(App)
app.use(install)
```

### Component Registration

```vue
<script setup lang="ts">
import { VirtualScroll } from 'velu'
import 'velu/style.css'

const items = ref(Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` })))
</script>

<template>
  <VirtualScroll
    :items="items"
    :item-height="50"
    :container-height="400"
    @visible-change="onVisibleChange"
  >
    <template #default="{ item, index }">
      <div class="item">
        {{ index }}: {{ item.name }}
      </div>
    </template>
  </VirtualScroll>
</template>
```

## Components

### VirtualScroll

High-performance virtual scrolling component for rendering large lists.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | `[]` | Array of items to render |
| `itemHeight` | `number` | - | Height of each item in pixels |
| `containerHeight` | `number` | `undefined` | Max height of the container |
| `buffer` | `number` | `5` | Number of items to render outside visible area |

#### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `visible-change` | `{ start: number, end: number }` | Fired when visible range changes |

#### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ item: T, index: number }` | Template for each item |

#### Exposed Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `scrollToIndex` | `(index: number)` | Scroll to specific item index |

### Example Usage

```vue
<template>
  <VirtualScroll
    :items="largeDataset"
    :item-height="60"
    :container-height="500"
    :buffer="10"
    @visible-change="handleVisibleChange"
  >
    <template #default="{ item, index }">
      <div class="custom-item">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description }}</p>
        <small>Index: {{ index }}</small>
      </div>
    </template>
  </VirtualScroll>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VirtualScroll } from 'velu'

interface Item {
  id: number
  title: string
  description: string
}

const largeDataset = ref<Item[]>(
  Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    title: `Item ${i}`,
    description: `Description for item ${i}`
  }))
)

const handleVisibleChange = ({ start, end }: { start: number; end: number }) => {
  console.log(`Visible items: ${start} - ${end}`)
}
</script>

<style>
.custom-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
}
</style>
```

## TypeScript Support

Velu is written in TypeScript and provides full type definitions:

```typescript
import type { VirtualScrollProps } from 'velu'

// Generic type support
interface MyItem {
  id: number
  name: string
}

const items: MyItem[] = [...]
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
