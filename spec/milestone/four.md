实现：

```
RenderNode
    RenderNode
RendererPlugin
    supports()
    render()
RendererRegistry
    register()
    resolve()
CompositeRenderer
    renderFrame()
```

目标：

给一个 Frame：

`renderer.render(frame)`

输出：

RenderNodeTree

注意：

此阶段不要返回 JSX。

应该返回：

RenderNode

因为：

React
Vue
Canvas
SVG

以后都能接。