import {board} from '../board'

function getEnemyNeighbors(lane, player, index) {
  const currentLane = board.lanes[lane]
  return currentLane.cards
    .slice(Math.max(index - 1, 0), Math.min(index + 2, currentLane.cards.length))
    .map(function(row) {
      return row[(player + 1) % 2]
    })
    .filter(unit => unit && unit.Name)
}

export default getEnemyNeighbors;