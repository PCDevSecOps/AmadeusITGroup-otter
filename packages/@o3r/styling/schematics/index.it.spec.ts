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

const appFolder = 'test-app-styling';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appPath: string;
let workspacePath: string;
let appName: string;
describe('new otter application with styling', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    ({ appPath, workspacePath, appName } = await prepareTestEnv(appFolder));
    execAppOptions.cwd = workspacePath;
  });
  test('should add styling to existing application', async () => {
    const relativeAppPath = posix.relative(workspacePath, appPath);
    packageManagerExec(`ng add @o3r/styling@${o3rVersion} --enable-metadata-extract --skip-confirmation`, execAppOptions);

    packageManagerExec(`ng g @o3r/core:component --defaults=true test-component --use-otter-theming=false --project-name=${appName}`, execAppOptions);
    const filePath = posix.join(relativeAppPath, 'src/components/test-component/test-component.style.scss');
    packageManagerExec(`ng g @o3r/styling:add-theming --path="${filePath}"`, execAppOptions);
    addImportToAppModule(appPath, 'TestComponentModule', 'src/components/test-component');

    await addImportToAppModule(appPath, 'TestComponentModule', 'src/components/test-component');

    const diff = getGitDiff(execAppOptions.cwd as string);
    expect(diff.modified).toContain('package.json');
    expect(diff.added).toContain(posix.join(relativeAppPath, 'src/components/test-component/test-component.style.theme.scss'));

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', { ...execAppOptions, cwd: appPath })).not.toThrow();
  });
});
