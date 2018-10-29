import {lane} from './lane'
import {game} from './index'

const board = (() => {
  const div = document.getElementById('board');
  const lanes = [lane(0),lane(1),lane(2)]
  const collapse = () => {
    board.lanes.forEach(function(lane){
      lane.collapse(false)
    })
    game.dispatchEvent("continuousRefresh")
  }
  return {div, lanes, collapse}
})();

export {board}



// const collapse = () => {
//   let loop = false
//   board.lanes.forEach(function(lane){
//     lane.cards.forEach(function(row,index){
//       row.forEach(function(unit, side) {
//         if (unit.Name != null && lane.cards[index + unit.arrow][1 - side].Name == null){
//           unit.arrow = 0;
//         }
//       })
//     })
//     lane.cards.forEach(function(row, index){
//       if (row[0].Name == null && row[1].Name == null){
//         loop = true
//         row[0].div.parentNode.removeChild(row[0].div);
//         row[1].div.parentNode.removeChild(row[1].div);
//         lane.cards.splice(index, 1)
//        };
//     })
//   })
//   if (loop) {  // there is prob a better way
//     collapse()
//   }else{
//     game.dispatchEvent("continuousRefresh")
//   }
// }
