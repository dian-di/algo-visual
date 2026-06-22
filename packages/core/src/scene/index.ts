import type { ArrayScene } from './array'
import type { CodeScene } from './code'
import type { GraphScene } from './graph'
import type { TreeScene } from './tree'
import type { VariableScene } from './variable'

export * from './array'
export * from './code'
export * from './graph'
export * from './tree'
export * from './variable'

/** Union of all built-in visualization scene types */
export type Scene = ArrayScene | CodeScene | GraphScene | TreeScene | VariableScene
