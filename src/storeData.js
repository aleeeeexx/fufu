import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import db from './db'

export const ComponentMap = {
  TitleText: {
    name: '标题文本',
    componentName: 'TitleText',
    configComponentName: 'TitleTextConfig',
    value: '这里是标题文本',
    styles: {
      textAlign: 'left',
      fontWeight: 'normal',
      color: '#333',
      backgroundColor: '#fff'
    },
    is_splite_line: false,
    is_more: false,
    more_setting: {
      mode: 'mod1',
      url: '',
      text: '查看更多'
    }
  },
  Image: {
    name: '图片',
    componentName: 'Image',
    value: '',
    styles: {
      margin: '',
      borderRadius: '',
      boxShadow: ''
    }
  },
  Carousel: {
    name: '轮播',
    componentName: 'Carousel',
    value: [
      {
        name: '图片',
        componentName: 'Image',
        value: '',
        styles: {
          margin: '',
          borderRadius: '',
          boxShadow: ''
        }
      }
    ]
  }
}

export const ToolsList = [
  {
    id: 'title_text',
    componentName: 'TitleText',
    name: '标题文本',
    limit: 10,
    iconUrl: '/src/assets/tools_title_text.svg'
  },
  {
    id: 'image',
    componentName: 'Image',
    name: '图片',
    limit: 50,
    iconUrl: '/src/assets/tools_image.svg'
  },
  {
    id: 'carousel',
    componentName: 'Carousel',
    name: '轮播',
    limit: 10,
    iconUrl: '/src/assets/tools_carousel.svg'
  }
]

export const ToolItemCount = reactive({
  TitleText: 0,
  Image: 0,
  Carousel: 0
})

const s4 = () => {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}

export const useComponentsStore = defineStore('componentsData', () => {
  const currentDragComponentName = ref('')
  const currentEditComponents = ref([])

  function dropComp(childIFrame, limit = 99999) {
    const key = currentDragComponentName.value
    if (ComponentMap[key] && ToolItemCount[key] < limit) {
      const cid = s4() + s4()
      const cData = { ...ComponentMap[key] }
      cData.id = cid
      currentEditComponents.value.push(cData)
      ToolItemCount[key]++
      childIFrame.postMessage({ message: 'dropComp', data: cData })
      db.states.add({ ...cData, create_time: Date.now() })
    }
  }

  return {
    currentDragComponentName,
    dropComp,
    currentEditComponents
  }
})
