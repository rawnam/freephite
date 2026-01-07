import { expect } from 'chai';
import tmp from 'tmp';
import * as fs from 'fs-extra';
import {
  TProfile,
  userConfigFactory,
} from '../../../src/lib/spiffy/user_config_spf';

// Test cases for userConfigFactory with a focus on the profile helper functions.
describe('userConfigFactory', () => {
  let originalEnv: { [key: string]: string | undefined };
  let configPath: string;
  let tmpDir: tmp.DirResult;

  beforeEach(() => {
    originalEnv = { ...process.env };
    tmpDir = tmp.dirSync();
    configPath = `${tmpDir.name}/config.json`;
  });

  afterEach(() => {
    Object.assign(process.env, originalEnv);
    fs.removeSync(configPath);
    fs.emptyDirSync(tmpDir.name);
    tmpDir.removeCallback();
  });

  const testCases = [
    {
      // Default profile case.
      envVars: {},
      profile: {
        alternativeProfiles: [
          {
            name: 'default',
            hostPrefix: 'prod',
            authToken: '123',
          } as TProfile,
        ],
      },
      results: {
        apiServer: 'https://api.prod.freephite.dev/v1',
        appServer: 'https://app.prod.freephite.dev',
        authToken: '123',
      },
    },
    {
      // Case with no alternative profiles.
      envVars: {},
      profile: {
        authToken: '123',
      },
      results: {
        apiServer: 'https://api.freephite.dev/v1',
        appServer: 'https://app.freephite.dev',
        authToken: '123',
      },
    },
    {
      // Case testing a staging profile.
      envVars: { FREEPHITE_PROFILE: 'STAGING' },
      profile: {
        alternativeProfiles: [
          {
            name: 'STAGING',
            hostPrefix: 'stg',
            authToken: '234',
          } as TProfile,
        ],
      },
      results: {
        apiServer: 'https://api.stg.freephite.dev/v1',
        appServer: 'https://app.stg.freephite.dev',
        authToken: '234',
      },
    },
  ];
  testCases.forEach((data) => {
    it('Can read the expected values from a user config profile', () => {
      Object.assign(process.env, { ...originalEnv, ...data.envVars });
      fs.writeFileSync(configPath, JSON.stringify(data.profile));
      const userConfig = userConfigFactory.load(configPath);
      expect(userConfig.getApiServerUrl()).to.equal(data.results.apiServer);
      expect(userConfig.getAppServerUrl()).to.equal(data.results.appServer);
      expect(userConfig.getAuthToken()).to.equal(data.results.authToken);
    });
  });
});
