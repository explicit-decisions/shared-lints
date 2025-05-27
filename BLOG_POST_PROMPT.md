# Blog Post Writing Prompt Template

**Use this prompt to help Claude write posts about the "Enforced Explicit Decision" pattern and LLM-assisted development:**

---

## Context for Claude

I've been working on a project called "explicit-decisions" that implements the "Enforced Explicit Decision" pattern for LLM-assisted development. This pattern addresses a core problem: **LLMs are excellent at pattern matching but poor at understanding human context around technical decisions.**

### The Core Philosophy

When Claude sees outdated dependencies, it pattern-matches to "outdated = bad, should update." It doesn't know about deliberate version pinning, integration concerns, or team coordination needs. The AI treats these as pure technical problems when they're actually coordination problems—decisions that affect multiple people over time.

### The Solution

Make implicit decisions become hard failures that LLMs cannot ignore:

1. **Hard Failures Over Warnings**: The system must actually fail in a way the AI can't ignore
2. **Clear Guidance**: Error messages communicate project goals and provide actionable next steps
3. **Context Documentation**: Decisions are documented with reasoning, ownership, and expiration dates
4. **Periodic Review**: Old decisions expire and must be reconsidered

### Implementation

This manifests as ESLint rules that enforce:

- **No-mocks philosophy**: Factory functions instead of mocking frameworks
- **Explicit TypeScript imports**: `.ts` extensions required for local imports  
- **No NPX usage**: Explicit dependency management over arbitrary code execution

### Project Structure

```
explicit-decisions/
├── tools/eslint-config/    # Shareable ESLint configurations
├── tools/eslint-plugin/    # Custom rules enforcing explicit decisions
├── PHILOSOPHY.md           # Complete philosophy documentation
├── LLM_INSTRUCTIONS.md     # Template for LLM guidance
└── reference-repos/        # Analysis of existing codebases
```

### Key Documents Available

- `PHILOSOPHY.md` - Complete explanation of the pattern and its benefits
- `LLM_INSTRUCTIONS.md` - Template for instructing LLMs in other projects
- `README.md` - Technical documentation and usage examples
- Working ESLint configurations and custom rules

### Your Draft Blog Post

[INSERT YOUR BLOG POST DRAFT HERE]

---

## Your Task

I want you to help me refine and improve this blog post about the "Enforced Explicit Decision" pattern. Please:

### 1. Content Review

- **Strengthen the narrative**: Help make the story more compelling and relatable
- **Clarify technical concepts**: Ensure the pattern is explained clearly for both technical and non-technical readers
- **Add concrete examples**: Suggest specific scenarios where this pattern helps vs hurts

### 2. Structure Analysis

- **Flow and pacing**: Does the post build logically to its conclusions?
- **Reader engagement**: Are there places where readers might lose interest?
- **Call to action**: Is there a clear next step for readers?

### 3. Technical Accuracy

- **Verify concepts**: Do the technical explanations align with the philosophy?
- **Check examples**: Are the code examples accurate and illustrative?
- **Balance detail**: Right level of technical depth for the audience?

### 4. Writing Quality

- **Voice consistency**: Does it maintain a personal, thoughtful tone?
- **Clarity**: Are complex ideas explained simply?
- **Accessibility**: Can non-developers understand the core concepts?

### 5. Meta-Questions

- **Missing angles**: What important aspects of this pattern am I not covering?
- **Counter-arguments**: What are the potential weaknesses or limitations?
- **Real-world applicability**: Where might this pattern not be worth the overhead?

## Context About My Writing Style

Based on the draft, I tend to:

- Use personal anecdotes to introduce technical concepts
- Question whether I'm solving real problems vs creating busy work
- Write conversationally with some uncertainty ("I think...", "Maybe...")
- Focus on practical implications over theoretical frameworks

Please help me maintain this voice while strengthening the technical content and overall narrative.

## Expected Output

Please provide:

1. **Overall assessment** of the post's strengths and areas for improvement
2. **Specific suggestions** for content changes, additions, or cuts
3. **Alternative framing** ideas if you see better ways to present the concepts
4. **Technical corrections** if any explanations need clarification
5. **Reader perspective** - what questions might readers have that aren't addressed?

Focus on making this post useful for developers who work with AI tools and are experiencing similar challenges with implicit decision-making.
