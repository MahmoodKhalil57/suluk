# Example journey (Suluk registry: `journeys`) — authored in plain Gherkin against the step VOCABULARY projected from your
# v4 contract. Every phrase names a CONTRACT FACT (an operation, a param, a status, a store key, an access role) — never a
# request VALUE — so it stays on the safe side of the D1 wall. Run `bun test src/journeys.test.ts` to bind + grade these
# against your contract; unbound steps are your worklist. Replace this with your product's real journeys.

Feature: Credits — a metered debit against a balance

  Scenario: a covered debit succeeds
    Given the user has a credit balance
    When they debit credits for a metered call
    Then the debit succeeds
    And the balance decreases

  Scenario: an uncovered debit is refused
    Given the user has an empty credit balance
    When they debit credits for a metered call
    Then the debit is refused with payment required
