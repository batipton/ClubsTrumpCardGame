const CLUBS = 0;
const SPADES = 1;
const DIAMONDS = 2;
const HEARTS = 3;
const JACK = 11;
const QUEEN = 12;
const KING = 13;
const ACE = 14;
const NONE = -1;
const PLAYERS = 4;
const SPEED = 500;

/**
 * Handles individual cards within the game. 
 */
class Card {
 
    constructor(suit, number, id) {
        this.suit = suit;
        this.number = number;
        this.url = this.getUrl(suit, number);
        this.id = id;
    }

    /**
     * Returns the url for the image of the card which is a local resource.
     * 
     * @return String url "Cards/card{suit}{value}.png"
     */
    getUrl(suit, number) {
        let valueString = this.getValueString(number);
        let suitString = this.getSuitString(suit);
        return ( "Cards/card" + suitString + valueString + ".png" );
    }
    
    /**
     * Gets the string representation of the suit number
     * 
     * @param {integer} suit the numerical code for the suit
     * @returns the string representation of the suit
     */
    getSuitString(suit) {
        let suitString = "";
        if(suit == CLUBS) {
            suitString = "Clubs";
        } else if (suit == SPADES) {
            suitString = "Spades";
        } else if (suit == DIAMONDS) {
            suitString = "Diamonds";
        } else if (suit == HEARTS) {
            suitString = "Hearts";
        }
        return suitString;
    }

    /**
     * Gets the string representation of the face value
     * 
     * @param {integer} number the numerical code for the face value
     * @returns the string representation of the face value
     */
    getValueString(number) {
        let valueString = "";
        if(number <= 10) {
            valueString = number
        } else if (number == JACK) {
            valueString = "J";
        } else if (number == QUEEN) {
            valueString = "Q";
        } else if (number == KING) {
            valueString = "K";
        } else if (number == ACE) {
            valueString = "A";
        }
        return valueString;
    }

    /**
     * Returns 1 if card1 > card2. -1 otherwise. If card2 = {} then this method will automatically return 1 (card1 winning).
     * 
     * @param {Card} card1 
     * @param {Card} card2 
     * @param {integer} lead 
     */
    static compare(card1, card2, lead) {
        if(!card2) {
            return 1;
        }

        if (card1.suit == CLUBS || card2.suit == CLUBS) {
            if (card1.suit == CLUBS && card2.suit == CLUBS) {
              return card1.number > card2.number ? 1 : -1;
            }
            return card1.suit == CLUBS ? 1 : -1;
          }
          
          if (card1.suit == lead || card2.suit == lead) {
            if (card1.suit == lead && card2.suit == lead) {
              return card1.number > card2.number ? 1 : -1;
            }
            return card1.suit == lead ? 1 : -1;
          }
          
          return card1.number > card2.number ? 1 : -1;
    }
}

/**
 * A deck of cards.
 */
class Deck {
    constructor() {
        this.cards = [];
        for(let i = 2; i <= ACE; i++) {
            this.cards.push(new Card(CLUBS, i, i*4 + 0));
            this.cards.push(new Card(SPADES, i, i*4 + 1));
            this.cards.push(new Card(DIAMONDS, i, i*4 + 2));
            this.cards.push(new Card(HEARTS, i, i*4 + 3));
        }
    }

    /**
     * Draws {num} cards from the deck. Drawn cards are removed from the deck.
     * 
     * @param {integer} num 
     * @returns drawn cards.
     */
    draw(num) {
        return this.cards.splice(0, num);
    }

    /**
     * Shuffles the cards in the deck.
     */
     shuffle() {
        for(let i = 0; i < this.cards.length; i++) {
            let j = Math.floor(Math.random() * this.cards.length);
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }
}

/**
 * A player in the game.
 */
class Player {
    constructor(isHuman, name="human", id) {
        this.isHuman = isHuman;
        this.name = name;
        this.hand = [];
        this.tricks = 0;
        this.points = 0;
        this.bid = 0;
        this.id = id;
    }

