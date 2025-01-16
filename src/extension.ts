import { existsSync } from 'fs';
import * as vscode from 'vscode';
const sound = require("sound-play");

export interface BeepArgs {
  file?: string;
}

export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(
    vscode.commands.registerCommand('what-the-beep.beep', async (args?: BeepArgs) => {

      const filepath = args?.file ?? vscode.Uri.joinPath(context.extensionUri, 'media', 'success.wav').fsPath;
      console.log(`[What-the-beep] Playing audio file ${filepath}`);

      if (!existsSync(filepath)) {
        vscode.window.showErrorMessage(`Audio file not found: ${filepath}`);
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

      if (filepath.includes(`'`) || filepath.includes('"')) {
        vscode.window.showErrorMessage(`Audio file path must not contain single or double quote characters`);
        return;
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

// this method is called when your extension is deactivated
export function deactivate() { }
