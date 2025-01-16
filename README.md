# What The Beep?!

This extension provides the capability to play an audio file on registered key
presses or, more notably, as a notification mechanism with VS Code tooling.

## Supported Audio Files

This extension uses the [NodeJS sound-play](https://www.npmjs.com/package/sound-play)
package under the hood and, therefore, supports all audio extensions supported
by that library.

Currently, it supports `.mp3`, `.wav`, and other extension files (depending on OS type).

Only Windows and Mac OS are currently supported.

## Usage

### Beep via Keybinding

See the below `keybindings.json` file for example usage:

```json
{
  // Make a beep sound
  {
    "command": "what-the-beep.beep",
    "key": "ctrl+shift+b"
  },

  // Play a specific audio file
  {
    "command": "what-the-beep.beep",
    "args": {
      "file": "/path/to/your/file.wav",
    },
    "key": "...",
  },

  // Play a builtin sound
  {
    "command": "what-the-beep.beep",
    "args": {
      // This can be one of break, error, laser, success, warning
      "builtin": "laser",
    },
    "key": "...",
  },
}
```

### Beep via Automated Processes

Simply use the provided command in your workflow or other extension logic
to play these audio files:

```typescript
// Play a built-in audio sound
vscode.commands.executeCommand(`what-the-beep.beep`, {
  builtin: 'error',
});

// Play a provided audio file
vscode.commands.executeCommand(`what-the-beep.beep`, {
  file: '/path/to/file.mp3'
});
```
