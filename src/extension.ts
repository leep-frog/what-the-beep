// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface AudioTaskDefinition extends vscode.TaskDefinition {
  /**
   * The audio file to play.
   */
  file: string;
}

interface AudioCommandArgs {
  /**
   * The audio file to play.
   */
  file: string;
}

function createTask(name: string, source: string, definition: vscode.TaskDefinition, scope: vscode.TaskScope | vscode.WorkspaceFolder, file: string): vscode.Task {
  let pyFile: string = [
    "from playsound import playsound",
    "import os",
    "import sys",
    "",
    "p = os.path.abspath(sys.argv[1])",
    "if not os.path.isfile(p):",
    "  # TODO: use problem matcher here?",
    "  print('not a file')",
    "  exit(0)",
    "",
    // See the following answer for why this logic is needed:
    // https://stackoverflow.com/a/68937955/18162937
    "if os.name == 'nt':",
    "  p = p.replace('\\\\', '\\\\\\\\', 1)",
    "",
    "playsound(p)",
  ].join("\n");

  let nt = new vscode.Task(
    // This must always be the *exact same* definition
    // from the provided task object.
    definition,
    scope,
    name,
    source,
    new vscode.ShellExecution(
      "audio-player",
      {
        executable: "python",
        shellArgs: [
          "-c",
          `"${pyFile}"`,
          file,
        ]
      },
    ),
  );

  nt.presentationOptions.reveal = vscode.TaskRevealKind.Never;
  nt.presentationOptions.showReuseMessage = false;
  nt.problemMatchers = [];

  return nt;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('what-the-beep.playWithArgs', (args: AudioCommandArgs) => {
    vscode.tasks.executeTask(createTask(
      "audioPlayer",
      "What the Beep?",
      {
        type: "audioPlayer",
      },
      vscode.TaskScope.Global,
      args.file,
      //"C:\\Users\\gleep\\Desktop\\Coding\\go\\src\\notification\\media\\laser.wav",
    ));
  }));

  context.subscriptions.push(vscode.commands.registerCommand('what-the-beep.play', () => {
    vscode.window.showOpenDialog({
      canSelectFiles: true,
      canSelectFolders: false,
      canSelectMany: false,
      openLabel: "Play audio file",
      filters: {
        "Audio Files": ["wav", "mp3"],
      },
    });
    vscode.window.showInformationMessage("nothing");
  }));

  context.subscriptions.push(vscode.tasks.registerTaskProvider('audioPlayer', {
    provideTasks: () => {
      vscode.window.showInformationMessage("Pt");
      return [
        new vscode.Task(
          { type: "audioPlayer" },
          vscode.TaskScope.Global,
          "audioPlayer",
          "What the Beep?",
          undefined
        ),
      ];
    },
    resolveTask(_task: vscode.Task): vscode.Task | undefined {
      const definition: AudioTaskDefinition = <any>_task.definition;
      return createTask(
        _task.name,
        _task.source,
        definition,
        _task.scope ?? vscode.TaskScope.Global,
        definition.file,
      );
    }
  }));
}

// this method is called when your extension is deactivated
export function deactivate() { }
