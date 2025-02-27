import { cleanVirtualFileSystem, useVirtualFileSystem } from '@o3r/test-helpers';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import * as path from 'node:path';

const virtualFileSystem = useVirtualFileSystem();
import jsonDependencyVersionsHarmonize from './json-dependency-versions-harmonize';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('jsonc-eslint-parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  }
});

const packageJsonWorkspace = {
  workspaces: [
    './packages/*'
  ],
  dependencies: {
    myDep: '^2.0.0'
  }
};

const packageJson2 = {
  name: 'testPackage',
  dependencies: {
    myDep: '^1.0.0',
    myOtherDep: '~2.0.0'
  }
};
const fakeFolder = path.resolve('/fake-folder');
const packageToLint = path.join(fakeFolder, 'local', 'packages', 'my-package', 'package.json');

beforeAll(async () => {
  await virtualFileSystem.promises.mkdir(path.join(fakeFolder, 'local'), {recursive: true});
  await virtualFileSystem.promises.writeFile(path.join(fakeFolder, 'local', 'package.json'), JSON.stringify(packageJsonWorkspace));

  await virtualFileSystem.promises.mkdir(path.join(fakeFolder, 'local', 'packages', 'my-package'), {recursive: true});
  await virtualFileSystem.promises.mkdir(path.join(fakeFolder, 'local', 'packages', 'my-package-2'), {recursive: true});
  await virtualFileSystem.promises.writeFile(path.join(fakeFolder, 'local', 'packages', 'my-package-2', 'package.json'), JSON.stringify(packageJson2));

  await virtualFileSystem.promises.writeFile(packageToLint, '{}');
});

afterAll(() => {
  cleanVirtualFileSystem();
});

ruleTester.run('json-dependency-versions-harmonize', jsonDependencyVersionsHarmonize, {
  valid: [
    { code: JSON.stringify({ dependencies: { myDep: '^2.0.0' } }), filename: packageToLint },
    { code: JSON.stringify({ dependencies: { myDep: '~2.0.0' } }), filename: packageToLint },
    { code: JSON.stringify({ dependencies: { myOtherDep: '~2.0.0' } }), filename: packageToLint },
    { code: JSON.stringify({ dependencies: { myOtherDep: '~3.0.0' } }), filename: packageToLint },
    { code: JSON.stringify({ dependencies: { myUniqueDep: 'https://invalid-range.com' } }), filename: packageToLint },
    { code: JSON.stringify({ dependencies: { myDep: '1.0.0' } }), filename: packageToLint, options: [{ ignoredDependencies: ['myDep'] }] },
    { code: JSON.stringify({ dependencies: { myDep: '1.0.0' } }), filename: packageToLint, options: [{ ignoredDependencies: ['my*'] }] },
    { code: JSON.stringify({ dependencies: { myOtherDep: '1.0.0' } }), filename: packageToLint, options: [{ ignoredPackages: ['testPackage'] }] },
    { code: JSON.stringify({ peerDependencies: { myOtherDep: '^2.0.0' } }), filename: packageToLint, options: [{ alignPeerDependencies: false }] }
  ],
  invalid: [
    {
      filename: packageToLint,
      output: JSON.stringify({ dependencies: { myDep: '^2.0.0' } }),
      code: JSON.stringify({ dependencies: { myDep: '1.0.0' } }),
      errors: [
        {
          messageId: 'error',
          data: {
            depName: 'myDep',
            packageJsonFile: path.join(fakeFolder, 'local', 'package.json'),
            version: '^2.0.0'
          },
          suggestions: [
            {
              messageId: 'versionUpdate',
              output: JSON.stringify({ dependencies: { myDep: '^2.0.0' } }),
              data: {
                version: '^2.0.0'
              }
            }
          ]
        }
      ]
    },
    {
      filename: packageToLint,
      output: JSON.stringify({ dependencies: { myDep: '^2.0.0' } }),
      code: JSON.stringify({ dependencies: { myDep: 'https://invalid-range.com' } }),
      errors: [
        {
          messageId: 'error',
          data: {
            depName: 'myDep',
            packageJsonFile: path.join(fakeFolder, 'local', 'package.json'),
            version: '^2.0.0'
          }
        }
      ]
    },
    {
      filename: packageToLint,
      output: JSON.stringify({ peerDependencies: { myOtherDep: '~2.0.0' } }),
      code: JSON.stringify({ peerDependencies: { myOtherDep: '^2.0.0' } }),
      options: [{ alignPeerDependencies: true }],
      errors: [
        {
          messageId: 'error',
          data: {
            depName: 'myOtherDep',
            packageJsonFile: path.join(fakeFolder, 'local', 'packages', 'my-package-2', 'package.json'),
            version: '~2.0.0'
          }
        }
      ]
    },
    {
      filename: packageToLint,
      output: JSON.stringify({ peerDependencies: { myOtherDep: '~2.0.0' } }),
      code: JSON.stringify({ peerDependencies: { myOtherDep: '^1.0.0' } }),
      options: [{ alignPeerDependencies: false }],
      errors: [
        {
          messageId: 'error',
          data: {
            depName: 'myOtherDep',
            packageJsonFile: path.join(fakeFolder, 'local', 'packages', 'my-package-2', 'package.json'),
            version: '~2.0.0'
          }
        }
      ]
    }
  ]
});
