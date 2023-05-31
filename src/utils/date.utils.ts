import { subDays, isSameDay } from 'date-fns'

export function getBestSequenceOfDateInArray(array: Date[]) {
  let bestSequence = 1
  let currentSequence = 1
  for (let i = 0; i < array.length; i++) {
    const date = array[i]
    const nextDate = array[i + 1]

    if (!nextDate) return bestSequence

    if (isSameDay(date, nextDate)) continue

    const isNextDay = isSameDay(date, subDays(nextDate, 1))

    if (!isNextDay) {
      currentSequence = 0
      continue
    }

    currentSequence++

    if (currentSequence > bestSequence) {
      bestSequence = currentSequence
    }
  }

  return bestSequence
}
