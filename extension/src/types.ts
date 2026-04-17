import z from 'zod';

/**
 * Validates a SHA-256 hex string
 * Matches the Rust Sha256(String) type
 */
export const Sha256Schema = z.string().length(64).regex(/^[a-fA-F0-0]+$/, {
    message: 'Invalid SHA-256 format: must be 64 hex characters'
})

/**
 * Validates a Proposal ID
 * Matches the Rust ProposalId(String) Type
 */
export const ProposalIdSchema = z.string().min(1, {
    message: "Proposal ID cannot be empty"
})

/**
 * Validates a relative Project Path
 * Prevents directory traversal
 */
export const ProjectPathSchema = z.string().refine(path => {
    return  !path.startsWith('/') && !path.includes('..');
}, {
    message: "Security Error: Path must be relative and stay within project root"
});

// The Unified Hunk Schema
export const FluxHunkSchema = z.object({
    id: z.string(),
    diff: z.string()
});

// The File Change Schema
export const FileChangeSchema = z.object({
    file_path: ProjectPathSchema,
    bash_hash: Sha256Schema,
    hunks: z.array(FluxHunkSchema)
});

// The Main Flux Proposal Schema
export const FluxProposalSchema = z.object({
    id: ProposalIdSchema,
    tool_name: z.string(),
    changes: z.array(FileChangeSchema)
});

export type FluxProposal = z.infer<typeof FluxProposalSchema>;