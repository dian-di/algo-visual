import type { FlowScene } from '@packages/flow-engine/src'
import type { ComponentType } from 'react'

/** Props that every flow renderer receives */
export interface FlowRendererProps {
  scene: FlowScene
  className?: string
}

/** A flow renderer is any React component that can render a FlowScene */
export type FlowRenderer = ComponentType<FlowRendererProps>

/**
 * FlowRendererRegistry -- maps string IDs to FlowRenderer components.
 *
 * Pattern mirrors RendererRegistry in renderer-sdk.
 */
export class FlowRendererRegistry {
  private readonly map = new Map<string, FlowRenderer>()

  register(id: string, renderer: FlowRenderer): void {
    if (this.map.has(id)) {
      throw new Error(`FlowRendererRegistry: "${id}" already registered`)
    }
    this.map.set(id, renderer)
  }

  resolve(id: string): FlowRenderer | undefined {
    return this.map.get(id)
  }

  has(id: string): boolean {
    return this.map.has(id)
  }

  ids(): string[] {
    return Array.from(this.map.keys())
  }
}
