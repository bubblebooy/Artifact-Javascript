import {game , cardData, posAvail} from './index.js'
import {board} from './board'
import {sum} from './arrayFunctions'

let abilityMap = new Map()  // should i just be uisng an object instead? does it really matter?
let triggerMap = new Map()

abilityMap.set("testAbility" , function(){
  console.log("testAbility")
});

///Heros

triggerMap.set("Pack Leadership" , "continuousEffect")
abilityMap.set("Pack Leadership" , function(card,e){
  for (var i = -1; i < 2; i+=2) {
    let lane = board.lanes[e.detail.lane]
    let index = e.detail.card
    if(lane.cards[index+i] != null && lane.cards[index+i][e.detail.player].Name != null){
      lane.cards[index+i][e.detail.player].currentArmor[4] += 1;
      lane.cards[index+i][e.detail.player].updateDisplay()
    }
  }
});

triggerMap.set("Wisdom of the Elders" , "click")
abilityMap.set("Wisdom of the Elders" , function(card,e){
  console.log("Wisdom of the Elders")
});

triggerMap.set("Work the Knife" , "whenAttacking")
abilityMap.set("Work the Knife" , function(card,e){
  let lane = board.lanes[e.detail.lane]
  let index = e.detail.card + card.arrow
  if(lane.cards[index] != null && lane.cards[index][1 - e.detail.player].Name != null){
    if (lane.cards[index][1 - e.detail.player].CardType == "Creep") return;
  }
  card.currentAttack[4] += 2;
});


triggerMap.set("Arcane Aura" , "afterCardPlayed")
abilityMap.set("Arcane Aura" , function(card,e){
  // console.log("Arcane Aura")
});


//// improvements

triggerMap.set("Conflagration : Effect" , "beforeTheActionPhase")
abilityMap.set("Conflagration : Effect" , function(card,e){
  let lane = board.lanes[e.detail.lane]
  lane.cards.forEach(function(card){
    if (card[1-e.detail.player].Name != null) {
      card[1-e.detail.player].currentHealth[0] -= 2 - sum(card[1-e.detail.player].currentArmor)
    }
  })
  lane.collapse()
});

triggerMap.set("Burning Oil : Effect" , "continuousEffect")
abilityMap.set("Burning Oil : Effect" , function(card,e){
  // console.log("Burning Oil : Effect")
});

//// creeps

export {abilityMap,triggerMap};
