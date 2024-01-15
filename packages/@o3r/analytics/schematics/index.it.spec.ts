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

const appFolder = 'test-app-analytics';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appPath: string;
let workspacePath: string;
let appName: string;
describe('new otter application with analytics', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    ({ appPath, workspacePath, appName } = await prepareTestEnv(appFolder));
    execAppOptions.cwd = workspacePath;
  });
  test('should add analytics to existing application', () => {
    const relativeAppPath = posix.relative(workspacePath, appPath);
    packageManagerExec(`ng add @o3r/analytics@${o3rVersion} --project-name=${appName} --skip-confirmation`, execAppOptions);

    packageManagerExec(`ng g @o3r/core:component test-component --use-otter-analytics=false --project-name=${appName}`, execAppOptions);
    const componentPath = posix.join(relativeAppPath, 'src/components/test-component/test-component.component.ts');
    packageManagerExec(`ng g @o3r/analytics:add-analytics --path=${componentPath}`, execAppOptions);
    addImportToAppModule(appPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(workspacePath);
    expect(diff.all.some((file) => /projects[\\/]dont-modify-me/.test(file))).toBe(false);
    expect(diff.modified).toContain(posix.join(relativeAppPath, 'package.json'));
    expect(diff.added).toContain(posix.join(relativeAppPath, 'src/components/test-component/test-component.analytics.ts'));

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', {...execAppOptions, cwd: appPath})).not.toThrow();
  });
});
