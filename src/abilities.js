import {game , cardData, posAvail} from './index.js'
import {board} from './board'
import {sum} from './arrayFunctions'

let abilityMap = new Map()  // should i just be uisng an object instead? does it really matter?
let triggerMap = new Map()

function doubleTarget(card, currentTarget, target, callback, conditional = true ){
  let abilityIndex = card.Abilities.findIndex(function(p){ console.log(p.div , currentTarget) ;return p.div == currentTarget})
  card.Abilities[abilityIndex].div.classList.add("glow")
  game.div.addEventListener("click",function f(ev){
    ev.stopPropagation()
    vaild: {
      let lane = ev.path.find(function(p){if (p.classList) return p.classList.contains('lane')}); if (lane == undefined) break vaild;
      lane = board.lanes.find(function(p){return p.div == lane})
      let player
      if (target == "card" || target == "empty"){
        player = ev.path.find(function(p){if (p.classList) return p.classList.contains('playarea')}); if (player == undefined) break vaild;
        player = lane.playAreas.findIndex(function(p){return p == player})
      } else if (target == "tower"){
        player = ev.path.find(function(p){if (p.classList) return p.classList.contains('tower')}); if (player == undefined) break vaild;
        player = lane.towers.findIndex(function(p){return p.div == player})
      }
      if (target == "card"){
        target = ev.path.find(function(p){if (p.classList) return p.classList.contains('card')}); if (target == undefined) break vaild;
        target = lane.cards.findIndex(function(p){return p[player].div == target})
      }else if (target == "empty"){
        target = ev.path.find(function(p){if (p.classList) return p.classList.contains('blank')}); if (target == undefined) break vaild;
        target = lane.cards.findIndex(function(p){return p[player].div == target})
      }else if (target == "tower"){target = player}
      if (conditional(lane,player,target)){
        callback(lane,player,target)
        card.Abilities[abilityIndex].currentCooldown = card.Abilities[abilityIndex].Cooldown;
        card.updateDisplay()
        game.nextTurn()
      }
    }
    card.Abilities[abilityIndex].div.classList.remove("glow")
    game.div.removeEventListener("click",f,true)
  },true)
}
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

triggerMap.set("Steam Cannon : Effect" , "click")
abilityMap.set("Steam Cannon : Effect" , function(card,e){
  doubleTarget(card, e.currentTarget, "card", function(lane,player,targetCard){
    lane.cards[targetCard][player].currentHealth[0] -= 4 - (sum(lane.cards[targetCard][player].currentArmor) < 0 ? sum(lane.cards[targetCard][player].currentArmor) : 0)
    lane.collapse()
  } , function(){return true})
  return false
});

triggerMap.set("Keenfolk Turret : Effect" , "click")
abilityMap.set("Keenfolk Turret : Effect" , function(card,e){
  doubleTarget(card, e.currentTarget, "card", function(lane,player,targetCard){
    lane.cards[targetCard][player].currentHealth[0] -= 2 - (sum(lane.cards[targetCard][player].currentArmor) < 0 ? sum(lane.cards[targetCard][player].currentArmor) : 0)
    lane.collapse()
  } , function(lane,player,targetCard){
    return lane == board.lanes[game.getCurrentLane()]
  })
  return false
});

//// creeps
triggerMap.set("Assassin's Apprentice : Effect" , "click")
abilityMap.set("Assassin's Apprentice : Effect" , function(card,e){
  let lane = board.lanes[game.getCurrentLane()]
  let player = game.getTurn()
  let index = lane.cards.findIndex(function(c){ return (c[player] == card) })
  doubleTarget(card, e.currentTarget, "card", function($lane,$player,$targetCard){
    card.arrow = $targetCard - index
  } , function($lane,$player,$targetCard){
    return ( $lane == board.lanes[game.getCurrentLane()] && player != $player && Math.abs($targetCard - index) <= 1)
  })
  return false
});

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

triggerMap.set("Satyr Magician : Effect" , "click")
abilityMap.set("Satyr Magician : Effect" , function(card,e){
  let lane = board.lanes[game.getCurrentLane()]
  let tower = lane.towers[game.getTurn()]
  tower.mana[0] = tower.mana[1]
  tower.updateDisplay()
  return true
});

triggerMap.set("Disciple of Nevermore : Effect" , "continuousEffect")
abilityMap.set("Disciple of Nevermore : Effect" , function(card,e){
  let lane = board.lanes[e.detail.lane]
  lane.cards.forEach(function(card){
    if (card[e.detail.player].Name != null && lane.cards[e.detail.card] != card) {
      card[e.detail.player].currentArmor[4] -= 2
      card[e.detail.player].currentAttack[4] += 2
      card[e.detail.player].updateDisplay()
    }
  })
});

triggerMap.set("Ravenous Mass : Effect" , "click")
abilityMap.set("Ravenous Mass : Effect" , function(card,e){
  let lane = board.lanes[game.getCurrentLane()]
  let player = game.getTurn()
  let index = lane.cards.findIndex(function(c){ return (c[player] == card) })
  for (var i = -1; i < 2; i+=2) {
    if(lane.cards[index+i] != null && lane.cards[index+i][player].Name != null){
      card.currentAttack[1] += sum(lane.cards[index+i][player].currentAttack)
      card.currentHealth[1] += sum(lane.cards[index+i][player].currentHealth)
      game.condemn(lane.cards[index+i][player],lane)
    }
  }
  lane.collapse()
  return true
});

triggerMap.set("Rampaging Hellbear : Effect" , "afterCombat")
abilityMap.set("Rampaging Hellbear : Effect" , function(card,e){
  card.currentAttack[1] += 4
  card.updateDisplay()
});

triggerMap.set("Satyr Duelist : Effect" , "afterCombat")
abilityMap.set("Satyr Duelist : Effect" , function(card,e){
  card.currentAttack[1] += 2
  card.updateDisplay()
});

triggerMap.set("Savage Wolf : Effect" , "afterCombat")
abilityMap.set("Savage Wolf : Effect" , function(card,e){
  card.currentAttack[1] += 1
  card.currentHealth[1] += 2
  card.updateDisplay()
});

triggerMap.set("Selfish Cleric : Effect" , "afterCombat")
abilityMap.set("Selfish Cleric : Effect" , function(card,e){
    card.currentHealth[0] = card.Health
  card.updateDisplay()
});

triggerMap.set("Revtel Convoy : Effect" , "continuousEffect")
abilityMap.set("Revtel Convoy : Effect" , function(card,e){
  let x = Math.floor(card.player.gold / 2)
  card.currentAttack[4] += x
  card.updateDisplay()
});






export {abilityMap,triggerMap};
