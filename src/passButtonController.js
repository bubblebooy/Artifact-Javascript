import {game} from './index.js'

const passButtonController = (() => {
  const bottomPassButton = document.getElementById("pass-btn-bottom");
  const topPassButton = document.getElementById("pass-btn-top");

  const enable = () => {
    game.getTurn() ? topPassButton.disabled = false : bottomPassButton.disabled = false;
    game.getTurn() ? bottomPassButton.disabled = true : topPassButton.disabled = true;
  };
  const disable = () => {
    bottomPassButton.disabled = true;
    topPassButton.disabled = true;
  };
  const hide = () => {
    bottomPassButton.classList.add('display-none');
    topPassButton.classList.add('display-none');
  };
  const show = () => {
    bottomPassButton.classList.remove('display-none');
    topPassButton.classList.remove('display-none');
  };
  hide();
  setTimeout(function(){
    bottomPassButton.onclick = game.pass;
    topPassButton.onclick = game.pass;
  },100)

  return {enable , disable, hide, show}
})();

export default passButtonController;
