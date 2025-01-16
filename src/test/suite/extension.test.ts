import { cmd, SimpleTestCase, SimpleTestCaseProps } from '@leep-frog/vscode-test-stubber';
import path = require('path');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as myExtension from '../../extension';

function mediaFile(filename: string): string {
  return path.resolve(__dirname, '..', '..', '..', 'src', 'test', 'media', filename);
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
  },
  {
    name: "Works with provided wav file",
    userInteractions: [
      cmd('what-the-beep.beep', {
        file: mediaFile('success.wav'),
      }),
    ],
  },
  {
    name: "Works with provided mp3 file",
    userInteractions: [
      cmd('what-the-beep.beep', {
        file: mediaFile('success.mp3'),
      }),
    ],
  },
  // Failure cases
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
