import {game , cardData, posAvail} from './index.js'
import {board} from './board'
import {card , blank, draggedCard} from './card'


let effectMap = new Map()  // should i just be uisng an object instead? does it really matter?
let targetMap = new Map()


// Targerts : lane, unit, improvement

targetMap.set("Dimensional Portal" , "lane")
effectMap.set("Dimensional Portal" , function(ev, lane){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 3; i++){
    let creep = card(cardData.Cards[132],game.players[game.getTurn()])
    summons[game.getTurn()].push(creep);
  }
  lane.summon(summons)
  return true
});

targetMap.set("Better Late Than Never" , "lane")
effectMap.set("Better Late Than Never" , function(ev, lane){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 1; i++){
    let creep = card(cardData.Cards[132],game.players[game.getTurn()])
    summons[game.getTurn()].push(creep);
  }
  lane.summon(summons)
  return true
});

targetMap.set("Call the Reserves" , "lane")
effectMap.set("Call the Reserves" , function(ev, lane){
  let summons = [[],[]]
  lane = board.lanes[lane]
  for (let i = 0; i < 2; i++){
    let creep = card(cardData.Cards[132],game.players[game.getTurn()])
    summons[game.getTurn()].push(creep);
  }
  lane.summon(summons)
  return true
});


targetMap.set("Iron Branch Protection" , "unit")
effectMap.set("Iron Branch Protection" , function(ev, lane, player, index){
  board.lanes,board.lanes[lane].cards[index][player].currentArmor[5] += 3;
  board.lanes,board.lanes[lane].cards[index][player].updateDisplay()
  return true
});

targetMap.set("Avernus' Blessing" , "unit")
effectMap.set("Avernus' Blessing" , function(ev, lane, player, index){
  board.lanes,board.lanes[lane].cards[index][player].currentAttack[1 + (1 - player == game.getTurn())] += 2;
  board.lanes,board.lanes[lane].cards[index][player].updateDisplay()
  return true
});


export {effectMap,targetMap};