    /**
     * Sets the player's hand to be cards
     * 
     * @param {Array of Card} cards 
     */
    setHand(cards) {
        this.hand = cards;
    }

    /**
     * Sets the player's bid to be bid
     * 
     * @param {integer} bid 
     */
    setBid(bid) {
        this.bid = bid;
    }

    /**
     * Given a card id this will return the card object in this player's hand
     * 
     * @param {id} cardID 
     */
    getCard(cardId) {
        let find = this.hand.find((x) => x.id == cardId);
        return find
    }

    /**
     * Given a card id this will remove the card object in this player's hand
     * 
     * @param {Card} card 
     */
    playCard(card) {
        this.hand = this.hand.filter((x) => x.id != card.id);
    }

    /**
     * Chooses a card from the current player's hand that they should play.
     * 
     * @returns {Card} that current player should play
     */
    chooseCard(board) {
        let validCards = [];
        // find all valid cards
        for(let card of this.hand) {
            if(board.valid(card, this.hand)) {
                validCards.push(card);
            }
        }

        //find max card
        let maxCard = validCards[0];
        for(let i = 1; i < validCards.length; i++) {
            let card = validCards[i];
            if(Card.compare(card, maxCard, board.lead) == 1) {
                maxCard = card;
            }
        }

        //find min card
        let minCard = validCards[0];
        for(let i = 1; i < validCards.length; i++) {
            let card = validCards[i];
            if(Card.compare(card, maxCard, board.lead) == -1) {
                minCard = card;
            }
        }

    
        //todo:
        //if the player is bound to go over it's amount of bids then it should start
        //playing aggressively either way

        //for second+ cards thrown in a hand
        if(this.tricks < this.bid) {
            //if player needs more tricks then win the hand if it can
            //if it can't win the hand, then throw the weakest card it has
            if(Card.compare(maxCard, board.winningCard, board.lead) == 1) {
                return maxCard;
            } else {
                return minCard;
            }
        } else {
            //if player has all it's tricks then lose the hand if it can
            //if it can't lose the hand, then throw the strongest card it has
            if(Card.compare(maxCard, board.winningCard, board.lead) == -1) {
                return maxCard;
            } else {
                return minCard;
            }
        }
        
    }



}

/**
 * The game board
 */
class Board {
    constructor() {
        this.winningCard;
        this.winner;
        this.cards = [];
        this.lead = NONE;
        this.clubsBroken = false;
    }

    /**
     * Returns the number of cards on the board
     * 
     * @returns {integer} number of cards on the board
     */
    length() {
        return this.cards.length;
    }

    /**
     * Puts the card in the board object. If it's the first card then this.lead will be set to
     * the suit of Card. If it's a club then this.clubsBroken will be set to true. 
     * 
     * This method assumes that Card is valid. Use the Board.valid(card) method to check this.
     * 
     * @param {Card} card being played
     * @param {Player} player who played the card
     */
    play(card, player) {
        this.cards.push(card);
        this.updateWinner(card, player);
        if(this.length() == 1) {
            this.lead = card.suit;
        }
        if(card.suit == CLUBS) {
            this.clubsBroken = true;
        }
    }

    /**
     * Updates the winning card on the board. 
     * 
     * @param {Card} card being played
     * @param {Player} player who played the card
     */
    updateWinner(card, player) {
        if(this.cards.length == 1) {
            //this.winner = this.players[this.turn];
            this.winner = player;
            this.winningCard = card;
        } else if (Card.compare(card, this.winningCard, this.lead) == 1) {
            this.winningCard = card;
            //this.winner = this.players[this.turn];
            this.winner = player;
        }
    }

    /**
     * Resets the board.
     */
    clear() {
        this.cards = [];
        this.lead = NONE;
        this.winner = {};
        this.winningCard = {};
    }

