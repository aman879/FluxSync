//! FluxSync SDK (Rust 2024 edition)
//!
//! This crate handles the atomic "Shadow State" writes for AI agents

#![warn(missing_docs)]
#![forbid(unsafe_code)]

mod models;
use std::{
    fs,
    path::{Path, PathBuf},
};

use anyhow::{Context, Result};
pub use models::*;

/// The primary client for interacting with the FluxSync shadow directory
pub struct FluxClient {
    root: PathBuf,
}

impl FluxClient {
    /// Creates a new FluxClient pointed at the .flux directory
    pub fn new<P: AsRef<Path>>(path: P) -> Self {
        Self {
            root: path.as_ref().to_path_buf(),
        }
    }

    /// Submits a proposal atomically using a temporary file and a rename
    /// This prevents race conditions where the IDE reads a half-written file
    pub fn submit_porposal(&self, porposal: &FluxProposal) -> Result<()> {
        let pending_dir = self.root.join("pending");
        let temp_path = pending_dir.join(format!("{}.tmp", porposal.id));
        let final_path = pending_dir.join(format!("{}.json", porposal.id));

        let data = serde_json::to_string_pretty(porposal)?;

        fs::write(&temp_path, data)
            .with_context(|| format!("Format to write temp file at {:?}", temp_path))?;

        fs::rename(&temp_path, final_path).with_context(|| "Atomic rename failed")?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_atomic_submission() {
        let dir = tempdir().unwrap();
        let flux_path = dir.path().join(".flux");
        fs::create_dir_all(flux_path.join("pending")).unwrap();

        let client = FluxClient::new(&flux_path);
        let proposal = FluxProposal {
            id: ProposalId::new("test-123").unwrap(),
            tool_name: "test-tool".into(),
            changes: vec![],
        };

        let result = client.submit_porposal(&proposal);
        assert!(result.is_ok());
        assert!(flux_path.join("pending/test-123.json").exists());
    }
}
