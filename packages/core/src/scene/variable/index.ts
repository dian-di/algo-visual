import type { Variant } from '../../types'

export interface VariableEntry {
  name: string
  value: string
  variant?: Variant
  /** Whether this variable changed in the current step */
  changed?: boolean
}

/** Scene for displaying a watch panel of algorithm variables */
export interface VariableScene {
  variables: VariableEntry[]
}

export function createVariableScene(variables: VariableEntry[]): VariableScene {
  return { variables: variables.map((v) => ({ ...v })) }
}

export function setVariable(
  scene: VariableScene,
  name: string,
  value: string,
  variant?: Variant,
): VariableScene {
  const exists = scene.variables.some((v) => v.name === name)
  const variables = exists
    ? scene.variables.map((v) =>
        v.name === name ? { ...v, value, variant, changed: true } : { ...v, changed: false },
      )
    : [...scene.variables, { name, value, variant, changed: true }]
  return { variables }
}
