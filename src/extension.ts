import { existsSync } from 'fs';
import * as vscode from 'vscode';
const sound = require("sound-play");

enum BuiltinBeep {
  // All built-in sounds were obtained from the below link:
  // https://github.com/microsoft/vscode/tree/bd6107301dc9a6200bd8d4f64a9b198438b3f1d6/src/vs/workbench/contrib/audioCues/browser/media
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  BREAK = 'break',
  LASER = 'laser',
};

export interface BeepArgs {
  file?: string;
  builtin?: BuiltinBeep;
}

function getBeepFile(context: vscode.ExtensionContext, args?: BeepArgs) {
  if (args?.builtin && args.file) {
    vscode.window.showErrorMessage(`BeepArgs cannot have both 'builtin' and 'file' properties set`);
    return;
  }

  if (args?.file) {
    if (!existsSync(args.file)) {
      vscode.window.showErrorMessage(`Audio file not found: ${args.file}`);
      return;
    };

    // sound-play runs `exec` on Mac and Windows, the scripts they create
    // will break if the file path contains single or double quote. See the below file:
    // https://github.com/nomadhoc/sound-play/blob/master/src/index.js
    //
    // TODO: If I ever feel like it, I can probably update the sound-play package to
    // handle quotes better.
    //
    // TODO: Update sound-play to include the following in the windows script
    // (or just verify file exists and doesn't have any quotes or other special characters)
    // https://www.meziantou.net/stop-the-script-when-an-error-occurs-in-powershell.htm
    // $ErrorActionPreference = 'Stop' ; $PSNativeCommandUseErrorActionPreference = $trued

    if (args.file.includes(`'`) || args.file.includes('"')) {
      vscode.window.showErrorMessage(`Audio file path must not contain single or double quote characters`);
      return;
    }

    console.log(`[What-the-beep] Playing audio file ${args.file}`);
    return args.file;
  }

  const builtinEnum = args?.builtin ?? BuiltinBeep.SUCCESS;

  const allowedValues = Object.values(BuiltinBeep).sort();
  if (!allowedValues.includes(builtinEnum)) {
    vscode.window.showErrorMessage(`Unknown builtin sound: ${builtinEnum}; must be one of: ${allowedValues}`);
    return;
  }

  console.log(`[What-the-beep] Playing builtin audio ${builtinEnum}`);
  return vscode.Uri.joinPath(context.extensionUri, 'media', `${builtinEnum}.wav`).fsPath;
}

export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(
    vscode.commands.registerCommand('what-the-beep.beep', async (args?: BeepArgs) => {

      const filepath = getBeepFile(context, args);
      if (!filepath) {
        return;
      }

      if (process.env.TEST_MODE) {
        vscode.window.showInformationMessage(`Playing audio file: ${filepath}`);
      }

      try {
        await sound.play(filepath).then(
          undefined,
          (error: any) => {
            vscode.window.showErrorMessage(`Failed to play audio file: ${error}`);
          }
        );
      } catch (error) {
        vscode.window.showErrorMessage(`Unexpected audio file error: ${error}`);
      }

      console.log(`[What-the-beep] Successfully played audio file ${filepath}`);
    }),
  );
}

export function deactivate() { }
