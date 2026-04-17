//! Data structures for the FluxSync protocol
//!
//! This module defines the JSON-serializable types used to communicate
//! code changes between AI agents and the IDE extension

use serde::{Deserialize, Serialize};
use std::fmt;

/// A validated, non-empty string used for IDs.
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Hash)]
pub struct ProposalId(String);

impl ProposalId {
    /// Creates a new ProposalId if the input is valid
    pub fn new(id: impl Into<String>) -> Result<Self, &'static str> {
        let s = id.into();
        if s.trim().is_empty() {
            Err("Proposal ID cannot be empty")
        } else {
            Ok(Self(s))
        }
    }
}

impl fmt::Display for ProposalId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

/// A validated SHA-256 hash string
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub struct Hash(String);

impl Hash {
    /// Creates a new hash and validates it is a hex-encoded SHA-256 string
    pub fn new(hash: impl Into<String>) -> Result<Self, &'static str> {
        let s = hash.into();
        if s.len() != 64 || !s.chars().all(|c| c.is_ascii_hexdigit()) {
            Err("Invalid SHA-256 hash format")
        } else {
            Ok(Self(s))
        }
    }
}

/// A validated relative file path
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectPath(String);

impl ProjectPath {
    /// Creates a new Path and validate
    pub fn new(path: String) -> Result<Self, &'static str> {
        if path.contains("..") || path.starts_with("/") {
            return Err("Security Erro: Path must be relative and stay within project root");
        }
        Ok(Self(path))
    }
}

/// Represents a single discrete block of code change, often called a "hunk"
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FluxHunk {
    /// A unique identifier for this specific code block to track individual acceptance
    pub id: String,
    /// The diff content in Unified Diff format
    pub diff: String,
}

/// Represents all changes proposed for a specific file
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileChange {
    /// The relative path to the file from the project root
    pub file_path: ProjectPath,
    /// The SHA-256 hash of the file *before* the agent made modifications
    /// This is used for Compare-And-Swap(CAS) verification to prevent race conditions
    pub base_hash: Hash,
    /// An array of hunks to be applied to this file
    pub hunks: Vec<FluxHunk>,
}

/// The top-level container for an AI-generated code modification proposal
///
/// This structure is serialzied to JSON and dropped into the `.flux/pending`
/// directory to be picked up by the VS Code extension
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FluxProposal {
    /// Unique UUID for the entire proposal transaction
    pub id: ProposalId,
    /// The name of the AI tool or agent generation this proposal
    pub tool_name: String,
    /// A collection of change grouped by file
    pub changes: Vec<FileChange>,
}
