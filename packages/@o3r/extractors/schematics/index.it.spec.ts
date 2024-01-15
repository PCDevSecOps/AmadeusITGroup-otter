import {
  getDefaultExecSyncOptions,
  getGitDiff,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';

const appFolder = 'test-app-extractors';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appPath: string;
let workspacePath: string;
let appName: string;
describe('new otter application with extractors', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    ({ appPath, workspacePath, appName } = await prepareTestEnv(appFolder));
    execAppOptions.cwd = workspacePath;
  });
  test('should add extractors to existing application', () => {
    packageManagerExec(`ng add @o3r/extractors@${o3rVersion} --skip-confirmation --project-name=${appName}`, execAppOptions);

    const diff = getGitDiff(workspacePath);
    expect(diff.modified).toContain('package.json');

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', { ...execAppOptions, cwd: appPath })).not.toThrow();
  });
});
