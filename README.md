# FluxSync: The Universal Agentic Bridge

> **UNDER CONSTRUCTION**: This project is currently in early development. APIs and protocols are subject to change.

A high-performance, local-first synchronization protocol and VS Code extension that bridges the gap between autonomous AI CLIs and the developer's editor with granular 'Human-in-the-Loop' verification.

## Why FluxSync?
Modern AI CLIs (Claude Code, Gemini CLI, Aider) often struggle with "stepping on the developer's toes." Writing directly to source files causes editor flicker, loss of undo history, and dangerous race conditions. 

**FluxSync** solves this by using a **Shadow State Architecture**. Instead of direct writes, AI agents propose changes via a hidden `.flux/` directory. The FluxSync VS Code extension then provides a professional UI to review, accept, or reject these changes—down to the specific code block.

## Key Features
- **Granular Control**: Accept or Reject entire files or individual code blocks (hunks).
- **Race Condition Prevention**: Built-in "Compare-And-Swap" (CAS) logic using file hashes.
- **Atomic Operations**: Ensures no partial writes or corrupted JSON proposals.
- **Cross-CLI Support**: A universal JSON schema that any AI tool can implement.

## Roadmap
### Phase 1: Foundation (Current)
- [ ] Define the `FluxProposal` JSON Schema.
- [ ] Implement Atomic File Staging logic for CLIs.
- [ ] Setup `.flux/` directory structure and watcher.

### Phase 2: VS Code Extension
- [ ] Implement `FileSystemWatcher` for `.flux/pending`.
- [ ] Develop Virtual Side-by-Side Diff View.
- [ ] Add CodeLens support for [Accept Block] and [Reject Block].

### Phase 3: Integration & Adapters
- [ ] Create Python/Node/Rust wrappers for easy CLI integration.
- [ ] Support for multi-agent workflows (directory-based isolation).

## License
MIT