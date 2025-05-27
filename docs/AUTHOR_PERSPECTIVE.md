# Why I Built This: A Personal Perspective on AI-Assisted Development

*By Yehuda Katz*

*Through my work on Ember.js, Cargo, and Rust tooling, I've learned that reducing cognitive load is what makes developers productive. This framework emerged from my personal need to preserve technical decisions while leveraging AI effectively.*

## The Problem: AI Doesn't Know About "It Depends"

After years of building developer tools—from Ember's conventions to Cargo's dependency management—I've learned that great tooling respects context. When I started using AI assistants, they kept making the same category of suggestion: technically correct, contextually wrong.

When AI suggests updating to React 18, it's not broken—it's giving the statistically correct answer that most developers would choose if forced to pick exactly one option. But real development isn't about single correct answers. It's about "it depends" questions:

- What's your migration timeline?
- What dependencies need updating first?
- What's your testing capacity?
- What other projects share this codebase?

An experienced developer would ask these questions. AI doesn't—unless we give it the context.

## The Real Problem

This pattern was familiar from years of tooling work. Whether it's managing Rust dependencies with Cargo or maintaining JavaScript build pipelines, the core issue is the same: **our technical decisions aren't encoded in our tools**.

Even when working solo, I make countless micro-decisions:

- Why I chose this specific dependency version
- Why I'm using this "unusual" pattern
- Why I'm not following the "best practice" in this case
- Why I structured the code this particular way

These decisions live in my head. When I come back to the code weeks later—or when AI assists me—that context is gone. **And here's the key insight: I am my own biggest consumer of this context.** My future self, three months from now, won't remember why I pinned that dependency or used that "unusual" pattern.

Comments help, but they're **soft signals**. They're easy to ignore, easy to miss, easy to misinterpret. And critically, they're not structured in a way that AI (or tired-me) can reliably understand and respect.

## The Insight

What if we could make implicit decisions **impossible to ignore**? Not through more documentation or better comments, but through tooling that creates hard failures when context isn't respected?

This isn't about making AI "smarter"—it's about making our human context explicit enough that AI can work with it effectively. It's about creating a new kind of development workflow that treats AI as a stakeholder in our communication patterns.

## A Crucial Realization: What's Good for AI is Good for Humans

Here's what I discovered: **every improvement I made for AI collaboration also helped me**. When I had the brain-space to think through a complex problem and encoded that thinking into a lint rule, I was creating a knowledge artifact for when I'd lost that context.

When I created actionable error messages like:

```
✖ Dependency @types/node is outdated (^20.0.0 → ^22.0.0)
  Decision required: Run 'pnpm deps:interactive' to document your choice
  Context: This affects TypeScript definitions for Node.js APIs
```

I wasn't just helping AI. I was primarily helping **future me**—the person who, six months from now, won't remember why I made that decision. And if it helps future me, it helps future teammates too. The fact that it also helps AI is a bonus, but the real win is preserving context for any developer who touches this code.

A reduction in cognitive load is proportional to gain in productivity. When we encode our decisions into tools—not just documentation—we free developers from the burden of remembering and applying context-specific constraints.

This principle drives modern tooling design. Now it needs to drive how we think about AI collaboration.

## My Workflow: From Exploration to Consolidation

I've been using AI code assistants extensively and discovered a two-phase pattern that works:

**Phase 1: Exploration** - Move fast, try things, let AI suggest whatever. This is where you're learning and experimenting.

**Phase 2: Consolidation** - Encode the decisions you've made into tooling. This is where you make your learning sustainable.

The explicit-decisions framework is built for Phase 2. It's for when you've figured out what works and want to lock it in—not just for AI, but for yourself when you've forgotten the details.

This matters now because AI makes Phase 1 incredibly fast. But without Phase 2, you'll find yourself correcting the same AI suggestions over and over, fighting your tools instead of leveraging them.

## My Approach

