import { cmd, SimpleTestCase, SimpleTestCaseProps } from '@leep-frog/vscode-test-stubber';
import path = require('path');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as myExtension from '../../extension';

function mediaFile(filename: string): string {
  return path.resolve(__dirname, '..', '..', '..', 'src', 'test', 'media', filename);
}

function builtinFile(beep: string): string {
  return path.resolve(__dirname, '..', '..', '..', 'media', `${beep}.wav`).replace("C:\\", "c:\\");
}

interface TestCase extends SimpleTestCaseProps {
  name: string;
}

const testCases: TestCase[] = [
  {
    name: "Works if no file provided",
    userInteractions: [
      cmd('what-the-beep.beep'),
    ],
    informationMessage: {
      expectedMessages: [
        `Playing audio file: ${builtinFile('success')}`,
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
        `Playing audio file: ${mediaFile('success.wav')}`,
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
        `Playing audio file: ${mediaFile('success.mp3')}`,
      ],
    },
  },
  // Builtin tests
  {
    name: "Plays success sound",
    userInteractions: [
      cmd('what-the-beep.beep', {
        builtin: 'success',
      }),
    ],
    informationMessage: {
      expectedMessages: [
        `Playing audio file: ${builtinFile('success')}`,
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
        `Playing audio file: ${builtinFile('warning')}`,
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
        `Playing audio file: ${builtinFile('error')}`,
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
        `Playing audio file: ${builtinFile('break')}`,
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
        `Playing audio file: ${builtinFile('laser')}`,
      ],
    },
  },
  // Failure tests
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
];

suite('Extension Test Suite', () => {
  testCases.forEach(tc => {
    test(tc.name, async () => {
      await new SimpleTestCase(tc).runTest().catch((e: any) => {
        throw e;
      });
    });
  });
});
