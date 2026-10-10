# GENERAL PROJECT MANAGEMENT — STUDY BLUEPRINT

> **Purpose:** A general, methodology-neutral blueprint for learning and applying project management before specializing in software engineering.
>
> **Core principle:** A project is not managed by jumping straight into implementation. It is managed by deliberately moving from **purpose → definition → planning → execution → control → delivery → learning**.

---

## 1. WHAT PROJECT MANAGEMENT IS

Project management is the disciplined process of guiding a temporary effort from an intended outcome to a completed result while managing constraints, uncertainty, people, resources, quality, and change.

A project normally has:

- A defined objective or outcome
- A beginning and an end
- A defined or evolving scope
- Deliverables
- Constraints
- Resources
- Stakeholders
- Risks and uncertainties
- Decisions and trade-offs
- A method for determining whether the result is acceptable

### The central question

> **What are we trying to accomplish, why does it matter, what will it take, and how will we know when we are finished?**

---

# 2. THE PROJECT MANAGEMENT MENTAL MODEL

Use this as the high-level schematic:

```text
                         PROJECT PURPOSE
                              │
                              ▼
                         PROJECT GOAL
                              │
                              ▼
                    SUCCESS CRITERIA
                              │
                              ▼
                      REQUIREMENTS
                              │
                              ▼
                    SCOPE + DELIVERABLES
                              │
                              ▼
                   WORK BREAKDOWN / TASKS
                              │
                              ▼
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
          SCHEDULE         RESOURCES          COST
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                            RISKS
                              │
                              ▼
                           PLAN
                              │
                              ▼
                          EXECUTION
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
          MONITOR          QUALITY           CHANGES
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                          DELIVERABLE
                              │
                              ▼
                       ACCEPTANCE / CLOSE
                              │
                              ▼
                     RETROSPECTIVE / LESSONS
```

This is the backbone. Individual methodologies may arrange these activities differently, but the underlying management problems remain.

---

# 3. PROJECT LIFECYCLE

A practical general lifecycle is:

1. **Initiate**
2. **Define**
3. **Plan**
4. **Execute**
5. **Monitor & Control**
6. **Close**
7. **Learn**

These stages are not necessarily rigid or strictly sequential. Real projects often loop backward when new information appears.

```text
INITIATE
   ↓
DEFINE
   ↓
PLAN
   ↓
EXECUTE ↔ MONITOR & CONTROL
   ↓
DELIVER
   ↓
CLOSE
   ↓
LEARN
   ↺
```

The important distinction is:

> **Planning is not a one-time event. Planning is continuously refined as reality provides new information.**

---

# 4. PROJECT INITIATION

Before planning tasks, establish why the project should exist.

### Identify

- The problem or opportunity
- The desired outcome
- The people who benefit
- The reason the project matters
- Major constraints
- Initial assumptions
- Major risks
- The person responsible for the project
- The broad definition of success

### Key question

> **Should this project exist at all?**

A project should not automatically be started simply because an idea sounds interesting.

### Basic initiation statement

```text
Project:
Problem:
Opportunity:
Purpose:
Desired outcome:
Primary users/stakeholders:
Major constraints:
Initial assumptions:
Initial risks:
Definition of success:
```

---

# 5. PROJECT GOALS AND SUCCESS CRITERIA

A goal describes what the project is trying to achieve.

Success criteria describe how success will be judged.

Do not confuse:

- **Activity:** what the team does
- **Output:** what the project produces
- **Outcome:** what changes because of the output
- **Impact:** the broader benefit

Example:

```text
Activity:
Build a reporting system.

Output:
A functioning reporting system.

Outcome:
Users can obtain reports without manually compiling data.

Impact:
Reporting takes less time and decisions can be made faster.
```

### Success criteria should answer:

- What must be true at completion?
- Who decides whether it is acceptable?
- What measurable evidence proves success?
- What conditions would cause the project to be considered unsuccessful?