    /**
     * Given the current state of the board, determines if the card can be played legally.
     * 
     * @param {Card} card 
     * @param {Array of Cards} cards player's hand of cards
     * @returns true if it's valid to play, false otherwise
     */
    valid(card, hand) {
        if(this.length() == 0) {
            if (this.clubsBroken) {
                return true;
            } else if(card.suit == CLUBS) {
                for(let i = 0; i < hand.length; i++) {
                    if(hand[i].suit != CLUBS) {
                        return false;
                    }
                }
            }
            return true;
        } else if (this.length() > 0) {
            if(card.suit == this.lead) {
                return true;
            } else {
                for(let i = 0; i < hand.length; i++) {
                    if(hand[i].suit == this.lead) {
                        return false;
                    }
                }
                return true;
            }
        }
    }
}

/**
 * Game controller.
 */
class Controller {
    constructor(model, view) {
        this.model = model
        this.view = view
        this.view.bindPlayCard(this.handlePlayCard)
        this.view.bindBidButton(this.handleBid);
        this.model.bindGameChange(this.onGameChanged)
        this.model.dealDeck(52);
        this.onGameChanged(this.model);
        this.resumeGame();
    }

    onGameChanged = (model) => {
        this.view.displayGame(model);
    }

    
    handlePlayCard = (cardImg) => {
        let cardId = cardImg.id;
        let player = this.model.getPlayer();
        let card = player.getCard(cardId);
        if(this.model.bidding) {
            this.view.displayAlert("Make bid first");
            return;
        }
        if(this.model.board.valid(card, player.hand)) {
            this.play(card);
            this.resumeGame();
        } else {
            this.view.displayAlert("Must follow suit");
        }
    }

    handleBid = (bid) => {
        let player = this.model.getPlayer();
        if(bid > this.model.round) {
            this.view.displayAlert("Not enough cards for that bid!");
            return;
        }

        if(this.model.totalBids + bid != this.model.round) {
            player.setBid(bid);
            this.view.updateView("player", player);
            this.model.updateTotalBids(bid);
            this.model.nextTurn();
            this.resumeGame();
        } else {
            this.view.displayAlert("Can't go " + bid);
        }
    }

    resumeGame() {
        this.model.bidding ? this.resumeBid() : this.resumeRound();
    }

    startNextRound() {
        this.model.resetRound();
        this.model.dealDeck(this.model.round * PLAYERS);
        this.view.updateView("players", this.model.players);
        this.resumeBid();
    }

    startPlay() {
        this.model.changeToPlay();
        this.resumeRound();
    }

    play(card) {
        let player = this.model.getPlayer();
        player.playCard(card);
        this.model.playCard(card);
        this.view.updateView("board", card, player);

        if(this.model.board.length() == PLAYERS) {
            this.view.updateView("clear");
            this.model.nextTrick();
        } else {
            this.model.nextTurn();
        }
    }

    resumeRound() {
        while(!this.model.getPlayer().isHuman && this.model.tricks < this.model.round) {
            let card = this.model.getPlayer().chooseCard(this.model.board);
            this.play(card);
        }

        if(this.model.tricks == this.model.round) {
            this.startNextRound();
        }
        
    }

    resumeBid() {
        while(!this.model.players[this.model.turn].isHuman && this.model.plays < PLAYERS) {
            let player = this.model.getPlayer();
            let bid = this.model.chooseBid();
            player.setBid(bid);
            this.view.updateView("player", this.model.players[this.model.turn]);
            this.model.updateTotalBids(bid);
            this.model.nextTurn();
        }
        if(this.model.plays == PLAYERS) {
            this.startPlay();
        }
    }
    
}

/**
 * Game model.
 */
class Model {
    constructor() {
        this.deck = new Deck();
        this.board = new Board();
        this.players = [];
        for(let i = 0; i < PLAYERS - 1; i++) {
            let player = new Player(false, "cpu", i);
            this.players.push(player);
        }
        this.human = new Player(true, "human", "human");
        this.players.push(this.human);
        this.turn = 0;
        this.plays = 0;
        this.tricks = 0;
        this.totalRounds = 52 / PLAYERS;
        this.round = this.totalRounds;
        this.totalBids = 0;
        this.bidding = true;
        this.lead = 0;
    }

