import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

/**
 * This is the entry point for the extension host tests.
 * It intializes Mocha and loads all files matched *.test.js
 */
export async function run(): Promise<void> {
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, '.');

    const files = await glob('**/**.test.js', { cwd: testsRoot });
    files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

    return new Promise((c, e) => {
        try {
            // Run the mocha test
            mocha.run((failures: number) => {
                if (failures > 0) {
                    e(new Error(`${failures} tests failed.`));
                } else {
                    c();
                }
            });
        } catch (err) {
            console.error(err);
            e(err);
        }
    });
}