---

# 6. STAKEHOLDERS

Stakeholders are people or organizations that can affect the project, are affected by it, or have an interest in its outcome.

Potential stakeholders include:

- Customer
- Sponsor
- End users
- Project manager
- Developers/workers
- Suppliers
- Managers
- Regulators
- Partners
- Support staff
- Other affected groups

### Stakeholder management

Understand:

- Their interests
- Their expectations
- Their authority
- Their influence
- Their needs
- Their concerns
- Their communication requirements

A technically successful project can still fail if the important stakeholders reject the result.

---

# 7. REQUIREMENTS

Requirements describe what the project must satisfy.

Separate:

### Functional requirements
What the product/system/process must do.

### Non-functional requirements
How well it must perform or what constraints it must satisfy.

Examples:

- Performance
- Security
- Reliability
- Usability
- Maintainability
- Legal/regulatory constraints
- Compatibility
- Availability

### Requirement discipline

Every important requirement should ideally be:

- Understandable
- Relevant
- Testable/verifiable
- Traceable to a goal or stakeholder need
- Prioritized

Avoid turning vague desires into uncontrolled work.

---

# 8. SCOPE

Scope defines the boundaries of the project.

### In scope

What the project will deliver.

### Out of scope

What the project explicitly will not deliver.

This distinction is critical.

```text
PROJECT SCOPE
├── Included
│   ├── Deliverable A
│   ├── Deliverable B
│   └── Deliverable C
│
└── Excluded
    ├── Feature X
    ├── Service Y
    └── Future improvement Z
```

### Scope creep

Scope creep occurs when additional work enters the project without proper evaluation of its effects.

The correct response is not automatically:

> "No."

It is:

> "What does this change do to scope, time, cost, resources, risk, and quality?"

---

# 9. DELIVERABLES

A deliverable is a tangible or verifiable result produced by the project.

Examples:

- Product
- Software system
- Report
- Design
- Training material
- Infrastructure
- Documentation
- Prototype
- Business process

Define deliverables before breaking them into tasks.

### Deliverable hierarchy

```text
PROJECT
  └── Major Deliverable
       ├── Sub-deliverable
       ├── Sub-deliverable
       └── Sub-deliverable
```

---

# 10. WORK BREAKDOWN STRUCTURE (WBS)

The WBS decomposes the project into manageable pieces of work.

Start with outcomes/deliverables and progressively break them down.

```text
PROJECT
├── Deliverable 1
│   ├── Work package 1.1
│   ├── Work package 1.2
│   └── Work package 1.3
│
├── Deliverable 2
│   ├── Work package 2.1
│   └── Work package 2.2
│
└── Deliverable 3
    ├── Work package 3.1
    └── Work package 3.2
```

The WBS prevents the project from existing as one giant, intimidating task.

---

# 11. TASKS AND DEPENDENCIES

Once work is decomposed, identify tasks and their relationships.

A task may:

- Depend on another task
- Enable another task
- Run in parallel
- Block another task
- Require a particular resource

Example:

```text
Requirements
     ↓
Design
     ↓
Implementation
     ↓
Testing
     ↓
Delivery
```

But real projects often contain parallel work:

```text
              ┌── Design ──────┐
Requirements ─┤                ├── Integration
              └── Procurement ─┘
```

Understanding dependencies is essential for realistic scheduling.

---

# 12. ESTIMATION

Estimation predicts the resources needed to complete work.

Estimate:

- Effort
- Duration
- Cost
- Resources
- Materials
- Capacity

### Important distinction

**Effort ≠ duration.**

If a task requires 16 hours of work, that does not automatically mean it will finish in two calendar days.

Availability, interruptions, dependencies, and parallel work matter.

### Estimation principle

> **An estimate is a reasoned prediction, not a promise.**

Improve estimates using:

- Historical information
- Similar projects
- Decomposition
- Expert judgment
- Prototypes/spikes
- Ranges rather than false precision

