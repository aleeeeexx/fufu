<template>
  <div class="edit_container fl fl_jc_fs fl_ai_fs">
    <div class="edit_left" id="drag-wrapper">
      <template v-for="item in ToolsList" :key="item.componentName">
        <div
          class="edit_tools_item flv fl_jc_c fl_ai_c"
          :data-componentName="item.componentName"
          :comp-name="item.componentName"
        >
          <img
            :src="item.iconUrl"
            class="edit_tools_item_icon"
            :comp-name="item.componentName"
          />
          <span class="edit_tools_item_title" :comp-name="item.componentName">{{
            item.name
          }}</span>
          <span class="edit_tools_item_count" :comp-name="item.componentName"
            >{{ ToolItemCount[item.componentName] }} / {{ item.limit }}</span
          >
        </div>
      </template>
    </div>
    <div class="edit_main">
      <iframe id="edit_preview_iframe" src="/preview" class="edit_iframe" />
    </div>
    <div class="edit_right">
      <div class="edit_right_type">
        {{ selectedComponent.name }}
      </div>
      <component
        :is="selectedComponent.configComponentName"
        :data="selectedComponent"
        :onChange="onChange"
      ></component>
    </div>
  </div>
</template>
<script>
// 导入要注册的组件
import TitleTextConfig from '../components/titletext/config.vue'

export default {
  // 在这里局部注册
  components: {
    TitleTextConfig
  }
}
</script>
<script setup>
import { onMounted, ref } from 'vue'
import _remove from 'lodash/remove'
import state, { ToolsList, ToolItemCount } from '../store'
import { useComponentsStore } from '../storeData'
import { useDrag } from '../newDrag'
import { useIframeLoad } from '../hooks'

const store = useComponentsStore()
const { setDragEvent } = useDrag()

// 当前选中的组件
const selectedComponent = ref({})
let childIFrame = null

function deleteComponent(cid) {
  state.components = _remove(state.components, (item) => {
    return item.id === cid
  })
}

function onChange(key, value) {
  selectedComponent.value[key] = value
  childIFrame.postMessage({
    message: 'updateComponent',
    data: JSON.parse(JSON.stringify(selectedComponent.value))
  })
}

const _postInitMsg = () => {
  if (childIFrame) {
    childIFrame.postMessage({ message: 'init', data: null })
  }
}

const _initListener = () => {
  window.addEventListener('message', (event) => {
    const { message, data } = event.data
    console.log('msg&data-from-iframe:', message, data)

    if (message === 'deleteComponent' && data && data.id) {
      deleteComponent(data.id)
    }

    if (message === 'compDroped') {
      store.dropComp(childIFrame)
    }

    if (message === 'selectComponent' && data && data.id) {
      store.currentEditComponents.forEach((item) => {
        if (item.id === data.id) {
          selectedComponent.value = item
        }
      })
    }
  })
}

onMounted(() => {
  // 获取iframe实例
  childIFrame = document.getElementById('edit_preview_iframe').contentWindow

  //对每一个待拖拽的组件绑定拖拽事件
  setDragEvent('drag-wrapper', document.getElementById('edit_preview_iframe'))

  // 注册监听iframe事件
  _initListener()

  // 当iframe加载完毕，发送初始化信息给iframe，在iframe中保留edit组件实例
  useIframeLoad(document.getElementById('edit_preview_iframe'), _postInitMsg)
})
</script>

<style scoped>
.edit_left {
  width: 200px;
  height: 100vh;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-content: start;
  grid-gap: 10px;
  margin-top: 24px;
}
.edit_main {
  flex: 1;
  background-color: #f7f8fa;
  height: 100vh;
  min-width: 400px;
}
.edit_right {
  width: 376px;
  height: 100vh;
}

.edit_iframe {
  width: 100%;
  height: 844px;
  background-color: #fff;
  margin-top: 24px;
  border: none !important;
}
.edit_tools_item {
  width: 80px;
  height: 88px;
  cursor: pointer;
}
.edit_tools_item_icon {
  width: 32px;
  height: 32px;
}
.edit_tools_item_title {
  font-size: 12px;
  margin-top: 4px;
  color: #323233;
}
.edit_tools_item_count {
  font-size: 12px;
  margin-top: 4px;
  color: #7d7e80;
}
.edit_right_type {
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  color: #323233;
  padding: 24px 16px;
  border-bottom: 1px solid #f2f4f6;
}
</style>
