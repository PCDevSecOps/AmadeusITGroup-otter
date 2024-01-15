import {
  addImportToAppModule,
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';
import { posix } from 'node:path';

const appFolder = 'test-app-rules-engine';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appPath: string;
let workspacePath: string;
let appName: string;
describe('new otter application with rules-engine', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    ({ appPath, workspacePath, appName } = await prepareTestEnv(appFolder));
    execAppOptions.cwd = workspacePath;
  });
  test('should add rules engine to existing application', async () => {
    const relativeAppPath = posix.relative(workspacePath, appPath);
    packageManagerExec(`ng add @o3r/rules-engine@${o3rVersion} --enable-metadata-extract --project-name=${appName} --skip-confirmation`, execAppOptions);

    const componentPath = posix.join(relativeAppPath, 'src/components/test-component/test-component.component.ts');
    packageManagerExec(`ng g @o3r/core:component test-component --activate-dummy --use-rules-engine=false --project-name=${appName}`, execAppOptions);
    packageManagerExec(`ng g @o3r/rules-engine:rules-engine-to-component --path=${componentPath}`, execAppOptions);
    await addImportToAppModule(appPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', {...execAppOptions, cwd: appPath})).not.toThrow();
  });
});
