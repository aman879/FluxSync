import * as vscode from 'vscode';
import { FluxWatcher } from './watcher';
import { FluxProposal } from './types';


// The watcher instance is declared at the module level so it can be disposed properly
let watcher: FluxWatcher | undefined;

/**
 * The 'activate' function is called when your extension is first started
 * Our activation is triggered by 'onStartupFinished' in package.json
 */
export async function activate(context: vscode.ExtensionContext) {
    console.log('[FluxSync] Initializing Agentic Bridge...');

    try {
        watcher = new FluxWatcher();
        await watcher.start();
        
        const reviewCommand = vscode.commands.registerCommand(
            'flux-sync.reviewProposal',
            async (proposal: FluxProposal) => {
                await handleReview(proposal);
            }
        );

        context.subscriptions.push(reviewCommand);
        if (watcher) {
            context.subscriptions.push(watcher);
        }
        console.log('[FluxSync] Extension active.');
    } catch (err) {
        console.error('[FluxSync] Failed to activate extension:', err);
    }
}


/**
 * Handels the logic for reviewing an AI proposal
 * In Phase 1, this prepares the Diff View and intiates CAS verification
*/
async function handleReview(proposal: FluxProposal) {
    // @ts-ignore
    const fileName = proposal.changes[0].file_path || "Unknown File";

    vscode.window.showErrorMessage(
        `FluxSdync: Starting review for ${proposal.id} (${proposal.tool_name})`
    );

    // TODO: Implement the side-by-side Diff View
}

/**
 * Called when the extension is deativated
 */
export function deactivate() {
    if (watcher) {
        watcher.dispose();
    }
}