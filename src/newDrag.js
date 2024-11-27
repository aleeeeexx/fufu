import { ref } from 'vue'
import { useComponentsStore } from './storeData'
const store = useComponentsStore()
// 只读属性
// - clientWidth和clientHeight：content+padding
// - OffsetWidth offsetHight: content+padding+margin
// - clientTop clientLeft: dom的border
// - scrollHeight scrollWidth:有滚动条的时候高度和宽度，如果没有滚动条，那么和clientWidth clientHeight相等
// - offetTop offsetLeft:相对于父元素的偏移
// 读写属性
// - scrollTop scroLeft:滚动时相对父元素偏移，如果没有滚动 值跟offsetTop offsetleft一样
// - style.xxx

// event事件对象的位置属性
// - clientX clientY :相对于浏览器可视区
// - screenX screeenY:相对于屏幕
// - offsetX offsetY:鼠标相对于鼠标点击的dom元素的位置
// - pageX pageY: 相对于页面的位置，如果没滚动等价于clientx clientY，如果有滚动，那么大于

export const useDrag = () => {
  const mouseOffsetBottom = ref(0)
  const mouseOffsetRight = ref(0)
  const dropElement = ref()

  const setDragEvent = (drgWrapperId, dropEle) => {
    dropElement.value = dropEle
    const dragEle = document.getElementById(drgWrapperId)
    if (dragEle.childNodes.length) {
      const { length } = dragEle.childNodes
      let i = 0
      while (i < length) {
        _setDrag(dragEle.childNodes[i])
        i += 1
      }
    } else {
      _setDrag(dragEle)
    }
  }

  //拖动元素注册事件
  const _setDrag = (el) => {
    el.setAttribute && el.setAttribute('draggable', 'true')
    el.ondragstart = _dragStartEvent
    el.ondrag = _ondragEvent
    el.ondragend = _dragEndEvent
  }

  const _dragStartEvent = (ev) => {
    const currentDragComponentName = ev.target.getAttribute('comp-name')
    console.log('开始拖拽,当前拖动组件类型：', currentDragComponentName)
    store.currentDragComponentName = currentDragComponentName

    //获得鼠标距离拖拽元素的下边的距离  clientHeight(content+padding)  offsetX offsetY:鼠标相对于鼠标点击的dom元素的位置
    mouseOffsetBottom.value = ev.currentTarget.clientHeight - ev.offsetY
    //获得鼠标距离拖拽元素的右边的距离
    mouseOffsetRight.value = ev.currentTarget.clientWidth - ev.offsetX
  }

  const _ondragEvent = (ev) => {
    // console.log(
    //   '拖拽中,坐标：',
    //   ev.clientY,
    //   ev.currentTarget.clientHeight,
    //   mouseOffsetBottom.value
    // )

    // clientX clientY :相对于浏览器可视区
    //clientHeight dom的padding+content

    //获取拖拽元素中线距离屏幕上方的距离
    const sourceMidLine =
      ev.clientY + mouseOffsetBottom.value - ev.currentTarget.clientHeight / 2

    // console.log(sourceMidLine, 'sourceMidLine')

    if (_locationCompare(ev)) {
      _insertPlaceholderEle(sourceMidLine)
      //   console.log('释放区内部')
    } else {
      _removePlaceholderEle()
      //   console.log('释放区外面')
    }
  }

  const _dragEndEvent = (ev) => {
    _removePlaceholderEle()
    console.log('拖拽结束')
    console.log('删除占位元素')
  }

  //位置比较
  const _locationCompare = (ev) => {
    let inside = false
    // 拖动元素的左边和右边在整个页面中的位置
    const sourceRight = ev.clientX + mouseOffsetRight.value
    const sourceLeft = sourceRight - ev.currentTarget.clientWidth

    const { offsetLeft: iframeLeft } = _getIframeOffset()
    // const { offsetLeft: targetLeft } = _getRealOffset(dropElement.value)

    /*释放区的位置*/
    const targetOffsetLeft = iframeLeft
    const targetOffsetRight = targetOffsetLeft + dropElement.value.clientWidth

    if (sourceRight > targetOffsetLeft && sourceLeft < targetOffsetRight) {
      //拖动到释放区
      inside = true
    } else {
      //释放区外面
      inside = false
    }
    return inside
  }

  //获取iframe的位置
  const _getIframeOffset = () => {
    return dropElement.value
      ? _getRealOffset(dropElement.value)
      : { offsetLeft: 0, offsetTop: 0 }
  }

  //递归计算元素距离父元素的offset
  const _getRealOffset = (el, parentName) => {
    let left = el.offsetLeft
    let top = el.offsetTop
    if (el.offsetParent && el.offsetParent.tagName !== parentName) {
      const p = _getRealOffset(el.offsetParent, parentName)
      left += p.offsetLeft
      top += p.offsetTop
    }
    return { offsetLeft: left, offsetTop: top }
  }

  //插入占位元素
  const _insertPlaceholderEle = (sourceMidLine) => {
    const dropOffset = _getDropItemsOffset() //释放区的位置属性
    const insertEl = _createElePlaceholder()

    const dropEle =
      dropElement.value.contentDocument ||
      dropElement.value.contentWindow.document.document

    const dom = dropEle.getElementById('preview_content')

    // dropEle.body.appendChild(insertEl)

    const dropEleChild = dropElement.value.childNodes

    //插入第一个占位元素（当iframe内部没有组件）
    if (!dropEleChild.length) {
      dom.appendChild(insertEl)
    }
    if (dropOffset.length) {
      dropOffset.map((item, i) => {
        const Ele = dropEleChild[i]
        //在元素前面插入占位元素
        if (sourceMidLine > item.topLine && sourceMidLine < item.midLine) {
          Ele.before(insertEl)
        }
        //在元素后面插入占位元素
        if (sourceMidLine < item.bottomLine && sourceMidLine > item.midLine) {
          //   this.index = i + 1
          Ele.after(insertEl)
        }
        //追加一个占位元素
        if (sourceMidLine > dropOffset[dropOffset.length - 1].bottomLine) {
          dropEle.append(insertEl)
        }
        return item
      })
    }
  }

  //释放区内部元素位置
  const _getDropItemsOffset = () => {
    const result = []
    const dropEle = dropElement.value
    const el = dropEle.childNodes

    let i = 0
    while (i < el.length) {
      const midLine = _getElOffset(el[i])
      result.push(midLine)
      i += 1
    }
    return result
  }

  //获取元素位置
  const _getElOffset = (el) => {
    const { offsetTop: iframeTop } = _getIframeOffset()
    const { offsetTop: targetOffsetTop } = _getRealOffset(el)
    return {
      midLine: el.clientHeight / 2 + targetOffsetTop + iframeTop,
      topLine: targetOffsetTop + iframeTop,
      bottomLine: el.clientHeight + targetOffsetTop + iframeTop
    }
  }

  //创建占位元素
  const _createElePlaceholder = (() => {
    let ele = null
    return () => {
      if (!ele) {
        const iframeDocument =
          dropElement.value.contentDocument ||
          dropElement.value.contentWindow.document

        ele = iframeDocument.createElement('div')
        ele.setAttribute('id', 'drag-ele-placeholder')
        ele.innerHTML = `<div style="width: 100%; height:50px; position: relative">
            <div style="width: 150px; height: 40px; text-align: center; position: absolute;
            left: 0; right: 0; top: 0; bottom:0; margin: auto; background: #eee; line-height: 40px">放置组件</div>
          </div>`
      }
      return ele
    }
  })()

  const _getIframeDom = () => {
    const dropEle =
      dropElement.value.contentDocument ||
      dropElement.value.contentWindow.document.document

    const dom = dropEle.getElementById('preview_content')
    return dom
  }
  //移除占位元素
  const _removePlaceholderEle = () => {
    const iframe = _getIframeDom()
    const removeEle = iframe.getElementById('drag-ele-placeholder')
    iframe.removeChild(removeEle)
  }

  return {
    setDragEvent
  }
}
