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

const appFolder = 'test-app-testing';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appPath: string;
let workspacePath: string;
let appName: string;
describe('new otter application with testing', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    ({ appPath, workspacePath, appName } = await prepareTestEnv(appFolder));
    execAppOptions.cwd = workspacePath;
  });
  test('should add testing to existing application', async () => {
    const relativeAppPath = posix.relative(workspacePath, appPath);
    packageManagerExec(`ng add @o3r/testing@${o3rVersion} --skip-confirmation --project-name=${appName}`, execAppOptions);

    const componentPath = posix.join(relativeAppPath, 'src/components/test-component/container/test-component-cont.component.ts');
    packageManagerExec(`ng g @o3r/core:component test-component --use-component-fixtures=false --component-structure="full" --project-name=${appName}`, execAppOptions);
    packageManagerExec(`ng g @o3r/testing:add-fixture --path="${componentPath}"`, execAppOptions);
    await addImportToAppModule(appPath, 'TestComponentContModule', 'src/components/test-component');

    const diff = getGitDiff(execAppOptions.cwd as string);
    expect(diff.added).toContain(posix.join(relativeAppPath, 'src/components/test-component/container/test-component-cont.fixture.ts'));

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', {...execAppOptions, cwd: appPath})).not.toThrow();
  });
});
