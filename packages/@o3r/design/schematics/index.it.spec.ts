import {
  getDefaultExecSyncOptions,
  packageManagerExec,
  packageManagerInstall,
  packageManagerRun,
  prepareTestEnv,
  setupLocalRegistry
} from '@o3r/test-helpers';

const appName = 'test-app-design';
const o3rVersion = '999.0.0';
const execAppOptions = getDefaultExecSyncOptions();
let appFolderPath: string;

describe('new otter application with Design', () => {
  setupLocalRegistry();
  beforeAll(async () => {
    appFolderPath = (await prepareTestEnv(appName)).appPath;
    execAppOptions.cwd = appFolderPath;
  });
  test('should add design to existing application', () => {
    packageManagerExec(`ng add @o3r/design@${o3rVersion} --skip-confirmation`, execAppOptions);

    expect(() => packageManagerInstall(execAppOptions)).not.toThrow();
    expect(() => packageManagerRun('build', execAppOptions)).not.toThrow();
  });
});
