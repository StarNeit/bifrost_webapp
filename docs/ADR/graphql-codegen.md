# Graphql code generator

Contents:

- [Summary](#summary)
  - [Issue](#issue)
  - [Decision](#decision)
  - [Status](#status)
- [Details](#details)
  - [Usage](#usage)
- [References](#references)
  - [Authors](#authors)

## Summary

### Issue

For the custom hooks that use graphql we've manually declared types/variables so some of them were inconsistent when it comes to the return type or the fetched data itself.

### Decision

We selected `graphql-codegen` as the candidate to provide accurate typings and easy way to handle graphql endpoints. Some of the benefits we get by using graphql-codegen:

- Generates the whole schema types, so we don’t have to worry about manually defining types
- Gives us custom hooks or even wrappers and it always returns the right data with the right types
- We don’t need to use long string literals anymore in our typescript files, instead we can separate our `queries, mutation and even fragments` in files with `.graphql` extension that graphql-codegen uses to generate the hooks.
- Helps with handling the urql cache
- It doesn't generate ts files if there's an error in the queries/mutations/fragmets, instead throws error and warns the user what's causing the problem

### Status

In review.

## Details

### Usage
Graphql-codegen can be used by running:
1. `npm run gen` (generates the ts files)
2. `npm run gen-watch` (generates the ts files and watches for changes in files with the `.graphql` extension)

## References

- Discussion at GitHub <https://github.com/X-Rite/bifrost-web-app/discussions/712>

### Authors

- Blagoj Petrov
