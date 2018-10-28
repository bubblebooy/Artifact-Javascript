import {game , board, cardData, posAvail} from './index.js'


let abilityMap = new Map() // should i just be uisng an object instead? does it really matter?
let triggerMap = new Map()

abilityMap.set("testAbility" , function(){
  console.log("testAbility")
});

triggerMap.set("Pack Leadership" , "continuousEffect")
abilityMap.set("Pack Leadership" , function(card){
  let player = (card.player == game.players[0]) ? 0: 1;
  board.lanes.forEach(function(lane){
    let index  = lane.cards.findIndex(function(row){return card == row[player]})
    if (index != -1){
      for (var i = -1; i < 2; i+=2) {
        // console.log(lane.cards[index] )
        if(lane.cards[index+i] != null && lane.cards[index+i][player].Name != null){
          lane.cards[index+i][player].currentArmor[4] += 1;
          lane.cards[index+i][player].updateDisplay()
        }
      }
    }
  })
});

triggerMap.set("Wisdom of the Elders" , "click")
abilityMap.set("Wisdom of the Elders" , function(card){
  console.log("Wisdom of the Elders")
});

triggerMap.set("Work the Knife" , "whenAttacking")
abilityMap.set("Work the Knife" , function(card){
  // console.log("Work the Knife")
});

triggerMap.set("Arcane Aura" , "afterCardPlayed")
abilityMap.set("Arcane Aura" , function(card){
  // console.log("Arcane Aura")
});




export {abilityMap,triggerMap};
