import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';

const appFolder = 'test-app-apis-manager';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appFolderPath: string;
let workspacePath: string;
let appName: string;
describe('new otter application with apis-manager', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    ({ appPath: appFolderPath, workspacePath, appName } = await prepareTestEnv(appFolder));
    execAppOptions.cwd = workspacePath;
  });
  test('should add apis-manager to existing application', () => {
    packageManagerExec(`ng add @o3r/apis-manager@${o3rVersion} --skip-confirmation --project-name ${appName}`, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', { ...execAppOptions, cwd: appFolderPath })).not.toThrow();

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');

  });
});
