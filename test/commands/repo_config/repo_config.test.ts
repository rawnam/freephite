import { expect } from 'chai';
import fs from 'fs-extra';
import path from 'path';
import { getOwnerAndNameFromURL } from '../../../src/lib/spiffy/repo_config_spf';
import { BasicScene } from '../../lib/scenes/basic_scene';
import { configureTest } from '../../lib/utils/configure_test';

for (const scene of [new BasicScene()]) {
  describe(`(${scene}): infer repo owner/name`, function () {
    configureTest(this, scene);

    it('Can infer cloned repos', () => {
      const match = getOwnerAndNameFromURL(
        'https://github.com/withfreephite/freephite-cli.git'
      );
      if (match === null) {
        expect.fail('Match should not be null');
      }
      const { owner, name } = match;

      expect(owner === 'withfreephite').to.be.true;
      expect(name === 'freephite-cli').to.be.true;
    });

    it('Can infer SSH cloned repos', () => {
      const match = getOwnerAndNameFromURL(
        'git@github.com:withfreephite/freephite-cli.git'
      );
      if (match === null) {
        expect.fail('Match should not be null');
      }
      const { owner, name } = match;
      expect(owner === 'withfreephite').to.be.true;
      expect(name === 'freephite-cli').to.be.true;
    });

    it('Can infer SSH cloned repos (with git@ configured separately)', () => {
      const match = getOwnerAndNameFromURL(
        'github.com/withfreephite/freephite-cli.git'
      );
      if (match === null) {
        expect.fail('Match should not be null');
      }
      const { owner, name } = match;
      expect(owner === 'withfreephite').to.be.true;
      expect(name === 'freephite-cli').to.be.true;
    });

    it('Can read the existing repo config when executing from a subfolder in the project', () => {
      expect(() => scene.repo.runCliCommand([`ls`])).to.not.throw(Error);
      const subDir = path.join(scene.dir, 'tmpDir');
      fs.mkdirSync(subDir);
      expect(() =>
        scene.repo.runCliCommand([`ls`], { cwd: subDir })
      ).to.not.throw(Error);
    });

    // Not sure where these are coming from but we should be able to handle
    // them.
    it('Can infer cloned repos without .git', () => {
      const clone = getOwnerAndNameFromURL(
        'https://github.com/withfreephite/freephite-cli'
      );
      if (clone === null) {
        expect.fail('Match should not be null');
      }
      expect(clone.owner === 'withfreephite').to.be.true;
      expect(clone.name === 'freephite-cli').to.be.true;

      const sshClone = getOwnerAndNameFromURL(
        'git@github.com:withfreephite/freephite-cli'
      );
      if (sshClone === null) {
        expect.fail('Match should not be null');
      }
      expect(sshClone.owner === 'withfreephite').to.be.true;
      expect(sshClone.name === 'freephite-cli').to.be.true;
    });
  });
}
