import { ref, watch } from 'vue'

class Drag {
  params = {}
  mouseOffsetBottom = 0
  mouseOffsetRight = 0
  dragStartCallBack = null
  init = (params, dragStartCallBack) => {
    this.params = params
    this.dragStartCallBack = dragStartCallBack
  }

  //初始化设置拖动元素
  initDrag = () => {
    const { dragEle } = this.params
    if (dragEle.childNodes.length) {
      const { length } = dragEle.childNodes
      let i = 0
      while (i < length) {
        this.setDrag(dragEle.childNodes[i])
        i += 1
      }
    } else {
      this.setDrag(dragEle)
    }
  }

  //初始化释放区
  initDrop = (dropEle) => {
    //过滤出非元素节点
    const eleChilds = getChildElementsWithoutComments(dropEle)
    console.log(eleChilds, 'eleChilds')
    if (eleChilds.length) {
      const { length } = eleChilds
      let i = 0
      while (i < length) {
        this.setDrop(dropEle.childNodes[i])
        i += 1
      }
    } else {
      this.setDrop(dropEle)
    }
  }

  //拖动元素注册事件
  setDrag = (el) => {
    console.log(el, 'setDrag')
    el.setAttribute && el.setAttribute('draggable', 'true')
    el.ondragstart = this.dragStartEvent
    el.ondrag = this.ondragEvent
    el.ondragend = this.dragEndEvent
  }

  //释放区注册事件
  setDrop = (el) => {
    console.log(el, el.nodeType, 'setDrop')
    el.ondrop = this.dropEvent
    el.ondragenter = this.dragEnterEvent
    el.ondragover = this.dragOverEvent
    el.ondragleave = this.dragLeaveEvent
  }

  //获取iframe的位置
  getIframeOffset = () => {
    const iframeEle = this.params.dropEle
    return iframeEle
      ? this.getRealOffset(iframeEle)
      : { offsetLeft: 0, offsetTop: 0 }
  }
  //递归计算元素距离父元素的offset
  getRealOffset = (el, parentName) => {
    let left = el.offsetLeft
    let top = el.offsetTop
    // if (el.offsetParent && el.offsetParent.tagName !== parentName) {
    //   const p = this.getRealOffset(el.offsetParent, parentName)
    //   left += p.offsetLeft
    //   top += p.offsetTop
    // }
    return { offsetLeft: left, offsetTop: top }
  }

  //位置比较
  locationCompare = (ev) => {
    let inside = false
    // const { dropEle } = this.params
    const dropEle = this.dropEle
    console.log(ev.clientX)
    // 拖动元素的位置
    const sourceRight = ev.clientX + this.mouseOffsetRight
    const sourceLeft = sourceRight - ev.currentTarget.clientWidth

    console.log(sourceRight, 'sourceRight', sourceLeft, 'sourceLeft')
    const { offsetLeft: iframeLeft } = this.getIframeOffset()
    console.log(iframeLeft, 'iframeLeft')
    // const { offsetLeft: targetLeft } = this.getRealOffset(dropEle)

    /*释放区的位置*/
    // const targetOffsetLeft = iframeLeft + targetLeft
    // const targetOffsetRight = targetOffsetLeft + dropEle.clientWidth

    // if (sourceRight > targetOffsetLeft && sourceLeft < targetOffsetRight) {
    //   //拖动到释放区
    //   inside = true
    // } else {
    //   //释放区外面
    //   inside = false
    // }
    return inside
  }

  //创建占位元素
  createElePlaceholder = (() => {
    let ele = null
    return () => {
      if (!ele) {
        ele = document.createElement('div')
        ele.setAttribute('id', 'drag-ele-placeholder')
        ele.innerHTML = `<div style="width: 100%; height:50px; position: relative">
            <div style="width: 150px; height: 40px; text-align: center; position: absolute;
            left: 0; right: 0; top: 0; bottom:0; margin: auto; background: #878; line-height: 40px">放置组件</div>
          </div>`
      }
      return ele
    }
  })()

  //移除占位元素
  removePlaceholderEle = () => {
    // const iframe = this.getIframe()
    // const removeEle = iframe.contentDocument.getElementById(
    //   'drag-ele-placeholder'
    // )
    // const { dropEle } = this.params
    // if (this.isHasPlaceholderEle()) {
    //   dropEle.removeChild(removeEle)
    // }
  }

