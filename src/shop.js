import {game , cardData, itemDeck, secretShopDeck} from './index.js'
import {deployment} from './deploy.js'
import {sum, shuffle} from './arrayFunctions'
import {card} from './card'

//shops only works for player 0

const shop = (() => {
  const div = document.getElementById("shop");
  const secretShopShop = document.getElementById("secret-shop");
  const itemShop = document.getElementById("item-deck");
  const consumableShop = document.getElementById("consumables");


  const closeButton = document.createElement('button')
  closeButton.innerHTML = "Done"
  closeButton.classList.add("close-btn" , "btn")
  closeButton.type="submit"
  div.appendChild(closeButton)

  // let itemDeck = ["Demagicking Maul","Stonehall Plate","Stonehall Cloak","Leather Armor","Short Sword","Traveler's Cloak","Leather Armor","Short Sword","Traveler's Cloak"]
  let item
  let consumableDeck = ["Healing Salve","Town Portal Scroll","Fountain Flask","Potion of Knowledge"]
  // let secretShopDeck = ["Demagicking Maul","Stonehall Plate","Stonehall Cloak","Leather Armor","Short Sword","Traveler's Cloak","Blade of the Vigil","Keenfolk Musket","Red Mist Maul","Shield of Basilius","Horn of the Alpha","Phase Boots","Ring of Tarrasque"]

  closeButton.addEventListener("click",function(){
    div.classList.add('display-none');
    if (secretShopShop.firstChild) secretShopShop.removeChild(secretShopShop.firstChild)
    itemDeck.push(item.Name)
    item = null
    if (itemShop.firstChild) itemShop.removeChild(itemShop.firstChild)
    if (consumableShop.firstChild) consumableShop.removeChild(consumableShop.firstChild)
    deployment();
  })

  const draw = (deck , depleting = false) => {
    let c
    if (depleting) deck = shuffle(deck)
    c = depleting ? deck.shift() : deck[Math.floor(Math.random() * deck.length)]
    if (c != null){
      let newCard = card(cardData.Cards.find(function(e){
        return e.Name == c
      }),game.players[0])
      newCard.div.addEventListener("click", function buy(e) {
        if (game.players[0].gold >= newCard.GoldCost){
          game.players[0].gold -= newCard.GoldCost
          game.infoDisplayUpdate()
          game.players[0].hand.push(newCard)
          game.players[0].handDiv.appendChild(newCard.div)
          if (depleting) {
            item = draw(itemDeck,true)
            if (item) itemShop.appendChild(item.div)
          }
          newCard.div.removeEventListener("click", buy)
        }
      })
      return newCard
    }
    return false
  }

  const show = () => {
    item = draw(itemDeck,true)
    let consumable = draw(consumableDeck)
    let secretShop = draw(secretShopDeck)
    secretShopShop.appendChild(secretShop.div)
    if (item) itemShop.appendChild(item.div)
    consumableShop.appendChild(consumable.div)
    div.classList.remove('display-none');
    closeButton.focus();
  };
  return {show}
})();

export default shop;
