import {game , cardData, posAvail} from './index.js'
import {card , blank, draggedCard} from './card'
import {board} from './board'
import {sum} from './arrayFunctions'

let abilityMap = new Map()  // should i just be uisng an object instead? does it really matter?
let triggerMap = new Map()

function doubleTarget(card, currentTarget, target, callback, conditional = true ){
  let abilityIndex = card.Abilities.findIndex(function(p){ console.log(p.div , currentTarget) ;return p.div == currentTarget})
  card.Abilities[abilityIndex].div.classList.add("glow")
  game.div.classList.add("target")
  game.div.addEventListener("click",function f(ev){
    ev.stopPropagation()
    let path = ev.path || (ev.composedPath && ev.composedPath());
    if (!path) {console.log("no path")}
    vaild: {
      let lane = path.find(function(p){if (p.classList) return p.classList.contains('lane')}); if (lane == undefined) break vaild;
      lane = board.lanes.find(function(p){return p.div == lane})
      let player
      if (target == "card" || target == "empty"){
        player = path.find(function(p){if (p.classList) return p.classList.contains('playarea')}); if (player == undefined) break vaild;
        player = lane.playAreas.findIndex(function(p){return p == player})
      } else if (target == "tower"){
        player = path.find(function(p){if (p.classList) return p.classList.contains('tower')}); if (player == undefined) break vaild;
        player = lane.towers.findIndex(function(p){return p.div == player})
      }
      if (target == "card"){
        target = path.find(function(p){if (p.classList) return p.classList.contains('card')}); if (target == undefined) break vaild;
        target = lane.cards.findIndex(function(p){return p[player].div == target})
      }else if (target == "empty"){
        target = path.find(function(p){if (p.classList) return p.classList.contains('blank')}); if (target == undefined) break vaild;
        target = lane.cards.findIndex(function(p){return p[player].div == target})
      }else if (target == "tower"){target = player}
      if (conditional(lane,player,target)){
        callback(lane,player,target)
        card.Abilities[abilityIndex].currentCooldown = card.Abilities[abilityIndex].Cooldown;
        card.updateDisplay()
        game.nextTurn()
      }
    }
    game.div.classList.remove("target")
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

triggerMap.set("Call of the Wild" , "click")
abilityMap.set("Call of the Wild" , function(c,e){
  let summons = [[],[]]
  let lane = board.lanes[game.getCurrentLane()]
  let creep =  card(cardData.Cards.find( function(ev){  return ev.Name == "Loyal Beast" }),game.players[game.getTurn()])
  summons[game.getTurn()].push(creep);
  lane.summon(summons)
  return true
});


triggerMap.set("Arcane Aura" , "afterCardPlayed")
abilityMap.set("Arcane Aura" , function(card,e){
  // console.log("Arcane Aura")
});

triggerMap.set("Return" , "continuousEffect")
abilityMap.set("Return" , function(card,e){
  card.retaliate[4] += 2;
});

triggerMap.set("Moment of Courage" , "continuousEffect")
abilityMap.set("Moment of Courage" , function(card,e){
  card.retaliate[4] += 2;
});


triggerMap.set("Concussive Shot" , "click")
abilityMap.set("Concussive Shot" , function(card,e){
  doubleTarget(card, e.currentTarget, "card", function(lane,player,targetCard){
    lane.cards[targetCard][player].currentArmor[3] -= 2
    lane.cards[targetCard][player].updateDisplay()
    if (lane.cards[targetCard -1 ] != null || lane.cards[targetCard -1 ][player].Name != null){
      lane.cards[targetCard -1 ][player].currentArmor[3] -= 2
      lane.cards[targetCard-1][player].updateDisplay()
    }
    if (lane.cards[targetCard +1 ] != null || lane.cards[targetCard +1 ][player].Name != null){
      lane.cards[targetCard +1 ][player].currentArmor[3] -= 2
      lane.cards[targetCard+1][player].updateDisplay()
    }
  } , function(lane,player,targetCard){
    return lane == board.lanes[game.getCurrentLane()]
  })
  return false
});

triggerMap.set("Nature's Attendants" , "continuousEffect")
abilityMap.set("Nature's Attendants" , function(card,e){
  card.regen[4] += 2;
  card.updateDisplay();
  for (var i = -1; i < 2; i+=2) {
    let lane = board.lanes[e.detail.lane]
    let index = e.detail.card
    if(lane.cards[index+i] != null && lane.cards[index+i][e.detail.player].Name != null){
      lane.cards[index+i][e.detail.player].regen[4] += 2;
      lane.cards[index+i][e.detail.player].updateDisplay()
    }
  }
});


triggerMap.set("Branches of Iron" , "continuousEffect")
abilityMap.set("Branches of Iron" , function(card,e){
  for (var i = -1; i < 2; i+=2) {
    let lane = board.lanes[e.detail.lane]
    let index = e.detail.card
    if(lane.cards[index+i] != null && lane.cards[index+i][e.detail.player].Name != null){
      lane.cards[index+i][e.detail.player].currentArmor[4] += 2;
      lane.cards[index+i][e.detail.player].updateDisplay()
    }
  }
});

triggerMap.set("Feral Impulse" , "continuousEffect")
abilityMap.set("Feral Impulse" , function(card,e){
  for (var i = -1; i < 2; i+=2) {
    let lane = board.lanes[e.detail.lane]
    let index = e.detail.card
    if(lane.cards[index+i] != null && lane.cards[index+i][e.detail.player].Name != null){
      lane.cards[index+i][e.detail.player].currentAttack[4] += 2;
      lane.cards[index+i][e.detail.player].updateDisplay()
    }
  }
});

triggerMap.set("Arctic Burn" , "afterCardPlayed")
abilityMap.set("Arctic Burn" , function(card,e){
  let lane = board.lanes[game.getCurrentLane()]
  let player = game.getTurn()
  let index = lane.cards.findIndex(function(c){ return (c[player] == card) })
  doubleTarget(card, e.currentTarget, "empty", function($lane,$player,$targetCard){
    card.currentAttack[3] += 4;
    let nextSibling = index > $targetCard ? card.div.nextSibling : $lane.cards[$targetCard][$player].div.nextSibling
    index > $targetCard ? $lane.cards[$targetCard][$player].div.parentNode.insertBefore(card.div,$lane.cards[$targetCard][$player].div) : card.div.parentNode.insertBefore($lane.cards[$targetCard][$player].div,card.div)
    index > $targetCard ? card.div.parentNode.insertBefore($lane.cards[$targetCard][$player].div, nextSibling) : $lane.cards[$targetCard][$player].div.parentNode.insertBefore(card.div,nextSibling)
    let temp = $lane.cards[$targetCard][$player]
    $lane.cards[$targetCard][$player] = lane.cards[index][player]
    lane.cards[index][player] = temp
    if($lane.cards[$targetCard][1 - $player].Name != null){
        $lane.cards[$targetCard][1 - $player].arrow = 0;
        card.arrow = 0;
        $lane.cards[$targetCard][1 - $player].updateDisplay()
    }
    card.updateDisplay()
    lane.collapse()
  } , function($lane,$player,$targetCard){
    return ( $lane == lane && player == $player)
  })
  return false
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
        if(lane.cards[index + card[e.detail.player].arrow] == null || lane.cards[index + card[e.detail.player].arrow][1 - e.detail.player].Name == null){
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

triggerMap.set("Altar of the Mad Moon : Effect" , "continuousEffect")
abilityMap.set("Altar of the Mad Moon : Effect" , function(card,e){
  let lane = board.lanes[e.detail.lane]
  lane.cards.forEach(function(card){
    if (card[e.detail.player].Name != null && card[e.detail.player].CardType == "Creep") {
      card[e.detail.player].regen[4] += 2
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
    return ( $lane == lane && player != $player && Math.abs($targetCard - index) <= 1)
  })
  return false
});

triggerMap.set("Sister of the Veil : Effect" , "click")
abilityMap.set("Sister of the Veil : Effect" , function(card,e){
  let lane = board.lanes[game.getCurrentLane()]
  let player = game.getTurn()
  let index = lane.cards.findIndex(function(c){ return (c[player] == card) })
  doubleTarget(card, e.currentTarget, "card", function($lane,$player,$targetCard){
    card.arrow = $targetCard - index
  } , function($lane,$player,$targetCard){
    return ( $lane == lane && player != $player && Math.abs($targetCard - index) <= 1)
  })
  return false
});

triggerMap.set("Rebel Decoy : Effect" , "click")
abilityMap.set("Rebel Decoy : Effect" , function(card,e){
  let lane = board.lanes[game.getCurrentLane()]
  let player = game.getTurn()
  let index = lane.cards.findIndex(function(c){ return (c[player] == card) })
  doubleTarget(card, e.currentTarget, "card", function($lane,$player,$targetCard){
    let nextSibling = index > $targetCard ? card.div.nextSibling : $lane.cards[$targetCard][$player].div.nextSibling
    index > $targetCard ? $lane.cards[$targetCard][$player].div.parentNode.insertBefore(card.div,$lane.cards[$targetCard][$player].div) : card.div.parentNode.insertBefore($lane.cards[$targetCard][$player].div,card.div)
    index > $targetCard ? card.div.parentNode.insertBefore($lane.cards[$targetCard][$player].div, nextSibling) : $lane.cards[$targetCard][$player].div.parentNode.insertBefore(card.div,nextSibling)
    let temp = $lane.cards[$targetCard][$player]
    $lane.cards[$targetCard][$player] = lane.cards[index][player]
    lane.cards[index][player] = temp
    if(lane.cards[index][1 - player].Name != null){
        lane.cards[index][player].arrow = 0
        lane.cards[index][player].updateDisplay()
    }
    if($lane.cards[$targetCard][1 - $player].Name != null){
        $lane.cards[$targetCard][$player].arrow = 0;
        $lane.cards[$targetCard][$player].updateDisplay()
    }
  } , function($lane,$player,$targetCard){
    return ( $lane == lane && player == $player)
  })
  return false
});

triggerMap.set("Troll Soothsayer : Effect" , "endOfRound")
abilityMap.set("Troll Soothsayer : Effect" , function(card,e){
  card.player.draw()
});

// triggerMap.set("Loyal Beast : Effect" , "endOfRound")
// abilityMap.set("Loyal Beast : Effect" , function(card,e){
//   let lane = board.lanes[e.detail.lane]
// });

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

triggerMap.set("Savage Wolf : Effect" , "afterCombat")
abilityMap.set("Savage Wolf : Effect" , function(card,e){
  card.currentAttack[1] += 1
  card.currentHealth[1] += 2
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

triggerMap.set("Thunderhide Pack : Effect" , "continuousEffect")
abilityMap.set("Thunderhide Pack : Effect" , function(card,e){
  card.siege[4] += 6
  card.updateDisplay()
});

triggerMap.set("Emissary of the Quorum : Effect" , "click")
abilityMap.set("Emissary of the Quorum : Effect" , function(card,e){
  let lane = board.lanes[game.getCurrentLane()]
  let player = game.getTurn()
  // let index = lane.cards.findIndex(function(c){ return (c[player] == card) })
  lane.cards.forEach(function(card){
    if (card[player].Name != null) {
      card[player].currentAttack[1] += 2
      card[player].currentHealth[1] += 2
      card[player].updateDisplay()
    }
  })
  return true
});

// Items

triggerMap.set("Leather Armor : Effect" , "continuousEffect")
abilityMap.set("Leather Armor : Effect" , function(card,e){
  //let lane = board.lanes[e.detail.lane]; let index = e.detail.card; lane.cards[index][e.detail.player]
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  $card.currentArmor[4] += 1
  $card.updateDisplay()
});

triggerMap.set("Traveler's Cloak : Effect" , "continuousEffect")
abilityMap.set("Traveler's Cloak : Effect" , function(card,e){
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  $card.currentHealth[4] += 4
  $card.updateDisplay()
});

triggerMap.set("Short Sword : Effect" , "continuousEffect")
abilityMap.set("Short Sword : Effect" , function(card,e){
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  $card.currentAttack[4] += 2
  $card.updateDisplay()
});

triggerMap.set("Demagicking Maul : Effect" , "continuousEffect")
abilityMap.set("Demagicking Maul : Effect" , function(card,e){
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  $card.currentAttack[4] += 2
  $card.updateDisplay()
});

triggerMap.set("Demagicking Maul : EffectActive" , "click")
abilityMap.set("Demagicking Maul : EffectActive" , function(card,e){
  let lane = board.lanes[game.getCurrentLane()]
  let player = game.getTurn()
  let index = lane.cards.findIndex(function(c){ return (c[player].Weapon == card) })
  if (lane.cards[index + lane.cards[index][player].arrow][1 - player].Name == null){
    if (lane.improvements[1 - player].length){
      let improvment = Math.floor(Math.random()*lane.improvements[1 - player].length)
      improvment = lane.improvements[1 - player].splice(improvment)[0]
      improvment.div.parentNode.removeChild(improvment.div)
      return true
    }
  }
  return false
});

triggerMap.set("Stonehall Plate : Effect" , "continuousEffect")
abilityMap.set("Stonehall Plate : Effect" , function(card,e){
  if (!card.stonehall){
    card.div.addEventListener("afterCombat", function(){card.Armor = card.Armor || 1 ; card.Armor += 1})
    card.stonehall = true
  }
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  card.Armor = card.Armor || 1
  $card.currentArmor[4] += card.Armor
  $card.updateDisplay()
});

triggerMap.set("Stonehall Cloak : Effect" , "continuousEffect")
abilityMap.set("Stonehall Cloak : Effect" , function(card,e){
  if (!card.stonehall){
    card.div.addEventListener("afterCombat", function(){card.Health = card.Health || 4 ; card.Health += 2})
    card.stonehall = true
  }
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  card.Health = card.Health || 4
  $card.currentHealth[4] += card.Health
  $card.updateDisplay()
});

triggerMap.set("Blade of the Vigil : Effect" , "continuousEffect")
abilityMap.set("Blade of the Vigil : Effect" , function(card,e){
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  $card.currentAttack[4] += 2
  $card.cleave[4] += 2
  $card.updateDisplay()
});

triggerMap.set("Keenfolk Musket : Effect" , "continuousEffect")
abilityMap.set("Keenfolk Musket : Effect" , function(card,e){
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  $card.currentAttack[4] += 2
  $card.updateDisplay()
});

triggerMap.set("Keenfolk Musket : EffectActive" , "click")
abilityMap.set("Keenfolk Musket : EffectActive" , function(card,e){
  // let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  doubleTarget(card, e.currentTarget, "card", function(lane,player,targetCard){
    lane.cards[targetCard][player].currentHealth[0] -= 2 - sum(lane.cards[targetCard][player].currentArmor)
    lane.collapse()
  } , function(lane,player,targetCard){
    return lane == board.lanes[game.getCurrentLane()]
  })
  return false
});

triggerMap.set("Red Mist Maul : Effect" , "continuousEffect")
abilityMap.set("Red Mist Maul : Effect" , function(card,e){
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  $card.currentAttack[4] += 2
  $card.siege[4] += 5
  $card.updateDisplay()
});

triggerMap.set("Shield of Basilius : Effect" , "continuousEffect")
abilityMap.set("Shield of Basilius : Effect" , function(card,e){
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  $card.currentArmor[4] += 2
  $card.updateDisplay()
  for (var i = -1; i < 2; i+=2) {
    let lane = board.lanes[e.detail.lane]
    let index = e.detail.card
    if(lane.cards[index+i] != null && lane.cards[index+i][e.detail.player].Name != null){
      lane.cards[index+i][e.detail.player].currentArmor[4] += 1;
      lane.cards[index+i][e.detail.player].updateDisplay()
    }
  }
});

triggerMap.set("Horn of the Alpha : Effect" , "continuousEffect")
abilityMap.set("Horn of the Alpha : Effect" , function(card,e){
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  $card.currentHealth[4] += 4
  $card.updateDisplay()
});
triggerMap.set("Horn of the Alpha : EffectActive" , "click")
abilityMap.set("Horn of the Alpha : EffectActive" , function(c,e){
  let summons = [[],[]]
  let lane = board.lanes[game.getCurrentLane()]
  let creep =  card(cardData.Cards.find( function(ev){  return ev.Name == "Thunderhide Pack" }),game.players[game.getTurn()])
  summons[game.getTurn()].push(creep);
  lane.summon(summons)
  return true
});

triggerMap.set("Ring of Tarrasque : Effect" , "continuousEffect")
abilityMap.set("Ring of Tarrasque : Effect" , function(card,e){
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  $card.currentHealth[4] += 4
  $card.regen[4] += 6
  $card.updateDisplay()
});

triggerMap.set("Phase Boots : Effect" , "continuousEffect")
abilityMap.set("Phase Boots : Effect" , function(card,e){
  let $card = board.lanes[e.detail.lane].cards[e.detail.card][e.detail.player]
  $card.currentHealth[4] += 4
  $card.updateDisplay()
});
triggerMap.set("Phase Boots : EffectActive" , "click")
abilityMap.set("Phase Boots : EffectActive" , function(c,e){
  let lane = board.lanes[game.getCurrentLane()]
  let player = game.getTurn()
  let index = lane.cards.findIndex(function(card){ return (card[player].Accessory == c) })
  console.log(index)
  let card = lane.cards[index][player]
  doubleTarget(c, e.currentTarget, "card", function($lane,$player,$targetCard){
    let nextSibling = index > $targetCard ? card.div.nextSibling : $lane.cards[$targetCard][$player].div.nextSibling
    index > $targetCard ? $lane.cards[$targetCard][$player].div.parentNode.insertBefore(card.div,$lane.cards[$targetCard][$player].div) : card.div.parentNode.insertBefore($lane.cards[$targetCard][$player].div,card.div)
    index > $targetCard ? card.div.parentNode.insertBefore($lane.cards[$targetCard][$player].div, nextSibling) : $lane.cards[$targetCard][$player].div.parentNode.insertBefore(card.div,nextSibling)
    let temp = $lane.cards[$targetCard][$player]
    $lane.cards[$targetCard][$player] = lane.cards[index][player]
    lane.cards[index][player] = temp
    if(lane.cards[index][1 - player].Name != null){
        lane.cards[index][player].arrow = 0
        lane.cards[index][player].updateDisplay()
    }
    if($lane.cards[$targetCard][1 - $player].Name != null){
        $lane.cards[$targetCard][$player].arrow = 0;
        $lane.cards[$targetCard][$player].updateDisplay()
    }
  } , function($lane,$player,$targetCard){
    return ( $lane == lane && player == $player)
  })
  return false
});

// let lane = board.lanes[e.detail.lane]
// let index = e.detail.card
// lane.cards[index+i][e.detail.player]





export {abilityMap,triggerMap};
