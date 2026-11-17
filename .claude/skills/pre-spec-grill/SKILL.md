---
name: pre-spec-grill
description: Pre-specification interview. Use only when the /speckit-specify pre-hook asks for it, before a spec is written.
---
# Pre-spec grilling

This does the same job as /grill-with-docs, but runs automatically before /speckit-specify.

1. Use the grilling skill to interview the user about the feature they gave to /speckit-specify.
2. Use the domain-modeling skill at the same time: challenge unclear terms and update GLOSSARY.md as soon as a term is agreed.
3. If the user already ran /grill-with-docs for this feature in this session, say so and ask: "We already grilled this. Skip to the spec?"
4. If the feature is tiny (a text fix, a small UI tweak), first ask: "This looks small. Skip grilling?"
5. If the user says "skip" at any point, stop immediately and continue /speckit-specify.
6. When the user confirms a shared understanding, write a short summary of the agreed decisions, then continue /speckit-specify using that summary as the feature description.