Let me be honest about my use case: I built this framework to solve my own problem—preserving context across time and AI interactions. But the principles apply wherever developers need to:

- Work on multiple projects with different constraints
- Remember decisions months later (or help teammates understand them)
- Want AI to be helpful, not destructive
- Value sustainable velocity over initial speed

The explicit-decisions framework is opinionated because it needs to be—weak patterns don't create behavior change. It focuses on:

1. **Hard failures over soft warnings** - If it's important, it should break the build
2. **Explicit over implicit** - Every "it depends" decision must be documented
3. **Tooling over process** - Encode decisions in tools, not documentation
4. **Review over stagnation** - Decisions expire and must be reconsidered

While I built this for my own workflow, these same principles—making implicit knowledge explicit, reducing cognitive load, preserving context—are exactly what teams struggle with too.

## The "Convention as Specification" Insight

Just like Cargo enforces consistent dependency management and rustfmt enforces consistent style, this framework turns your project-specific conventions into executable specifications. It's the same principle that makes modern tooling so effective.

When you see:

```
✖ Mock usage detected in test file
  Use factory functions instead: see docs/testing-philosophy.md
  Replace jest.fn() with createTestUser() from './test-factories'
```

That's not just an error—it's a specification. Clear enough for Claude to implement, clear enough for a junior developer to follow, clear enough for you when you're tired. This is what I learned from building Rust's error messages: good errors teach while they correct.

## What Success Looks Like: Turning "Best Practices" into "It Depends"

Success isn't about AI avoiding "mistakes." Success is teaching AI (and your future self) to understand the "it depends" nature of your decisions.

Without this framework, AI gives you the "best practice" answer—update to React 18, use the latest patterns, follow the style guide. With this framework, AI understands:

- "We're staying on React 16 because our embedded widget needs IE11 support"
- "We use factories instead of mocks because our tests need to run in multiple environments"
- "We vendor this dependency because we've patched a critical bug"

The framework transforms one-size-fits-all suggestions into context-aware assistance.

The payoff:

- AI stops suggesting the same inappropriate changes
- You stop wondering "why did I do it this way?" months later
- Your exploration decisions become sustainable patterns
- The cognitive load of maintaining quality stays manageable
- You can focus on new problems instead of re-litigating old decisions

## An Invitation

This framework represents my solution to a personal problem: how do I preserve my technical decisions across time and AI interactions? But the problem isn't unique to solo developers.

If you're frustrated by AI making the same context-ignoring suggestions over and over, this is for you.

If you've ever wondered "why did we make this decision?" when looking at code, this is for you.

If you want to turn hard-won project knowledge into sustainable tooling, this is for you.

Whether you're working alone or on a team, the core challenge is the same: making "it depends" decisions stick. The principles that help me remember my own context would help teams share theirs.

## The Bigger Picture

Throughout my work on developer tools—from Ember's conventions to Cargo's dependency management to Rust's error messages—I've focused on making developers more productive by encoding knowledge into tools.

This framework extends that philosophy to AI-assisted development. We're not fighting AI or restricting it—we're creating the interfaces that let it work with us productively.

Good tooling has always been about making the right thing easy. With AI in the mix, it's about making the right thing unambiguous.

*Note: This repository itself uses the explicit-decisions framework. You can see the patterns in action in our dependency-versions.json, our ESLint rules, and our error messages. We're not just talking about these patterns—we're living them.*

## Try It Yourself

If any of this resonates, here's how to start:

1. **Start small** - Pick one rule that addresses your biggest pain point
2. **Run it on real code** - See what it catches in your actual projects
3. **Document one decision** - Pick something that keeps coming up and make it explicit
4. **See what happens** - Watch how it changes your interactions with AI (and your future self)

The code is there, the patterns are documented, and I'm curious to see how others will use and extend these ideas.

---

*Want to discuss? Found this helpful? I'd love to hear your experiences—[open an issue](https://github.com/explicit-decisions/shared-lints/issues) or find me on social media.*
