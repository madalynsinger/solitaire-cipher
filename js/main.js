'use strict';

const JOKERS = ['A', 'B'];
const UNKEYED_DECK = Array.from({ length: 52 }, (_, i) => i + 1).concat(JOKERS);

function sanitize(s) {
    return s.replace(/[^a-z]/gi, '').toUpperCase();
}

function letterToNumber(ch) {
    return ch.charCodeAt(0) - 64;
}

function numberToLetter(n) {
    n %= 26;
    if (n < 1) n += 26;
    return String.fromCharCode(n + 64);
}

class Keystream {
    constructor(passphrase) {
        this.deck = [...UNKEYED_DECK];
        this.keyWithPassphrase(passphrase);
    }

    keyWithPassphrase(passphrase) {
        for (const ch of sanitize(passphrase)) {
            this.doSolitaireStep();
            this.countCut(letterToNumber(ch));
        }
    }

    * makeIterator() {
        while (true) {
            this.doSolitaireStep();
            let out = this.getOutputValue();
            if (!JOKERS.includes(out)) yield out;
        }
    }

    doSolitaireStep() {
        this.moveDown('A', 1);
        this.moveDown('B', 2);
        this.tripleCut();
        this.countCut(this.cardValueAt(53));
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

    countCut(n) {
        let deck = this.deck;
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
}

function doCipher(isEncrypt) {
    const message = $('#message').val();
    const passphrase = $('#passphrase').val();
    const op = isEncrypt
        ? ((a, b) => a + b)
        : ((a, b) => a - b);

    let text = sanitize(message);
    if (isEncrypt) {
        let numXs = (5 - text.length % 5) % 5;
        text += 'X'.repeat(numXs);
    }

    let ks = new Keystream(passphrase);
    let iter = ks.makeIterator();
    let letters = [];
    for (let ch of text) {
        let n = op(letterToNumber(ch[0]), iter.next().value);
        letters.push(numberToLetter(n));
    }

    let groups = [];
    for (let i = 0; i < letters.length; i += 5) {
        groups.push(letters.slice(i, i + 5).join(''));
    }
    $('#output').text(groups.join(' '));
}

function encrypt() {
    doCipher(true);
}

function decrypt() {
    doCipher(false);
}

$(function () {
    $('#encrypt').on('click', encrypt);
    $('#decrypt').on('click', decrypt);
});
