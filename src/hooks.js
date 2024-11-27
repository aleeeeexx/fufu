import { ref, watch } from 'vue'

export const useIframeLoad = (iframeEle, callback) => {
  const iframeState = ref(false)
  const windowState = ref(document.readyState === 'complete')

  const iframeLoad = () => {
    if (iframeEle) {
      if (!iframeState.value) {
        iframeEle.onload = () => {
          console.log('onload iframe 加载完毕')
          iframeState.value = true
        }
      }
    }
  }

  if (!windowState.value) {
    iframeState.value = false
    window.addEventListener('load', () => {
      windowState.value = true
      iframeLoad()
    })
  } else {
    iframeLoad()
  }

  watch(
    iframeState,
    (newValue) => {
      if (newValue && callback) {
        setTimeout(() => {
          console.log('iframe 已加载完毕，执行callback')
          // iframe 加载完毕后执行的代码
          callback()
        }, 1000)
      }
    },
    { immediate: true }
  )

  return iframeState
}
