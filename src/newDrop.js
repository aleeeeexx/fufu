export const useDrop = () => {
  let dropCallback = null
  const initDrop = (dropWrapperId, dropcb) => {
    console.log('给iframe绑定drop事件')
    dropCallback = dropcb
    const dropEle = document.getElementById(dropWrapperId)
    //过滤出非元素节点
    const eleChilds = _getChildElementsWithoutComments(dropEle)

    if (eleChilds.length) {
      const { length } = eleChilds
      let i = 0
      while (i < length) {
        _setDrop(dropEle.childNodes[i])
        i += 1
      }
    } else {
      _setDrop(dropEle)
    }
  }

  //释放区注册事件
  const _setDrop = (el) => {
    el.ondrop = _dropEvent
    el.ondragenter = _dragEnterEvent
    el.ondragover = _dragOverEvent
    el.ondragleave = _dragLeaveEvent
  }

  const _dropEvent = (ev) => {
    ev.preventDefault()
    console.log('在放置区放开鼠标')
    dropCallback()
  }

  //插入占位元素
  const _dragEnterEvent = (ev) => {
    ev.preventDefault()
    // const insertEle = this.createElePlaceholder()
    console.log(ev.target, 'ev.target')
    //放到ev.target的前面
    // ev.target.before(_createElePlaceholder())
    // ev.target.appendChild(insertEle)
    // ev.target.before(insertEle)
    console.log('进入到可放置区')
    console.log('插入占位元素')
  }

  const _dragOverEvent = (ev) => {
    ev.preventDefault()
  }

  const _dragLeaveEvent = (ev) => {
    // ev.preventDefault()
    // this.removePlaceholderEle()
    console.log('离开放置区')
    console.log('删除占位元素')
  }

  const _getChildElementsWithoutComments = (parentElement) => {
    // 获取所有子节点
    const childNodes = parentElement.childNodes

    // 过滤出元素节点
    const childElements = Array.from(childNodes).filter(
      (node) => node.nodeType === Node.ELEMENT_NODE
    )

    return childElements
  }

  //创建占位元素
  const _createElePlaceholder = (() => {
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

  return {
    initDrop
  }
}
