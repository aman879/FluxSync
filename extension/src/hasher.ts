import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

/**
 * Utility to calculate SHA-256 hases of workspace files
 * This is used to verify the 'base_hash' provided in FluxProposals
 */
export class FluxHasher {
    /**
     * Calculates the SHA-256 hash of a file on disk
     * @param relativePath The path relative to the workspace root
     */
    public static async calculateHash(relativePath: string): Promise<string | null> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return null;
        }

        const fullPath = path.join(workspaceFolders[0].uri.fsPath, relativePath);

        if (!fs.existsSync(fullPath)) {
            return null;
        }

        try {
            const fileBuffer = fs.readFileSync(fullPath);
            const hashSum = crypto.createHash('sha256');
            hashSum.update(fileBuffer);
            return hashSum.digest('hex');
        } catch (err) {
            console.error(`[FluxSync] Hashing failed for ${relativePath}: `, err);
            return null;
        }
    }

    /**
     * Verifies if the file on disk matches the expected hash
     * This prevents applying AI changes to a file the user just edited manually
     */
    public static async VerifyStability(relativePath: string, expectedHash: string): Promise<boolean> {
        const currentHash = await this.calculateHash(relativePath);
        return currentHash === expectedHash;
    }
}

