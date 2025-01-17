import { existsSync } from 'fs';
import * as vscode from 'vscode';
import path = require('path');
const sound = require("sound-play");
const notifier = require('node-notifier');

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

export interface WrapArgs {
  command: string,
  onSuccess?: BeepArgs;
  onFailure?: BeepArgs;
  args?: any[],
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

async function beep(context: vscode.ExtensionContext, args?: BeepArgs) {
  const filepath = getBeepFile(context, args);
  if (!filepath) {
    // getBeepFile is responsible for outputting message
    return;
  }

  try {
    await sound.play(filepath).then(
      undefined,
      (error: any) => {
        vscode.window.showErrorMessage(`Failed to play audio file: ${error}`);
      }
    );

    if (process.env.TEST_MODE) {
      vscode.window.showInformationMessage(`Played audio file: ${filepath}`);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Unexpected audio file error: ${error}`);
  }

  console.log(`[What-the-beep] Successfully played audio file ${filepath}`);
}

async function wrap(context: vscode.ExtensionContext, args: WrapArgs) {
  await vscode.commands.executeCommand(args.command, ...(args.args || [])).then(
    async () => beep(context, args.onSuccess ?? { builtin: BuiltinBeep.SUCCESS }),
    async () => beep(context, args.onFailure ?? { builtin: BuiltinBeep.ERROR }),
  );
}

interface TerminalTrigger {
  /**
   * If the terminal command line matches this regex, then the trigger will run.
   */
  commandLineRegex?: string | RegExp;

  /**
   * Exit code of the command. If unset, then all commands will match. If -1,
   * then all non-zero exit codes will match.
   */
  exitCode?: number;
}

export enum NotificationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

interface Notification {
  message: string;
  severity?: NotificationSeverity;
}

interface DesktopNotification {
  title?: string;
  message?: string;
}

export interface TerminalAction {
  // The terminal trigger for the beep (if not provided, then fires on every command).
  trigger?: TerminalTrigger;

  // The VS Code command to execute (e.g. `what-the-beep.beep`)
  command?: string;

  // The args to pass to the VS Code command.
  args?: any;

  // VS Code notification
  notification?: Notification;

  // Desktop notification
  desktopNotification?: DesktopNotification;
}

interface Settings {
  terminalBeeps: TerminalAction[];
}

function triggerMatches(event: vscode.TerminalShellExecutionEndEvent, trigger?: TerminalTrigger): boolean {
  if (!trigger) {
    return true;
  }

  if (trigger.commandLineRegex !== undefined && !event.execution.commandLine.value.match(trigger.commandLineRegex)) {
    return false;
  }

  if (trigger.exitCode !== undefined) {

    console.log(`TRIGGER EXIT CODE: ${trigger.exitCode} GOT EXIT CODE: ${event.exitCode}`);
    if (trigger.exitCode === -1) {
      if (event.exitCode === 0) {
        return false;
      }
    } else if (trigger.exitCode !== event.exitCode) {
      return false;
    }
  }

  return true;
}

async function runTerminalAction(context: vscode.ExtensionContext, terminalAction: TerminalAction, logoPath: string) {

  // Run the alert first as the `await beep` can potentially take a while (if we ever await either of these)
  if (terminalAction.notification) {
    switch (terminalAction.notification.severity) {
      case NotificationSeverity.INFO:
      case undefined:
        vscode.window.showInformationMessage(terminalAction.notification.message);
        break;
      case NotificationSeverity.WARNING:
        vscode.window.showWarningMessage(terminalAction.notification.message);
        break;
      case NotificationSeverity.ERROR:
        vscode.window.showErrorMessage(terminalAction.notification.message);
        break;
      default:
        vscode.window.showErrorMessage(`Unknown notification severity: ${terminalAction.notification.severity}`);
        break;
    }
  }

  if (terminalAction.desktopNotification) {

    if (process.env.TEST_MODE) {
      vscode.window.showInformationMessage(`Desktop Notification: title=${terminalAction.desktopNotification.title}; message=${terminalAction.desktopNotification.message}`);
    }

    notifier.notify({
      title: terminalAction.desktopNotification.title,
      message: terminalAction.desktopNotification.message,
      icon: logoPath,
    });
  }

  if (terminalAction.command) {
    await vscode.commands.executeCommand(terminalAction.command, terminalAction.args);
  } else if (terminalAction.args) {
    vscode.window.showErrorMessage(`what-the-beep.terminalAction.args was provided, but no what-the-beep.terminalAction.command was!`);
  }
}

export function activate(context: vscode.ExtensionContext) {

  let terminalActions: TerminalAction[] = [];

  const logoPath = path.join(context.extensionUri.fsPath, 'logo.png');

  function reloadSettings() {
    const config = vscode.workspace.getConfiguration("what-the-beep");
    terminalActions = config.get<TerminalAction[]>("terminalActions", []);
  }

  reloadSettings();

  context.subscriptions.push(
    vscode.commands.registerCommand('what-the-beep.beep', async (args?: BeepArgs) => beep(context, args)),
    vscode.commands.registerCommand('what-the-beep.wrap', async (args: WrapArgs) => wrap(context, args)),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration("what-the-beep")) {
        reloadSettings();
      }
    }),
    vscode.window.onDidEndTerminalShellExecution(async (event) => {
      for (const terminalAction of terminalActions) {
        if (triggerMatches(event, terminalAction.trigger)) {
          await runTerminalAction(context, terminalAction, logoPath);
        }
      }

      if (process.env.TEST_MODE) {
        vscode.window.showInformationMessage(`Terminal trigger execution completed`);
      }
    }),
  );
}

export function deactivate() { }
