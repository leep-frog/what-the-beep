import { readFileSync } from 'fs';
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
  const webviewProvider = new WebviewProvider(context.extensionUri);

  // TODO: Use hooks like these to fake a user event?
  // Sometimes seems to work, but other times not
  // const activateHelpers = [
  //   vscode.window.onDidChangeTextEditorSelection(() => {
  //     vscode.window.showInformationMessage(`YUP`);
  //     vscode.commands.executeCommand('what-the-beep.beep');
  //   }),
  // ];


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

  async beep() {
    // TODO: treat this as a user interaction somehow?
    // https://github.com/microsoft/vscode/issues/237030
    if (!this._view) {
      vscode.window.showErrorMessage(`What The Beep panel hasn't finished loading. Open the Explorer tab and click the checkbox to activate.`);
      return;
    }
    this._view.webview.postMessage({});
  };

  resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): Thenable<void> | void {
    this._view = webviewView;
    this._view.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      // Allows webview html to access relevant audio files.
      localResourceRoots: [
        this._extensionUri,
      ],
    };

    const successWav = vscode.Uri.joinPath(this._extensionUri, 'media', 'success.wav');
    const successWavUri = this._view.webview.asWebviewUri(successWav);

    const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'src', 'webview.html').fsPath;
    const got = readFileSync(htmlPath, 'utf8').replace(/AUDIO_PLACEHOLDER/g, `${successWavUri}`);
    this._view.webview.html = got;

    let showOnce = true;
    this._view.webview.onDidReceiveMessage(() => {
      vscode.window.showErrorMessage(`The webview that generates the audio may not have been created or enabled. Click the checkbox in the What The Beep pane in the Explorer tab to activate (or wait a few seconds for activation to complete). `);
      if (showOnce) {
        showOnce = false;
        this._view?.show();
      }
    });
  }
}

// this method is called when your extension is deactivated
export function deactivate() { }
