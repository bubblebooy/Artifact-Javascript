import {game} from './index.js'

const handController = (() => {

  let hands = [];
  let divs = [];
  const initialize = () => {
    hands = [game.players[0].hand,game.players[1].hand]
    divs = [game.players[0].handDiv,game.players[1].handDiv]
   };
  const disable = () => {
    for (var i = 0; i < hands.length; i++) {
      hands[i].forEach(function(card){
        card.div.draggable = false;
      })
    }
  };
  const enable = () => {
    hands[game.getTurn()].forEach(function(card){
      card.div.draggable = true;
    });
    hands[1-game.getTurn()].forEach(function(card){
      card.div.draggable = false;
    })
  };
  const hide = () => {
    for (var i = 0; i < hands.length; i++) {
      divs[i].classList.add("hide")
    }
  };
  const show = () => {
    for (var i = 0; i < hands.length; i++) {
      divs[i].classList.remove("hide")
    }
  };


  return {initialize, enable , disable, hide, show}
})();
export default handController;
