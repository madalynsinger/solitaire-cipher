'use strict';

const JOKERS = ['A', 'B'];
const UNKEYED_DECK = Array.from({ length: 52 }, (_, i) => i + 1).concat(JOKERS);

class Keystream {
    constructor(deck) {
        this.deck = Array.from(deck);
    }

    moveDown(joker, times) {
        let deck = this.deck;
        let i = deck.indexOf(joker);
        let j = i + times;
        if (j > 53) j -= 53;

        deck.splice(i, 1);
        deck.splice(j, 0, joker);
    }

    tripleCut() {
        let deck = this.deck;
        let i = deck.indexOf('A');
        let j = deck.indexOf('B');
        if (i > j) [i, j] = [j, i];

        let before = deck.slice(0, i);
        let between = deck.slice(i, j + 1);
        let after = deck.slice(j + 1);
        this.deck = after.concat(between).concat(before);
    }

    countCut() {
        let deck = this.deck;
        let n = this.cardValueAt(53);
        let top = deck.splice(0, n);
        deck.splice(deck.length - 1, 0, ...top);
    }

    cardValueAt(i) {
        let card = this.deck[i];
        return JOKERS.includes(card) ? 53 : card;
    }

    getOutputValue() {
        let i = this.cardValueAt(0);
        return this.deck[i];
    }

    *[Symbol.iterator]() {
        while (true) {
            this.moveDown('A', 1);
            this.moveDown('B', 2);
            this.tripleCut();
            this.countCut();
            let out = this.getOutputValue();
            if (!JOKERS.includes(out)) yield out;
        }
    }
}

function sanitizeInput(msg) {
    msg = msg.replace(/[^a-z]/gi, '');
    let numXs = (5 - msg.length % 5) % 5;
    return msg.toUpperCase() + 'X'.repeat(numXs);
}

function letterToNumber(ch) {
    return ch.charCodeAt(0) - 64;
}

function numberToLetter(n) {
    n %= 26;
    if (n < 1) n += 26;
    return String.fromCharCode(n + 64);
}

$(function() {
});
