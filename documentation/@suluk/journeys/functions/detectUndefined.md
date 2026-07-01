[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/journeys](../README.md) / detectUndefined

# Function: detectUndefined()

> **detectUndefined**(`vocab`, `features`, `opts?`): [`UndefinedStep`](../interfaces/UndefinedStep.md)[]

Defined in: [journeys/src/bind.ts:284](https://github.com/MahmoodKhalil57/suluk/blob/55fa001f13aff683539d55f653ea19ece6bd829c/tooling/ts/packages/journeys/src/bind.ts#L284)

Detect every authored step that is not yet runnable — the scaffolder's worklist (Cucumber-style "undefined steps",
here resolved by MAPPING, not by writing code). It SUGGESTS a target when there is a lexical signal and otherwise
defers to the scaffolder; it never falsely claims a developer is required (absence of a word-match ≠ missing
capability). Reports against the ORIGINAL prose, deduped.

## Parameters

### vocab

[`Vocabulary`](../interfaces/Vocabulary.md)

### features

[`Feature`](../interfaces/Feature.md)[]

### opts?

[`BindOptions`](../interfaces/BindOptions.md) = `{}`

## Returns

[`UndefinedStep`](../interfaces/UndefinedStep.md)[]
