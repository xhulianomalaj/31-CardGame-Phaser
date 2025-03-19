# 31 Card Game

A web-based version of the classic 31 card game, built using Phaser.js. Features smooth animations, interactive gameplay, and an intuitive interface for an engaging card game experience.

## Game Overview

Thirty-One is a card game where players aim to collect cards of the same suit with the highest point value. The goal is to either reach 31 points in one suit or have more points than your opponent when someone knocks.

## Features

- Single-player mode against AI opponent
- Interactive card drawing and discarding
- Card sorting by rank or suit
- Game rules accessible via in-game popup
- Smooth animations and transitions
- Strategic AI opponent

## Game Rules

- **Objective**: Get 31 points in one suit or get more points than your opponent when someone knocks
- **Card Values**:
  - Ace (A): 11 points
  - Face Cards (J, Q, K): 10 points each
  - Number Cards (2-10): Face value
- **Gameplay**:
  1. Each player gets 3 cards
  2. On your turn:
     - Draw a card from the deck or discard pile
     - Discard one card
  3. You can't knock if you have 4 cards in hand (must discard first)

## Setup Instructions

1. Clone this repository
2. Navigate to the project directory
3. Run `npx vite` to start the development server
4. Open the URL shown in the terminal (typically http://localhost:5173)

## Controls

- Left-click to draw cards from the deck or discard pile
- Left-click on cards in your hand to discard them
- Use the "Sort by Rank" and "Sort by Suit" buttons to organize your hand
- Click "Knock" to end the round when you have a good hand
- Click "End Turn" to pass play to the opponent

## Technologies Used

- Phaser.js for game mechanics, rendering, and animations
- JavaScript ES6+
- HTML5/CSS3
- Vite for development and building

## Project Structure

The game is organized into modular components:
- Game orchestration
- Deck management
- Discard pile handling
- Player interactions
- UI management
- Card sorting
- Game flow controls

---

Enjoy playing 31 Card Game!
