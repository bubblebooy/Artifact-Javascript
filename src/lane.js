import {game, posAvail} from './index'
import {blank} from './card'
const lane = (lane) => {
  let passCount = 0;
  // let name;
  let div;
  let towerTop;// = tower(40,1);
  let towerBottom;// = tower(40,0);
  let towers = [towerBottom,towerTop];
  let playAreaTop;
  let playAreaBottom;
  let playAreas = [playAreaBottom,playAreaTop]
  let stages = []
  let cards = []

  const collapse = (refresh = true) => {
    let loop = false
    cards.forEach(function(row,index){
      row.forEach(function(unit, side) {
        if (unit.Name != null && cards[index + unit.arrow][1 - side].Name == null){
          unit.arrow = 0;
        }
      })
    })
    cards.forEach(function(row, index){
      if (row[0].Name == null && row[1].Name == null){
        loop = true
        row[0].div.parentNode.removeChild(row[0].div);
        row[1].div.parentNode.removeChild(row[1].div);
        cards.splice(index, 1)
       };
    })
    if (loop) {  // there is prob a better way
      collapse(refresh)
    }else if (refresh){
      game.dispatchEvent("continuousRefresh")
    }
  }

  const expand = () => {
        if (cards.reduce(posAvail , [[],[]])[game.getTurn()].length == 0){
          let emptyRight = [blank(lane,playAreas[0],cards.length),blank(lane,playAreas[1],cards.length)]
          let emptyLeft = [blank(lane,playAreas[0],0),blank(lane,playAreas[1],0)]
          cards.push(emptyRight)
          cards.unshift(emptyLeft)
        }
  }
  return {name, div, cards, towers, playAreas, stages, passCount, collapse, expand};
};

export {lane};