---

# 13. SCHEDULING

A schedule determines when work is expected to occur.

Important concepts:

- Tasks
- Dependencies
- Duration
- Milestones
- Start/end dates
- Critical path
- Slack/float
- Parallel work
- Resource availability

### Milestones

Milestones are significant checkpoints rather than ordinary tasks.

Example:

```text
M1 — Project approved
M2 — Requirements approved
M3 — Design complete
M4 — MVP complete
M5 — Testing complete
M6 — Release accepted
M7 — Project closed
```

---

# 14. RESOURCES

Projects require limited resources.

Typical resource categories:

- People
- Time
- Money
- Equipment
- Software/tools
- Facilities
- Information
- External services

Resource planning asks:

> **What do we need, when do we need it, and do we actually have it?**

For a solo project, the same principle applies. The "team" may simply be one person with limited time, energy, skills, hardware, and money.

---

# 15. COST AND BUDGET

Budgeting identifies expected project costs.

Possible costs:

- Labour
- Hardware
- Software
- Hosting
- Services
- Materials
- Training
- Marketing
- Maintenance
- Contingency

A project can fail even when technically successful if it consumes more resources than its value justifies.

---

# 16. RISK MANAGEMENT

Risk is uncertainty that could affect project objectives.

A practical risk process:

```text
IDENTIFY
   ↓
ANALYZE
   ↓
PRIORITIZE
   ↓
PLAN RESPONSE
   ↓
MONITOR
   ↓
UPDATE
```

For each important risk, consider:

```text
Risk:
Cause:
Probability:
Impact:
Priority:
Early warning signs:
Preventive action:
Contingency:
Owner:
Status:
```

### Common response strategies

- Avoid
- Reduce/mitigate
- Transfer
- Accept

### Important distinction

A **risk** has not happened yet.

An **issue** is a problem that has already happened.

Do not manage issues as if they were still hypothetical risks.

---

# 17. ASSUMPTIONS AND CONSTRAINTS

### Assumption

Something believed to be true for planning purposes.

### Constraint

A limitation imposed on the project.

Examples:

```text
Assumption:
The required API will remain available.

Constraint:
Budget cannot exceed R1,000.

Assumption:
The user can dedicate 10 hours/week.

Constraint:
Only existing hardware is available.
```

Unexamined assumptions are a major source of project failure.

---

# 18. QUALITY MANAGEMENT

Quality means meeting the defined requirements and being fit for the intended purpose.

Quality management includes:

### Quality planning
Define what "good enough" means.

### Quality assurance
Design processes that increase the likelihood of producing quality results.

### Quality control
Inspect/test the actual results.

Do not wait until the end to discover that the definition of "done" was never clear.

---

# 19. COMMUNICATION MANAGEMENT

Communication keeps stakeholders aligned.

Define:

- Who needs information
- What they need
- When they need it
- How it will be communicated
- Who is responsible

Possible communication artifacts:

- Status reports
- Meetings
- Decision records
- Change requests
- Progress dashboards
- Documentation
- Demonstrations

For a solo project, written documentation becomes especially important because it acts as external memory.

---

# 20. CHANGE MANAGEMENT

Change is normal.

The goal is not to eliminate change. The goal is to control its consequences.

A useful change process:

```text
CHANGE REQUEST
      ↓
WHY IS IT NEEDED?
      ↓
IMPACT ANALYSIS
      ↓
DECISION
      ↓
UPDATE PLAN
      ↓
IMPLEMENT
      ↓
VERIFY
```

Evaluate changes against:

- Scope
- Schedule
- Cost
- Resources
- Risk
- Quality
- Stakeholders
- Dependencies

---

# 21. EXECUTION

Execution is where planned work becomes actual work.

The project manager must:

- Coordinate work
- Resolve blockers
- Manage resources
- Maintain communication
- Protect scope
- Monitor quality
- Make decisions
- Adapt to new information
- Keep momentum

