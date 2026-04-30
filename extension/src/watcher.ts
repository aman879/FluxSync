import * as vscode from 'vscode';
import * as fs from 'fs';
import { FluxProposal, FluxProposalSchema } from './types';
import { FluxHasher } from './hasher';

/**
 * The Watcher service monitors the `.flux/pending` directory
 * It is reposible for detecting new AI proposals and initating the review UI
 */
export class FluxWatcher {
    private watcher: vscode.FileSystemWatcher | undefined;

    /**
     * Initializes the watcher for the current workspace
     */
    public async start() {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            console.warn('[FluxSync] No workspace folders found. Watcher will not start.');
            return;
        }

        const pattern = new vscode.RelativePattern(
            vscode.workspace.workspaceFolders[0],
            '.flux/pending/*.json'
        );


        this.watcher = vscode.workspace.createFileSystemWatcher(pattern);

        this.watcher.onDidChange(async (uri) => {
            console.log(`[FluxSync] New proposal detected: ${uri.fsPath}`);
            await this.processProposal(uri);
        });

        this.watcher.onDidChange(async (uri) => {
            await this.processProposal(uri);
        })

        console.log('[FluxSync] Watcher is active and monitoring .flux/pending');
    }

    /**
     * Reads, parses and validates the proposal using Zod.
     */
    private async processProposal(uri: vscode.Uri) {
        try {
            const rawData = fs.readFileSync(uri.fsPath, 'utf8');
            const json = JSON.parse(rawData);

            const result = FluxProposalSchema.safeParse(json);

            if (!result.success) {
                console.error('[FluxSync] Validation failed:', result.error.format());
                vscode.window.showErrorMessage(`FluxSync: Invalid proposal format in ${uri.fsPath}`);
                return;
            }

            const proposal: FluxProposal = result.data;
            const fileChange = proposal.changes[0];
            const isStable = await FluxHasher.VerifyStability(
                fileChange.file_path,
                fileChange.base_hash
            );

            if (!isStable) {
                vscode.window.showWarningMessage(
                    `FluxSync: File ${fileChange.file_path} has changed since the AI's proposal. Review with caution`
                )
            }
            this.notifyUser(proposal);
        } catch (err) {
            console.error('[FluxSync] Error processing file:', err);
        }
    }

    /**
     * Triggers the UI notification or Diff view
     */
    private notifyUser(proposal: FluxProposal) {
        vscode.window.showInformationMessage(
            `AI Proposal Received: ${proposal.tool_name} wants to modify ${proposal.changes.length} file(s).`,
            'Review Changes'
        ).then(selection => {
            if (selection == 'Review Changes') {
                vscode.commands.executeCommand('flux-sync.reviewProposal', proposal);
            }
        });
    }

    public dispose() {
        this.watcher?.dispose();
    }
}