import {game} from './index.js'



const infoDisplay = (() => {
  const goldDiv = [];
  const div = [document.getElementById("info-bottom"),document.getElementById("info-top")]
  game.players.forEach(function(player, i){
    div[i].classList.remove("display-none")
    div[i].getElementsByClassName('name')[0].textContent = `${player.name}`
    goldDiv.push(div[i].getElementsByClassName('gold')[0])
    goldDiv[i].textContent = player.gold
  })


  const updateDisplay = () => {
    game.players.forEach(function(player, i){
      goldDiv[i].textContent = player.gold
    })
  }
  return{updateDisplay}
});

export default infoDisplay;
