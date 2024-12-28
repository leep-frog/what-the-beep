import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import path = require('path');


export function activate(context: vscode.ExtensionContext) {
  const webviewProvider = new WebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.commands.registerCommand('what-the-beep.beep', () => webviewProvider.beep()),
    vscode.window.registerWebviewViewProvider(WebviewProvider.viewType, webviewProvider, {
      webviewOptions: {
        // This ensures that the widget still runs even when not visible.
        retainContextWhenHidden: true,
      },
    }),
  );
}

class WebviewProvider implements vscode.WebviewViewProvider {

  public static readonly viewType = 'what-the-beep';

  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
  ) { }

  beep() {
    this._view?.webview.postMessage({});
  };

  resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): Thenable<void> | void {
    this._view = webviewView;
    this._view.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        this._extensionUri,
      ],
    };

    const successWav = vscode.Uri.joinPath(this._extensionUri, 'media', 'success.wav');
    const successWavUri = this._view.webview.asWebviewUri(successWav);

    const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'webview.html').fsPath;
    const got = readFileSync(htmlPath, 'utf8').replace(/AUDIO_PLACEHOLDER/g, `${successWavUri}`);
    this._view.webview.html = got;
  }
}

// this method is called when your extension is deactivated
export function deactivate() { }