  /****** 事件处理 ******/
  dragStartEvent = (ev) => {
    console.log('开始拖拽-dragStartEvent', ev.target)
    const currentDragComponentName = ev.target.getAttribute('comp-name')
    this.dragStartCallBack(currentDragComponentName, 10)
    // const a = ev.target.dataset.componentName
    //获得鼠标距离拖拽元素的下边的距离
    this.mouseOffsetBottom = ev.currentTarget.clientHeight - ev.offsetY
    //获得鼠标距离拖拽元素的右边的距离
    this.mouseOffsetRight = ev.currentTarget.clientWidth - ev.offsetX
  }

  ondragEvent = (ev) => {
    // console.log('拖拽中')
    //获取拖拽元素中线距离屏幕上方的距离
    const sourceMidLine =
      ev.clientY + this.mouseOffsetBottom - ev.currentTarget.clientHeight / 2

    // console.log(sourceMidLine, 'sourceMidLine')

    // if (this.locationCompare(ev)) {
    //   // this.insertPlaceholderEle(sourceMidLine)
    //   console.log('释放区内部')
    // } else {
    //   // this.removePlaceholderEle()
    //   console.log('释放区外面')
    // }
  }
  dragOverEvent = (ev) => {
    ev.preventDefault()
  }
  dragEndEvent = (ev) => {
    this.removePlaceholderEle()
    console.log('拖拽结束')
    console.log('删除占位元素')
  }
  //插入占位元素
  dragEnterEvent = (ev) => {
    ev.preventDefault()
    // const insertEle = this.createElePlaceholder()
    console.log(ev.target, 'ev.target')
    //放到ev.target的前面
    ev.target.before(this.createElePlaceholder())
    // ev.target.appendChild(insertEle)
    // ev.target.before(insertEle)
    console.log('进入到可放置区')
    console.log('插入占位元素')
  }
  //删除占位元素
  dragLeaveEvent = (ev) => {
    // ev.preventDefault()
    // this.removePlaceholderEle()
    console.log('离开放置区')
    console.log('删除占位元素')
  }

  dropEvent = (ev) => {
    console.log(this, 'dropEvent-this')
    console.log('在放置区放开鼠标')
    ev.preventDefault()

    // this.dropCallBack(this.currentDragComponentName, 10)
  }
}

// export const useIframeLoad = () => {
//   const [iframeState, setIframeState] = useState(false)
//   const [windowState, setWindowState] = useState(
//     document.readyState === 'complete'
//   )

//   const iframeLoad = () => {
//     const iframeEle = document.getElementById('my-iframe')
//     iframeEle &&
//       setIframeState(iframeEle.contentDocument.readyState === 'complete')
//     if (!iframeState && iframeEle) {
//       iframeEle.onload = () => {
//         setIframeState(true)
//       }
//     }
//   }
//   useEffect(() => {
//     if (!windowState) {
//       setIframeState(false)
//       window.addEventListener('load', () => {
//         setWindowState(true)
//         iframeLoad()
//       })
//     } else {
//       iframeLoad()
//     }
//   }, [])
//   return iframeState
// }

export const useIframeLoad = (iframeEle, cb) => {
  console.log(iframeEle, 'useIframeLoad-iframeEle')
  const iframeState = ref(false)
  const windowState = ref(document.readyState === 'complete')

  const iframeLoad = () => {
    // const iframeEle = document.getElementById(iframeIdName)
    if (iframeEle) {
      // iframeState.value = iframeEle.contentDocument.readyState === 'complete'
      // console.log(
      //   iframeEle.contentDocument.readyState,
      //   'iframeEle.contentDocument.readyState'
      // )
      if (!iframeState.value) {
        iframeEle.onload = () => {
          console.log('iframe 加载完毕')
          iframeState.value = true
        }
      }
    }
  }

  console.log(windowState.value, 'onMounted-windowState')
  if (!windowState.value) {
    iframeState.value = false
    window.addEventListener('load', () => {
      windowState.value = true
      iframeLoad()
    })
  } else {
    console.log('elelelel', iframeState.value)
    iframeLoad()
  }

  watch(
    iframeState,
    (newValue) => {
      if (newValue) {
        // iframe 加载完毕后执行的代码
        console.log('iframe 已xxx载完毕')
        cb && cb()
      }
    },
    { immediate: true }
  )

  return iframeState
}

function getChildElementsWithoutComments(parentElement) {
  // 获取所有子节点
  const childNodes = parentElement.childNodes

  // 过滤出元素节点
  const childElements = Array.from(childNodes).filter(
    (node) => node.nodeType === Node.ELEMENT_NODE
  )

  return childElements
}

export default new Drag()
