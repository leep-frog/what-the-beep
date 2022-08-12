// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface GroogTaskDefinition extends vscode.TaskDefinition {
  /**
   * The audio file to play.
   */
  file: string;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.tasks.registerTaskProvider('audioPlayer', {
    provideTasks: () => {
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
      const definition: GroogTaskDefinition = <any>_task.definition;

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
        _task.scope ?? vscode.TaskScope.Global,
        _task.name,
        _task.source,
        new vscode.ShellExecution(
          "audio-player",
          {
            executable: "python",
            shellArgs: [
              "-c",
              `"${pyFile}"`,
              definition.file,
            ]
          },
        ),
      );

      nt.presentationOptions.reveal = vscode.TaskRevealKind.Never;
      nt.presentationOptions.showReuseMessage = false;
      nt.problemMatchers = [];

      return nt;
    }
  }));
}

// this method is called when your extension is deactivated
export function deactivate() { }