Execution does not mean blindly following the original plan.

> **The plan is a control system, not a sacred document.**

---

# 22. MONITORING AND CONTROL

Monitoring asks:

> What is actually happening?

Control asks:

> What should we do about the difference?

Track:

- Planned vs actual progress
- Schedule
- Cost
- Scope
- Quality
- Risks
- Issues
- Resource usage
- Decisions
- Changes

### The control loop

```text
PLAN
  ↓
DO
  ↓
MEASURE
  ↓
COMPARE
  ↓
CORRECT
  ↓
REPLAN
  ↺
```

This feedback loop is one of the most important concepts in project management.

---

# 23. PROJECT STATUS

A useful status model:

### Green
Project is within acceptable boundaries.

### Amber
There is a significant concern requiring attention.

### Red
The project is outside acceptable boundaries or cannot proceed normally.

Status should be based on evidence rather than feelings.

---

# 24. DECISION MANAGEMENT

Projects constantly require decisions.

Record important decisions with:

```text
Decision:
Date:
Context:
Options considered:
Decision:
Reason:
Consequences:
Owner:
Review date (if needed):
```

This prevents repeated debates and preserves the reasoning behind important choices.

---

# 25. DOCUMENTATION

Documentation should preserve information that will remain useful.

Document:

- Purpose
- Scope
- Requirements
- Architecture/design where applicable
- Plans
- Risks
- Decisions
- Changes
- Important assumptions
- Test/acceptance evidence
- Lessons learned

### Documentation principle

> **Documentation is a tool for reducing future confusion, not a competition to produce the most pages.**

The project README should be a distilled source of truth, not a diary of every conversation.

---

# 26. PROJECT GOVERNANCE

Governance defines who has authority to make decisions.

Clarify:

- Who owns the project?
- Who approves scope?
- Who approves changes?
- Who accepts deliverables?
- Who owns risks?
- Who can stop the project?
- Who resolves conflicts?

For a solo project, the same questions still matter. You are simultaneously the project manager, decision maker, builder, and stakeholder — which makes explicit decisions even more important.

---

# 27. PROJECT CONTROL BOUNDARIES

A project needs boundaries for acceptable deviation.

Define tolerances for:

- Time
- Cost
- Scope
- Quality
- Risk

Example:

```text
Schedule tolerance: ±1 week
Budget tolerance: ±10%
Quality: all critical acceptance tests must pass
Scope: no major feature additions without review
```

This creates an objective trigger for intervention.

---

# 28. DEFINITION OF DONE

Before execution begins, establish what completion means.

A deliverable is not finished merely because the implementation work is finished.

A practical definition may include:

```text
Implemented
+ Tested
+ Documented
+ Reviewed
+ Accepted
+ Deployed/delivered
= DONE
```

The exact conditions depend on the project.

---

# 29. ACCEPTANCE

The project must have a mechanism for deciding whether the result is acceptable.

Acceptance should be based on predefined criteria rather than:

> "It seems finished."

Ask:

- Does it satisfy the requirements?
- Does it satisfy the success criteria?
- Has quality been verified?
- Has the intended stakeholder accepted it?
- Are known remaining issues acceptable?

---

# 30. PROJECT CLOSURE

A project is not complete when the final task is performed.

Closure includes:

- Confirming deliverables
- Obtaining acceptance
- Closing outstanding work
- Recording unresolved issues
- Finalizing documentation
- Closing contracts/resources where applicable
- Recording financial information
- Archiving project information
- Capturing lessons learned
- Conducting a retrospective

---

# 31. RETROSPECTIVE AND LESSONS LEARNED

After completion, ask:

### What worked?

### What failed?

### What surprised us?

### What should we repeat?

### What should we stop doing?

### What should we change next time?

### Which assumptions were wrong?

### Which estimates were inaccurate?

