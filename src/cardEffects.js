import {game , cardData, posAvail} from './index.js'
import {board} from './board'
import {card , blank, draggedCard} from './card'


let effectMap = new Map()  // should i just be uisng an object instead? does it really matter?
let targetMap = new Map()


// Targerts : lane, creep, improvement

targetMap.set("Dimensional Portal" , "lane")
effectMap.set("Dimensional Portal" , function(player, lane, e){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 3; i++){
    let creep = card(cardData.Cards[132],game.players[player])
    summons[player].push(creep);
  }
  lane.summon(summons)
});


export {effectMap,targetMap};
