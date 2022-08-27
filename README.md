![ImPOSTR](https://i.imgur.com/3uCYrfz.png)

##### A javascript module that spoofs mouse and keyboard events (without moving the real cursor). Works on Both Linux and Windows reguardless of the system, or it's version!


## Features:

- [x] Cross-platform.
- [x] Can spoof mouse events without affecting the real cursor/pointer.
- [x] Can spoof keyboard events.
- [x] You can lie to the whole system, or a specific window.
- [x] Can be used as a standalone CLI, or as a NodeJS module!
- [ ] MacOS support (WIP)

## How it works:
#### Windows
-- Makes use of user32.dll and kernel32.dll to inject input events.
#### Linux 
-- Reads device mount points such as "/dev/input/mice" and mimics their behaviour. Not dependant on X or Wayland.

## Installation:
(WIP)

## API:
(WIP)
