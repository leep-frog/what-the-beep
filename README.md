# what-the-beep

TODO

<!-- This extension allows you to play audio files at the click of a button (or via a command). -->

<!-- ## Setup

Under the hood, this extension utilizes the [Python playsound](https://pypi.org/project/playsound/) module. Run the following to install it:

```
pip3 install playsound
```

## Playing Audio Files

### Static Audio Files

Audio files are played via VS Code tasks. To play a new
audio file, simply create a new task in your user tasks file (open the command pallete and search for `Tasks: Open User Tasks`) with the following format:

```json
{
"version": "2.0.0",
  "tasks": [
    {
      "type": "audioPlayer",
      "label": "Audio: break.wav",
      "file": "/absolute/path/to/my/audioFile.wav",
      "presentation": {
        "close": true
      }
    },
  ],
}
```

The `type` argument must be exactly `audioPlayer` and the `file` value must be an absolute path to your audio file.

All other fields are not unique to this extension and are outlined [in this VS Code doc](https://code.visualstudio.com/docs/editor/tasks#_custom-tasks).

#### Keyboard Shortcut

These tasks can be executed via keyboard shortcuts:

```json
{
  "key": "alt+b",
  "command": "workbench.action.tasks.runTask",
  "args": {
    "task": "Audio: break.wav",
    "type": "audioPlayer",
  },
},
```

Once again, the `args.type` value must be exactly `audioPlayer`. The `args.task` value must match your task's `label` exactly as well.

### Dynamic Audio Files

In progress...

## Release Notes

### 0.0.1

Initial release! -->
