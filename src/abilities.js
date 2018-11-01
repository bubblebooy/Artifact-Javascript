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
  card.player.draw();card.player.draw()
  return true
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

triggerMap.set("Ignite : Effect" , "beforeTheActionPhase")
abilityMap.set("Ignite : Effect" , function(card,e){
  let lane = board.lanes[e.detail.lane]
  lane.cards.forEach(function(card){
    if (card[1-e.detail.player].Name != null) {
      card[1-e.detail.player].currentHealth[0] -= 1 - (sum(card[1-e.detail.player].currentArmor) < 0 ? sum(card[1-e.detail.player].currentArmor) : 0)
    }
  })
  lane.collapse()
});

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

triggerMap.set("Assault Ladders : Effect" , "whenAttacking")
abilityMap.set("Assault Ladders : Effect" , function(card,e){
  let lane = board.lanes[e.detail.lane]
  lane.cards.forEach(function(card , index){
    if (card[e.detail.player].Name != null) {
        if(lane.cards[index + card.arrow] == null || lane.cards[index + card.arrow][1 - e.detail.player].Name == null){
          lane.cards[index][e.detail.player].currentAttack[4] += 2;
        }
    }
  })

});

triggerMap.set("Mist of Avernus : Effect" , "beforeTheActionPhase")
abilityMap.set("Mist of Avernus : Effect" , function(card,e){
  let lane = board.lanes[e.detail.lane]
  lane.cards.forEach(function(card){
    if (card[e.detail.player].Name != null) {
      card[e.detail.player].currentAttack[1] += 1
      card[e.detail.player].updateDisplay()
    }
  })
});

triggerMap.set("Verdant Refuge : Effect" , "continuousEffect")
abilityMap.set("Verdant Refuge : Effect" , function(card,e){
  let lane = board.lanes[e.detail.lane]
  lane.cards.forEach(function(card){
    if (card[e.detail.player].Name != null) {
      card[e.detail.player].currentArmor[4] += 1
      card[e.detail.player].updateDisplay()
    }
  })
});

//// creeps

triggerMap.set("Troll Soothsayer : Effect" , "endOfRound")
abilityMap.set("Troll Soothsayer : Effect" , function(card,e){
  card.player.draw()
});

triggerMap.set("Legion Standard Bearer : Effect" , "continuousEffect")
abilityMap.set("Legion Standard Bearer : Effect" , function(card,e){
  for (var i = -1; i < 2; i+=2) {
    let lane = board.lanes[e.detail.lane]
    let index = e.detail.card
    if(lane.cards[index+i] != null && lane.cards[index+i][e.detail.player].Name != null){
      lane.cards[index+i][e.detail.player].currentAttack[4] += 4;
      lane.cards[index+i][e.detail.player].updateDisplay()
    }
  }
});

triggerMap.set("Mercenary Exiles : Effect" , "click")
abilityMap.set("Mercenary Exiles : Effect" , function(card,e){
  let x = Math.floor(card.player.gold / 2)
  card.player.gold = 0
  card.currentAttack[1] += x
  card.currentHealth[1] += x
  card.updateDisplay()
  game.infoDisplayUpdate();
  return true
});

export {abilityMap,triggerMap};