### What did we learn about ourselves, the process, and the problem?

The goal is not self-criticism.

The goal is to turn experience into improved future performance.

---

# 32. THE PROJECT MANAGEMENT KNOWLEDGE MAP

These are the major concepts to master:

```text
PROJECT MANAGEMENT
│
├── Purpose & Business/Personal Value
├── Goals & Success Criteria
├── Stakeholders
├── Requirements
├── Scope
├── Deliverables
├── Work Breakdown
├── Tasks & Dependencies
├── Estimation
├── Scheduling
├── Milestones
├── Resources
├── Cost & Budget
├── Assumptions
├── Constraints
├── Risk
├── Quality
├── Communication
├── Change Management
├── Execution
├── Monitoring & Control
├── Decisions
├── Governance
├── Acceptance
├── Closure
└── Lessons Learned
```

This is the core study map.

---

# 33. THE PROJECT MANAGEMENT CONTROL SYSTEM

A useful way to understand the entire discipline is as a feedback system:

```text
                 ┌───────────────┐
                 │    PURPOSE    │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │     PLAN      │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │     WORK      │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │    RESULT     │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │    MEASURE    │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │    COMPARE    │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │    DECIDE     │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │    ADJUST     │
                 └───────┬───────┘
                         │
                         └──────────→ PLAN
```

This explains why project management is fundamentally a discipline of **planning, coordination, measurement, decision-making, and adaptation**.

---

# 34. COMMON PROJECT FAILURE PATTERNS

Learn these early.

### Starting before defining the problem
Building something before knowing what success means.

### Starting implementation before planning
Jumping into code/work immediately.

### Scope explosion
Continuously adding features or requirements.

### Unrealistic deadlines
Confusing optimism with estimation.

### Ignoring dependencies
Planning tasks as if everything can happen independently.

### Ignoring risks
Assuming problems will somehow solve themselves.

### No definition of done
Continuing indefinitely because completion is subjective.

### Over-documentation
Producing documentation that nobody uses.

### Under-documentation
Forgetting decisions, assumptions, requirements, or important project knowledge.

### No progress measurement
Working without knowing whether the project is actually moving toward completion.

### Refusing to change the plan
Treating the original plan as more important than reality.

### Abandoning the project when difficulty appears
Interpreting difficulty as proof that the project should be abandoned rather than analyzing the cause.

---

# 35. THE "SMALL PROJECT FIRST" PRINCIPLE

Project management should be learned through progressively larger projects.

A useful progression:

```text
Tiny project
   ↓
Small project
   ↓
Medium project
   ↓
Complex project
```

Do not attempt to learn project management by immediately creating a massive system.

The objective is to repeatedly practice:

```text
Define → Plan → Execute → Measure → Adjust → Finish → Learn
```

Finishing realistic projects is more valuable than accumulating abandoned projects.

---

# 36. PERSONAL PROJECT MANAGEMENT

Project management applies even when there is no company or team.

For a solo engineer:

```text
You
├── Project manager
├── Analyst
├── Designer
├── Engineer
├── Tester
└── Stakeholder
```

This makes project management especially important because there is no separate person to remember requirements, question scope, monitor risks, or challenge unrealistic plans.

A written system becomes your external project-management memory.

---

# 37. HOW THIS CONNECTS TO SOFTWARE ENGINEERING

General project management is the **parent discipline**.

Software project management specializes the same principles for software.

```text
GENERAL PROJECT MANAGEMENT
│
├── Purpose
├── Goals
├── Stakeholders
├── Requirements
├── Scope
├── Planning
├── Estimation
├── Scheduling
├── Risk
├── Quality
├── Change
├── Execution
├── Monitoring
├── Delivery
└── Closure
          │
          ▼
SOFTWARE PROJECT MANAGEMENT
│
├── Software requirements
├── Product backlog / work items
├── MVP
├── Architecture
├── UI/UX
├── Technical dependencies
├── Development
├── Version control
├── Testing
├── Deployment
├── Technical debt
├── Security
├── Maintenance
└── Software-specific risks
```