    bindGameChange(callback) {
        this.onGameChanged = callback
    }

    dealDeck(numberOfCards) {
        this.deck = new Deck();
        this.deck.shuffle();
        for(let i = 0; i < PLAYERS; i++) {
            this.players[i].setHand(this.deck.draw(numberOfCards/PLAYERS));
        }
        //this.onGameChanged(this);
    }

    playCard(card) {
        let player = this.getPlayer();
        player.playCard(card);
        this.board.play(card, player);
        //this.onGameChanged(this);
    }

    chooseBid() {
        let player = this.getPlayer();
        let bid = 0;
        // all clubs >= 7 && non-clubs >=10 will be the bid
        for(let i = 0; i < player.hand.length; i++) {
            let card = player.hand[i];
            if(card.suit == CLUBS && card.number >= 8) {
                bid++;
            } else if (card.suit != CLUBS && card.number >= 12) {
                bid++;
            }
        }

        // for now the ai will go one less
        if(this.plays == PLAYERS && this.totalBids + bid == this.round) {
            bid--;
        }

        return bid;
    }

    updateTotalBids(bid) {
        this.totalBids += bid;
    }

    nextTurn() {
        this.turn = (this.turn + 1) % PLAYERS;
        this.plays++;
    }

    nextTrick() {
        this.board.winner.tricks++;
        this.tricks++;
        // player who won leads the next tricks
        this.turn = this.players.indexOf(this.board.winner);
        this.board.clear();
    }


    resetRound() {
        this.plays = 0;
        this.turn = 0;
        this.tricks = 0;
        this.bidding = true;
        this.board.clear();
        this.board.clubsBroken = false;
        this.totalBids = 0;
        this.tricks = 0;
        for(let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            if(player.tricks == player.bid) {
                player.points += (10 + player.tricks);
            } else {
                player.points += player.tricks;
            }
            player.tricks = 0;
            player.bid = 0;
        }
        this.round--;
    }

    changeToPlay() {
        this.plays = 0;
        this.turn = 0;
        this.bidding = false;
    }

    getPlayer() {
        return this.players[this.turn];
    }

}

/**
 * Game view.
 */
class View {
    constructor() {
        this.hand = document.getElementById("hand");
        this.board = document.getElementById("board");
        this.bid = document.getElementById("bid");
        this.amount = document.getElementById("amount");
        this.playerInfo = document.getElementById("player_info");
        this.gameInfo = document.getElementById("game_info");
        this.alert = document.getElementById("alert");
        this.time = 0;
    }

    // Create an element with an optional CSS class
    createElement(tag, className) {
      const element = document.createElement(tag)
      if (className) element.classList.add(className)
  
      return element
    }

    // Create a card element
    createCard(card) {
        let img = this.createElement('img', 'card');
        img.src = card.url;
        img.id = card.id;
        return img;
    }
  
    // Retrieve an element from the DOM
    getElement(selector) {
      const element = document.querySelector(selector)
  
      return element
    }

    // Display game info
    displayGame(game) {
        //this.displayPlayerCards(game.human);
        this.displayPlayers(game.players);
        //this.displayPlayerInfo(game.players);
        //this.displayGameInfo(game);
        this.displayAlert("");
    }

    // Display a card on the board
    displayCard(card) {
        let cardElement = this.createCard(card);
        this.board.append(cardElement);
    }

