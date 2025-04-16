# Feature Plan: Pet Progress & Achievements

## Concept

This feature aims to make routine pet care and training more engaging by introducing gamification elements like streaks, badges, and a structured way to learn and track tricks without requiring media uploads. It combines routine care tracking with a text-based trick training module.

## Core Components

### 1. Routine Care Gamification

*   **Trackable Activities:** Leverage existing logging capabilities for activities such as:
    *   Walks
    *   Feeding
    *   Grooming
    *   Medication Administration (link to calendar/manual logs)
    *   Training Sessions (from Trick Training Module)
*   **Streaks:** Implement logic to track consecutive days or weeks of completing specific activities (e.g., daily walks, weekly grooming). Define which activities contribute to which streaks.
*   **Badges/Achievements:** Design a set of virtual badges awarded for milestones and consistency. Examples:
    *   "7-Day Walk Streak"
    *   "Perfect Medication Week"
    *   "Grooming Regular"
    *   "First Training Session Logged"
    *   "Hydration Hero" (if water intake is tracked)
*   **Visual Feedback:** Display progress bars, streak counters, and earned badges prominently, likely in a dedicated "Achievements" section or integrated into the pet's profile screen.

### 2. Interactive Trick Training Module (Text-Based)

*   **Trick Library:**
    *   Curate a library of tricks.
    *   Categorize by difficulty (e.g., Basic, Intermediate, Advanced).
    *   Provide clear, step-by-step text instructions for each trick.
    *   Consider sourcing instructions from reputable public domain resources or writing original content.
*   **Progress Tracking:**
    *   Allow users to mark the status of each trick per pet:
        *   Not Started
        *   Learning
        *   Practicing
        *   Mastered
*   **Practice Log:**
    *   A simple log associated with each "Learning" or "Practicing" trick.
    *   Users can quickly note practice sessions (e.g., date, duration, simple text note: "Practiced 'Sit' - 5 mins - Getting faster!").
    *   Logged practice sessions count as a trackable activity for the gamification system.
*   **Training Badges:** Award specific badges related to training progress:
    *   "First Trick Learned"
    *   "Master of 5 Tricks"
    *   "Consistent Trainer - 10 Sessions Logged"
    *   "Advanced Trick Master"

## Integration

*   Logging a training session in the Trick Training module counts as a trackable activity for the Routine Care Gamification system, contributing to streaks or general activity badges.
*   Mastering tricks earns specific badges within the overall achievement system.
*   A unified "Achievements" or "Progress" screen should showcase both routine care streaks/badges and trick training accomplishments.

## Conceptual Flow Diagram

```mermaid
graph TD
    subgraph User Actions
        A[Log Walk] --> B{System Check};
        C[Log Medication] --> B;
        D[Log Training Session] --> B;
        E[Browse Trick Library] --> F[Select Trick];
        F --> G[Log Practice];
        G --> H{Update Trick Status};
        H --> B;
    end

    subgraph System Logic
        B -- Routine Activity --> I{Update Streaks};
        B -- Milestone? --> J{Award Badge};
        H -- Trick Mastered? --> J;
    end

    subgraph User Feedback
        I --> K[Display Streaks];
        J --> L[Display Badges];
        K --> M[Progress Screen];
        L --> M;
    end

    style User Actions fill:#f9f,stroke:#333,stroke-width:2px
    style System Logic fill:#ccf,stroke:#333,stroke-width:2px
    style User Feedback fill:#cfc,stroke:#333,stroke-width:2px