The software layer should therefore be built **on top of** this general foundation.

---

# 38. PROJECT MANAGEMENT → SOFTWARE ENGINEERING MAPPING

| General concept | Software specialization |
|---|---|
| Purpose | Product/problem to solve |
| Stakeholders | Users, clients, product owner, team |
| Requirements | Functional/non-functional requirements |
| Scope | Product scope + MVP |
| Deliverables | Features, releases, documentation |
| Work breakdown | Epics → features → tasks |
| Dependencies | Technical/product dependencies |
| Estimation | Development effort |
| Schedule | Release/iteration planning |
| Resources | Developers, infrastructure, tools |
| Risk | Technical/product/security risks |
| Quality | Testing, reliability, maintainability |
| Change | Requirement/backlog changes |
| Execution | Design → implementation → integration |
| Monitoring | Progress, defects, velocity/flow |
| Acceptance | Acceptance criteria + stakeholder approval |
| Closure | Release, handover, retrospective |

---

# 39. STUDY ORDER

Study the subject in this order rather than trying to memorize everything simultaneously.

## Level 1 — Foundations

1. What is a project?
2. Project vs operations
3. Project lifecycle
4. Purpose and value
5. Goals
6. Success criteria
7. Stakeholders

## Level 2 — Definition

8. Requirements
9. Scope
10. Deliverables
11. Assumptions
12. Constraints
13. Definition of done
14. Acceptance criteria

## Level 3 — Planning

15. Work Breakdown Structure
16. Tasks
17. Dependencies
18. Estimation
19. Scheduling
20. Milestones
21. Resources
22. Cost/budget

## Level 4 — Uncertainty and Quality

23. Risk management
24. Issue management
25. Quality management
26. Communication
27. Change management

## Level 5 — Control

28. Monitoring
29. Status
30. Progress measurement
31. Decision management
32. Governance
33. Corrective action
34. Replanning

## Level 6 — Completion

35. Delivery
36. Acceptance
37. Closure
38. Retrospective
39. Lessons learned

## Level 7 — Application

40. Manage a small real project
41. Document it
42. Review the results
43. Improve the process
44. Apply the framework to a software project

---

# 40. THE PRACTICAL PROJECT BLUEPRINT

For future projects, use this sequence:

```text
1. PROJECT IDEA
      ↓
2. PROBLEM / OPPORTUNITY
      ↓
3. PURPOSE
      ↓
4. GOALS
      ↓
5. SUCCESS CRITERIA
      ↓
6. STAKEHOLDERS
      ↓
7. REQUIREMENTS
      ↓
8. SCOPE
      ↓
9. DELIVERABLES
      ↓
10. WBS
      ↓
11. TASKS + DEPENDENCIES
      ↓
12. ESTIMATES
      ↓
13. SCHEDULE + MILESTONES
      ↓
14. RESOURCES + BUDGET
      ↓
15. RISKS + ASSUMPTIONS + CONSTRAINTS
      ↓
16. QUALITY + ACCEPTANCE PLAN
      ↓
17. COMMUNICATION + DECISION PLAN
      ↓
18. EXECUTE
      ↓
19. MONITOR + CONTROL
      ↕
20. CHANGE / REPLAN
      ↓
21. DELIVER
      ↓
22. ACCEPT
      ↓
23. CLOSE
      ↓
24. RETROSPECTIVE
      ↓
25. LESSONS → NEXT PROJECT
```

---

# 41. THE MINIMUM PROJECT MANAGEMENT DOCUMENT SET

Do not create paperwork merely because paperwork exists.

For a small project, the essential documentation can be:

```text
PROJECT/
│
├── README.md
├── PROJECT_PLAN.md
├── REQUIREMENTS.md
├── SCOPE.md
├── TASKS.md
├── RISKS.md
├── DECISIONS.md
└── RETROSPECTIVE.md
```

