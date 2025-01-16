import * as vscode from 'vscode';
const sound = require("sound-play");

export interface BeepArgs {
  filepath?: string;
}


export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(
    vscode.commands.registerCommand('what-the-beep.beep', async (args?: BeepArgs) => {

      const filepath = args?.filepath ?? vscode.Uri.joinPath(context.extensionUri, 'media', 'success.wav').fsPath;
      console.log(`[What-the-beep] Playing audio file ${filepath}`);

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

      console.log(`Successfully played audio file ${filepath}`);
    }),
  );
}

// this method is called when your extension is deactivated
export function deactivate() { }

// TODO: Update sound-play to include the following in the windows script
// (or just verify file exists and doesn't have any quotes or other special characters)
// https://www.meziantou.net/stop-the-script-when-an-error-occurs-in-powershell.htm
// $ErrorActionPreference = 'Stop' ; $PSNativeCommandUseErrorActionPreference = $true
