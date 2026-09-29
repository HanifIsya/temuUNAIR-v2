---
id: ADR-0003
title: PostgreSQL 16 with pgvector as the single data store
status: accepted
owner: AR
updated: 2026-09-29
depends_on: ["ADR-0001", "ARCH-ERD"]
source_refs: ["DEC-002", "Blueprint §5A.5"]
---

# ADR-0003 — PostgreSQL 16 with pgvector as the single data store

## Context

The PDF leaves the database open ("MySQL/PostgreSQL"). Matching needs vector similarity over
image and text embeddings; the queue needs a durable store; the data model is relational.

## Options

1. **MySQL + external vector DB** (Pinecone/Qdrant/Milvus). Extra service, extra credentials,
   consistency gaps between relational rows and vectors.
2. **PostgreSQL 16 + pgvector**. Relational + vectors in one store, transactional consistency,
   HNSW indexes, one backup story.
3. **PostgreSQL + separate vector service**. Better raw ANN performance at huge scale, but
   unnecessary at campus scale and doubles ops.

## Decision

Option 2. `vector(512)` for CLIP image and text embeddings, `vector(384)` for sentence
embeddings, HNSW indexes with cosine ops. pg-boss (ADR-0005) also runs on the same instance.

## Consequences

- One database to run, back up and migrate; matches and reports are transactionally consistent.
- pgvector HNSW is sufficient for ≤ tens of thousands of vectors; re-evaluate beyond that.
- Vector columns are never exposed via the API; only server-side scoring reads them.
- Dimension changes (new models) require a re-embed migration and an `algo_version` bump.