Larger projects can expand this structure.

The documentation should evolve with the project rather than being produced as a giant administrative exercise before any useful work begins.

---

# 42. THE MOST IMPORTANT PRINCIPLES TO REMEMBER

### Principle 1
**Understand the problem before building the solution.**

### Principle 2
**Define success before measuring progress.**

### Principle 3
**Define scope before estimating the project.**

### Principle 4
**Break large outcomes into manageable work.**

### Principle 5
**Treat estimates as predictions, not promises.**

### Principle 6
**Identify risks before they become emergencies.**

### Principle 7
**Control change instead of pretending change will not happen.**

### Principle 8
**Measure actual progress rather than assuming progress.**

### Principle 9
**A plan must adapt to reality.**

### Principle 10
**Finish realistic projects.**

### Principle 11
**Document decisions and important knowledge, not every conversation.**

### Principle 12
**Every finished project should improve the next project.**

---

# 43. THE ULTIMATE MENTAL MODEL

When facing any new project, ask:

```text
WHY?
What problem are we solving?

WHAT?
What outcome and deliverables are required?

WHO?
Who cares, who decides, and who is affected?

WHERE ARE THE BOUNDARIES?
What is in scope and out of scope?

HOW?
What work must be performed?

WHEN?
What is the schedule and what are the dependencies?

WITH WHAT?
What resources, skills, tools, and money are required?

WHAT COULD GO WRONG?
What are the risks, assumptions, and constraints?

HOW GOOD?
What quality and acceptance criteria apply?

HOW WILL WE KNOW?
How will progress and success be measured?

WHAT IF THINGS CHANGE?
How will changes be evaluated and controlled?

HOW DO WE FINISH?
What constitutes completion and acceptance?

WHAT DID WE LEARN?
How will the experience improve the next project?
```

If these questions can be answered clearly, the project is no longer just an idea.

It has become a **managed system of work**.

---

# 44. CONNECTION TO THE PROJECT ENGINEERING KNOWLEDGE BASE

This README is the **general project-management foundation**.

It should sit above the specialized engineering documentation:

```text
PROJECT ENGINEERING KNOWLEDGE BASE
│
├── GENERAL_PROJECT_MANAGEMENT_README.md   ← THIS DOCUMENT
│
├── PROJECT_ENGINEERING_README.md
│
├── PROJECT_PLANNING_README.md
├── REQUIREMENTS_README.md
├── SCOPE_AND_MVP_README.md
├── ARCHITECTURE_README.md
├── TESTING_README.md
├── DOCUMENTATION_README.md
└── PROJECT_RETROSPECTIVE_README.md
```

The important relationship is:

```text
GENERAL PROJECT MANAGEMENT
              ↓
     PROJECT ENGINEERING
              ↓
   SOFTWARE PROJECT MANAGEMENT
              ↓
     SOFTWARE ENGINEERING
              ↓
       ACTUAL PROJECT
```

The general principles remain stable while the technical details become increasingly specialized.

---

# 45. BLUEPRINT STATUS

**Document type:** General project-management study blueprint  
**Purpose:** Foundation for future software-engineering project management  
**Approach:** Methodology-neutral, practical, iterative  
**Primary objective:** Learn to consistently move projects from idea to finished result  
**Next specialization:** Software project management  
**Core philosophy:** Plan enough to create direction and control, execute enough to obtain reality, measure what actually happens, adapt intelligently, finish realistically, and learn from the result.

---

## SOURCE OF TRUTH RULE

This README is a **distilled knowledge source**, not a transcript of discussions.

If future conversations establish a genuinely important project-management principle, update this document or a more specialized README rather than relying on conversational memory alone.

When a concept belongs specifically to software engineering, keep the general principle here and place the software-specific implementation in the appropriate specialized README.
