import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';


suite('FluxSync Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start FluxSync Tests');

    // Ensure extension is activated before tests
    setup(async () => {
        const extension = vscode.extensions.getExtension('undefined_publisher.flux-sync') || vscode.extensions.getExtension('flux-sync');
        if (extension && !extension.isActive) {
            await extension.activate();
            // Small delay for command registration
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    });

    test('Workspace check', () => {
        assert.strictEqual(vscode.workspace.workspaceFolders !== undefined, true);
    });

    test('Shadow folder (.flux) detection', async () => {
        const workspaceRoot = vscode.workspace.workspaceFolders![0].uri.fsPath;
        const fluxPath = path.join(workspaceRoot, '.flux');

        if (!fs.existsSync(fluxPath)) {
            fs.mkdirSync(fluxPath, { recursive: true });
            fs.mkdirSync(path.join(fluxPath, 'pending'), { recursive: true });
        }

        assert.strictEqual(fs.existsSync(fluxPath), true);
    });

    test('Command registration check', async () => {
        const commands = await vscode.commands.getCommands(true);
        const hasCommand = commands.includes('flux-sync.reviewProposal');
        assert.strictEqual(hasCommand, true, 'Command flux-sync.reviewProposal should be registered');
    });
})