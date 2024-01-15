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

const appFolder = 'test-app-configuration';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appPath: string;
let workspacePath: string;
let appName: string;
describe('new otter application with configuration', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    ({ appPath, workspacePath, appName } = await prepareTestEnv(appFolder));
    execAppOptions.cwd = workspacePath;
  });
  test('should add configuration to existing application', async () => {
    const relativeAppPath = posix.relative(workspacePath, appPath);
    packageManagerExec(`ng add @o3r/configuration@${o3rVersion} --skip-confirmation --project-name=${appName}`, execAppOptions);

    const componentPath = posix.join(relativeAppPath, 'src/components/test-component/test-component.component.ts');
    packageManagerExec(`ng g @o3r/core:component test-component --project-name=${appName} --use-otter-config=false`, execAppOptions);
    packageManagerExec(`ng g @o3r/configuration:add-config --path="${componentPath}"`, execAppOptions);
    await addImportToAppModule(appPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');
    expect(diff.added).toContain(posix.join(relativeAppPath, 'src/components/test-component/test-component.config.ts'));

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', {...execAppOptions, cwd: appPath})).not.toThrow();
  });
});
