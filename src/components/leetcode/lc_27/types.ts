export type Event =
  | {
      type: 'start'
      val: number
    }
  | {
      type: 'check'
      index: number
      value: number
      val: number
    }
  | {
      type: 'skip'
      index: number
    }
  | {
      type: 'move'
      from: number
      to: number
      value: number
    }
  | {
      type: 'done'
      k: number
    }
