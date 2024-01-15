import type { Rule } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled, setupDependencies } from '@o3r/schematics';
import type { NgAddSchematicsSchema } from './schema';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { getProjectNewDependenciesTypes, getWorkspaceConfig } from '@o3r/schematics';

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf-8' }));

/**
 * Add Otter analytics to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return (tree) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

    return setupDependencies({
      projectName: options.projectName,
      dependencies: {
        [packageJson.name]: {
          inManifest: [{
            range: `~${packageJson.version}`,
            types: getProjectNewDependenciesTypes(workspaceProject)
          }]
        }
      }
    });
  };
}

/**
 * Add Otter analytics to an Angular Project
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
