to-do

UI
- calculate domino positions within gameboard edges
- someone passed message only shows latest one (if multiple), not sending current turn

Functionality
- handle disconnects better.
    - stop bots playing when a player is not in game
    - stop game when all players have left
        - after a certain amount of time
        - if rejoin, should have paused
    - make sure empty lobbies are handled similarly
        - if empty, delete

- make admin settings work
    - add points for win con (100, 200...)

Cleanup
- once reconnection is handled properly:
    - only send some info once on join

nice to have

UI
- add scoreboard (top left)
- show avatars on players' stack