    // Updates the view according to the name of the specified function
    // Each call is staggered by SPEED miliseconds
    updateView(name, ...params) {
        this.time++;
        switch (name) {
            case "board":
                setTimeout(()=>this.displayCard(params[0]), this.time*SPEED);
                setTimeout(()=>this.updatePlayerInfo(params[1]), this.time*SPEED);
                break;
            case "clear":
                setTimeout(()=>this.clearBoard(), this.time*SPEED);
                break;
            case "player":
                setTimeout(()=>this.updatePlayerInfo(params[0]), this.time*SPEED);
                break;
            case "players":
                setTimeout(()=>this.updatePlayersInfo(params[0]), this.time*SPEED);
        }
        setTimeout(()=>this.time--, this.time*SPEED);
    }


    createPlayerCards(player) {
        //this.hand.innerHTML = "";
        let cards = this.createElement('div', 'player-cards');
        for(let i = 0; i < player.hand.length; i++) {
            let card = this.createCard(player.hand[i]);
            card.style.position="absolute";
            card.style.left = `${20 * i}`;
            //this.hand.append(card);
            cards.append(card);
        }
        return cards;
    }

    createOpponentCards(number) {
        let opponentCards = this.createElement('div', 'opponent-cards');
        for(let i = 0; i < number; i++) {
            let card = this.createElement('img', 'card');
            card.src = "Cards/cardBack_blue1.png";
            card.style.position = "absolute";
            card.style.left = `${3 * i}`;
            opponentCards.append(card);
        }
        return opponentCards;
    }

    displayPlayers(players) {
        let container = document.getElementById("cards");
        container.innerHTML = "";
        const centerX = container.offsetWidth / 2;
        const centerY = container.offsetHeight / 2;
        for (let i = 0; i < players.length; i++) {
            let playerArea = this.createElement('div', 'player');
            if(!players[i].isHuman) {
                let cards = this.createOpponentCards(players[i].hand.length);
                cards.id = "player-cards-" + players[i].id;
                playerArea.id = players[i].id;
                playerArea.appendChild(cards);
            } else {
                let cards = this.createPlayerCards(players[i]);
                //this.hand.append(card);
                this.hand.innerHTML = cards.innerHTML;
                playerArea.appendChild(this.hand);
            }
            playerArea.appendChild(this.createPlayerStats(players[i]));
            this.rotateElement(playerArea, i, players.length, centerX, centerY, 200);
            container.appendChild(playerArea);
        }
    }

    rotateElement(element, index, total, centerX, centerY, radius) {
        element.style.position = "absolute";
        const angle = (index / total) * 2 * Math.PI; // Angle in radians
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
    }

    createPlayerStats(player) {
        let item = this.createElement('p', 'player-stats');
        item.innerHTML = this.playerStatsLine(player);
        item.id = "player-info-" + player.id;
        item.style.marginTop = "5px";
        return item;
    }

    updatePlayerInfo(player) {
        let playerInfo = document.getElementById("player-info-" + player.id);
        playerInfo.innerHTML = this.playerStatsLine(player);
        let playerCards = document.getElementById("player-cards-" + player.id);
        console.log(playerCards);
        if(!player.isHuman) {
            let cards = this.createOpponentCards(player.hand.length);
            playerCards.innerHTML = cards.innerHTML;
        } else {
            let cards = this.createPlayerCards(player);
            this.hand.innerHTML = cards.innerHTML;
        }
    }

    updatePlayersInfo(players) {
        for(let i = 0; i < players.length; i++) {
            this.updatePlayerInfo(players[i]);
        }
    }

    playerStatsLine(player) {
        return "Bid " + player.bid + "<br>Tricks " + player.tricks + "<br>Points " + player.points;
    }

    clearBoard() {
        this.board.innerHTML = "";
    }

    displayAlert(message) {
        this.alert.innerHTML="";
        let text = this.createElement("p", "message");
        text.innerHTML = message;
        this.alert.append(text);
    }

    bindPlayCard(handler) {
        this.hand.addEventListener('click', event => {
            if(event.target.className == 'card') {
                handler(event.target);
            }
        })
      }

    bindBidButton(handler) {
        this.bid.addEventListener('click', event => {
            handler(this.amount.value);
        })
    }
}

const app = new Controller(new Model(), new View())

