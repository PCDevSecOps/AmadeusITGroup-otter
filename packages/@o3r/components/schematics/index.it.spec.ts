import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';

const appFolder = 'test-app-components';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appPath: string;
let workspacePath: string;
let appName: string;
describe('new otter application with components', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    ({appPath, workspacePath, appName } = await prepareTestEnv(appFolder));
    execAppOptions.cwd = workspacePath;
  });
  test('should add components to existing application', () => {
    packageManagerExec(`ng add @o3r/components@${o3rVersion}  --skip-confirmation --enable-metadata-extract --project-name=${appName}`, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', { ...execAppOptions, cwd: appPath })).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');

  });
});
