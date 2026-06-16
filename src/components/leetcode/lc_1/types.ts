export type Event =
  | {
      type: 'start'
    }
  | {
      type: 'check'

      index: number

      value: number

      need: number
    }
  | {
      type: 'insert'

      value: number

      index: number
    }
  | {
      type: 'found'

      left: number

      right: number
    }
