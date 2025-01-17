import { cmd, SimpleTestCase, SimpleTestCaseProps, UserInteraction, Waiter } from '@leep-frog/vscode-test-stubber';
import { writeFileSync } from 'fs';
import * as vscode from 'vscode';
import { NotificationSeverity, TerminalAction } from '../../extension';
import path = require('path');

const MAX_WAIT = 5000;

const TRIGGER_DONE_NOTIFICATION = `Terminal trigger execution completed`;

function mediaFile(filename: string): string {
  return path.resolve(__dirname, '..', '..', '..', 'src', 'test', 'media', filename);
}

function sendSequence(text: string): UserInteraction {
  return cmd('workbench.action.terminal.sendSequence', {
    text: text,
  });
}

function builtinFile(beep: string): string {
  return path.resolve(__dirname, '..', '..', '..', 'media', `${beep}.wav`).replace("C:\\", "c:\\");
}

interface TestCase extends SimpleTestCaseProps {
  name: string;
  settings?: any;
}

function defaultTerminalActions(): TerminalAction[] {
  return [];
}

function wtbSettings(terminalActions?: TerminalAction[]): any {
  return {
    'what-the-beep.terminalActions': terminalActions ?? defaultTerminalActions(),
  };
}

const testCases: TestCase[] = [
  // Beep success tests
  {
    name: "Works if no file provided",
    userInteractions: [
      cmd('what-the-beep.beep'),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${builtinFile('success')}`,
      ],
    },
  },
  {
    name: "Works with provided wav file",
    userInteractions: [
      cmd('what-the-beep.beep', {
        file: mediaFile('success.wav'),
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${mediaFile('success.wav')}`,
      ],
    },
  },
  {
    name: "Works with provided mp3 file",
    userInteractions: [
      cmd('what-the-beep.beep', {
        file: mediaFile('success.mp3'),
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${mediaFile('success.mp3')}`,
      ],
    },
  },
  // Beep builtin tests
  {
    name: "Plays success sound",
    userInteractions: [
      cmd('what-the-beep.beep', {
        builtin: 'success',
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${builtinFile('success')}`,
      ],
    },
  },
  {
    name: "Plays warning sound",
    userInteractions: [
      cmd('what-the-beep.beep', {
        builtin: 'warning',
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${builtinFile('warning')}`,
      ],
    },
  },
  {
    name: "Plays error sound",
    userInteractions: [
      cmd('what-the-beep.beep', {
        builtin: 'error',
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${builtinFile('error')}`,
      ],
    },
  },
  {
    name: "Plays break sound",
    userInteractions: [
      cmd('what-the-beep.beep', {
        builtin: 'break',
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${builtinFile('break')}`,
      ],
    },
  },
  {
    name: "Plays laser sound",
    userInteractions: [
      cmd('what-the-beep.beep', {
        builtin: 'laser',
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${builtinFile('laser')}`,
      ],
    },
  },
  // Beep failure tests
  {
    name: "Fails if file and builtin provided",
    userInteractions: [
      cmd('what-the-beep.beep', {
        file: mediaFile('idk.wav'),
        builtin: 'uhh',
      }),
    ],
    errorMessage: {
      expectedMessages: [
        `BeepArgs cannot have both 'builtin' and 'file' properties set`,
      ],
    },
  },
  {
    name: "Fails if unknown builtin",
    userInteractions: [
      cmd('what-the-beep.beep', {
        builtin: 'uhh',
      }),
    ],
    errorMessage: {
      expectedMessages: [
        `Unknown builtin sound: uhh; must be one of: break,error,laser,success,warning`,
      ],
    },
  },
  {
    name: "Fails if file does not exist",
    userInteractions: [
      cmd('what-the-beep.beep', {
        file: mediaFile('idk.wav'),
      }),
    ],
    errorMessage: {
      expectedMessages: [
        `Audio file not found: ${mediaFile('idk.wav')}`,
      ],
    },
  },
  {
    name: "Fails if file has a single quote",
    // Can't test double quote as Windows doesn't allow files with double quotes
    userInteractions: [
      cmd('what-the-beep.beep', {
        file: mediaFile(`success with single ' quote.wav`),
      }),
    ],
    errorMessage: {
      expectedMessages: [
        "Audio file path must not contain single or double quote characters",
      ],
    },
  },
  // Wrap tests
  {
    name: "Plays error beep on failure",
    userInteractions: [
      cmd('what-the-beep.wrap', {
        command: 'idkCommand',
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${builtinFile('error')}`,
      ],
    },
  },
  {
    name: "Plays custom beep on failure",
    userInteractions: [
      cmd('what-the-beep.wrap', {
        command: 'idkCommand',
        onFailure: {
          file: builtinFile('warning'),
        },
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${builtinFile('warning')}`,
      ],
    },
  },
  {
    name: "Fails if command throws and onFailure throws",
    userInteractions: [
      cmd('what-the-beep.wrap', {
        command: 'idkCommand',
        onFailure: {
          builtin: 'badBuiltin',
        },
      }),
    ],
    errorMessage: {
      expectedMessages: [
        `Unknown builtin sound: badBuiltin; must be one of: break,error,laser,success,warning`,
      ],
    },
  },
  {
    name: "Plays success beep on success",
    userInteractions: [
      cmd('what-the-beep.wrap', {
        command: 'noop',
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${builtinFile('success')}`,
      ],
    },
  },
  {
    name: "Plays custom beep on success",
    userInteractions: [
      cmd('what-the-beep.wrap', {
        command: 'noop',
        onSuccess: {
          file: mediaFile('success.mp3'),
        },
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${mediaFile('success.mp3')}`,
      ],
    },
  },

  /*************************
   * Terminal Action Tests *
   *************************/

  // Action tests
  {
    name: "[TerminalAction] Notifies",
    settings: wtbSettings([
      {
        notification: {
          message: "hi",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("echo hello\n"),
    ],
    informationMessage: {
      expectedMessages: [
        "hi",
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  {
    name: "[TerminalAction] Beeps",
    settings: wtbSettings([
      {
        command: 'what-the-beep.beep',
        args: {
          file: mediaFile('success.mp3')
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("echo hello\n"),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${mediaFile('success.mp3')}`,
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  {
    name: "[TerminalAction] Notifies and beeps",
    settings: wtbSettings([
      {
        notification: {
          message: "hi",
          severity: NotificationSeverity.WARNING,
        },
        command: 'what-the-beep.beep',
        args: {
          file: mediaFile('success.mp3')
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("echo hello\n"),
    ],
    informationMessage: {
      expectedMessages: [
        `Played audio file: ${mediaFile('success.mp3')}`,
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
    warningMessage: {
      expectedMessages: [
        "hi",
      ],
    },
  },

  // Trigger tests
  {
    name: "[TerminalAction] Always triggers if undefined trigger",
    settings: wtbSettings([
      {
        notification: {
          message: "hi",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("echo hello\n"),
    ],
    informationMessage: {
      expectedMessages: [
        "hi",
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  {
    name: "[TerminalAction] Always triggers if empty trigger",
    settings: wtbSettings([
      {
        trigger: {},
        notification: {
          message: "hi",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("echo hello\n"),
    ],
    informationMessage: {
      expectedMessages: [
        "hi",
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  // commandLineRegex
  {
    name: "[TerminalAction] Triggers if commandLineRegex matches",
    settings: wtbSettings([
      {
        trigger: {
          commandLineRegex: "# beep$",
        },
        notification: {
          message: "hello there",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("echo hello # beep\n"),
    ],
    informationMessage: {
      expectedMessages: [
        "hello there",
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  {
    name: "[TerminalAction] Does not trigger if commandLineRegex does not match",
    settings: wtbSettings([
      {
        trigger: {
          commandLineRegex: "# beep$",
        },
        notification: {
          message: "hello there",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("echo hello # beepo\n"),
    ],
    informationMessage: {
      expectedMessages: [
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  // exitCode
  {
    name: "[TerminalAction] [ExitCode: undefined] Triggers on success",
    settings: wtbSettings([
      {
        trigger: {},
        notification: {
          message: "hello there",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("echo hello\n"),
    ],
    informationMessage: {
      expectedMessages: [
        "hello there",
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  {
    name: "[TerminalAction] [ExitCode: undefined] Triggers on failure",
    settings: wtbSettings([
      {
        trigger: {},
        notification: {
          message: "hello there",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("idkCommand\n"),
    ],
    informationMessage: {
      expectedMessages: [
        "hello there",
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  {
    name: "[TerminalAction] [ExitCode: -1] Does not trigger on success",
    settings: wtbSettings([
      {
        trigger: {
          exitCode: -1,
        },
        notification: {
          message: "hello there",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("echo hello\n"),
    ],
    informationMessage: {
      expectedMessages: [
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  {
    name: "[TerminalAction] [ExitCode: -1] Triggers on failure",
    settings: wtbSettings([
      {
        trigger: {
          exitCode: -1,
        },
        notification: {
          message: "hello there",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("idkCommand\n"),
    ],
    informationMessage: {
      expectedMessages: [
        "hello there",
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  {
    name: "[TerminalAction] [ExitCode: 0] Triggers on success",
    settings: wtbSettings([
      {
        trigger: {
          exitCode: 0,
        },
        notification: {
          message: "hello there",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("echo hello\n"),
    ],
    informationMessage: {
      expectedMessages: [
        "hello there",
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  {
    name: "[TerminalAction] [ExitCode: 0] Does not trigger on failure",
    settings: wtbSettings([
      {
        trigger: {
          exitCode: 0,
        },
        notification: {
          message: "hello there",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("idkCommand\n"),
    ],
    informationMessage: {
      expectedMessages: [
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  {
    name: "[TerminalAction] [ExitCode: {positive number}] Does not trigger on success",
    settings: wtbSettings([
      {
        trigger: {
          exitCode: 127,
        },
        notification: {
          message: "hello there",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("echo hello\n"),
    ],
    informationMessage: {
      expectedMessages: [
        TRIGGER_DONE_NOTIFICATION,
      ],
    },
  },
  {
    name: "[TerminalAction] [ExitCode: {positive number}] Does not trigger on failure with other exit code",
    settings: wtbSettings([
      {
        trigger: {
          exitCode: 2,
        },
        notification: {
          message: "hello there",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("idkCommand\n"),
    ],
    informationMessage: {
      expectedMessages: [
        TRIGGER_DONE_NOTIFICATION,
      ],
    }
  },
  {
    name: "[TerminalAction] [ExitCode: {positive number}] Triggers on failure with identical exit code",
    settings: wtbSettings([
      {
        trigger: {
          exitCode: 1,
        },
        notification: {
          message: "hello there",
        },
      },
    ]),
    userInteractions: [
      cmd('workbench.action.terminal.focus'),
      sendSequence("idkCommand\n"),
    ],
    informationMessage: {
      expectedMessages: [
        "hello there",
        TRIGGER_DONE_NOTIFICATION,
      ],
    }
  },
];

suite('Extension Test Suite', () => {

  const oldInfo = vscode.window.showInformationMessage;
  const oldWarn = vscode.window.showWarningMessage;
  const oldErr = vscode.window.showErrorMessage;

  testCases.forEach((tc, idx) => {
    test(tc.name, async () => {

      console.log(`============== ${tc.name} ==============`);

      // Use real configuration because we need to activate reload
      tc.workspaceConfiguration = {
        skip: true,
      };
      tc.userInteractions = [
        new SettingsUpdate(tc.settings || wtbSettings(), idx),
        ...(tc.userInteractions || []),
      ];

      // Logic to wait for messages
      const gotMessages: string[] = [];

      // Wrap messages methods to add to gotMessages
      vscode.window.showInformationMessage = async (msg: string) => {
        gotMessages.push(msg);
        return oldInfo(msg);
      };
      vscode.window.showWarningMessage = async (msg: string) => {
        gotMessages.push(msg);
        return oldWarn(msg);
      };
      vscode.window.showErrorMessage = async (msg: string) => {
        gotMessages.push(msg);
        return oldErr(msg);
      };

      // Wait until we get all the messages we wanted
      // This is needed since the onDidEndTerminalShellExecution
      // runs in the background
      // TODO: Just wait until TRIGGER_DONE_NOTIFICATION is sent!
      const msDelay = 50;
      const wantMsgs = [
        ...(tc.informationMessage?.expectedMessages || []),
        ...(tc.warningMessage?.expectedMessages || []),
        ...(tc.errorMessage?.expectedMessages || []),
      ];
      if (wantMsgs.length) {
        tc.userInteractions.push(new Waiter(msDelay, () => {
          return wantMsgs.length === gotMessages.length && wantMsgs.reduce((previousValue: boolean, currentValue: string) => previousValue && gotMessages.includes(currentValue), true);
        }, MAX_WAIT / msDelay));
      }

      // Run the test
      await new SimpleTestCase(tc).runTest().catch((e: any) => {
        throw e;
      });
    });
  });
});

function startingFile(...filename: string[]) {
  return path.resolve(__dirname, "..", "..", "..", "src", "test", "test-workspace", path.join(...filename));
}

class SettingsUpdate extends Waiter {

  private contents: any;
  private noOpValue: string;
  private initialized: boolean;

  constructor(contents: any, tcIdx: number) {
    super(5, () => {
      return vscode.workspace.getConfiguration('no-op').get('key') === this.noOpValue;
    });

    this.contents = contents;
    this.initialized = false;
    this.noOpValue = `test-number-${tcIdx}`;
  }

  async do(): Promise<any> {
    if (!this.initialized) {
      this.initialized = true;
      const settingsFile = startingFile(".vscode", "settings.json");

      writeFileSync(settingsFile, JSON.stringify({
        ...this.contents,
        "no-op": {
          "key": this.noOpValue,
        },
      }, undefined, 2));
    }

    return super.do();
  }
}
