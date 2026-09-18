# SUBSTACK OS BUILD

## Live surface
https://launchwhere.netlify.app

## Connected pieces
- GitHub: eoinmcgee1993/Launchwhere
- Netlify: launchwhere
- Supabase project: ohcclvcjdbftlnyrrzvt
- Substack: official MCP is the source of publication analytics
- ChatGPT: use the Substack MCP for live read-only data and this dashboard as the visual command centre
- Claude: use the same data model in an Artifact

## Automation contract
1. Read publication metrics through Substack MCP.
2. Normalize metrics into the three Supabase tables.
3. Calculate growth, conversion, revenue and content deltas.
4. Render dashboard cards and post rankings.
5. Generate an AI intelligence brief.
6. Send the brief through the chosen automation channel.

## Important
The dashboard contains demo values until a real Substack MCP ingestion path is connected. No Substack credentials or privileged Supabase keys are stored in browser code.

## Next MCP wiring
Expose tools named:
- get_publication_overview
- get_growth_series
- get_top_posts
- get_revenue_series
- analyze_publication

Each tool should read from Supabase and return compact JSON suitable for ChatGPT and Claude Artifacts.