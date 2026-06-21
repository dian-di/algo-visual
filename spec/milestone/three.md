```
DatasetStore
    registerDataset()
PointerStore
    registerPointer()
VariableStore
    setVariable()
AlgoBuilder
    snapshot()
TimelineBuilder
    build()
```

目标：

能够写：

```
const builder = new AlgoBuilder()

builder.dataset(...)
builder.pointer(...)
builder.snapshot()

builder.build()
```

返回：

Timeline