# What The Beep?!

This extension provides the capability to play an audio file and send
VS Code and/or desktop notifications after built-in VS Code events, including:

* [Terminal Events](#beep-via-terminal-event)
* [Other Extension Actions](#beep-via-extensions)
* [Keybindings](#beep-via-keybinding)

### Beep via Terminal Event

Beeps and notifications can be triggered via terminal events. Simply
configure the `what-the-beep.terminalActions` setting:

```json
{
  "what-the-beep.terminalActions": [
    {
      // Any combination/subset of the following fields can be set. Their
      // names are self-explanatory and VS Code setting auto-completion
      // will provide useful hints on how to configure each of these values.
      "trigger": ...,
      "desktopNotification": ...,
      "notification": ...,
    }
  ],
},
```

The above configuration will cause the default beep to be played (along
with any other notification actions). However, you can also configure
other beeps and actions to be triggered by terminal events:

```json
{
  "what-the-beep.terminalActions": [
    // Beeps with a different builtin sound
    {
      "trigger": ...,
      "command": "what-the-beep.beep",
      "args": {
        "builtin": "error",
      }
    },
    // Runs a different VS Code command for the given trigger
    {
      "trigger": ...,
      "command": "workbench.action.terminal.copyLastCommandOutput",
    }
  ],
},
```

### Beep via Extensions

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

## Supported Audio Files

This extension uses the [NodeJS sound-play](https://www.npmjs.com/package/sound-play)
package under the hood and, therefore, supports all audio extensions supported
by that library.

Currently, it supports `.mp3`, `.wav`, and other extension files (depending on OS type).

Only Windows and Mac OS are currently supported.
