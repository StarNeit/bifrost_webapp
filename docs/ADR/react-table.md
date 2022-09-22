# Reusable table component

Contents:

- [Summary](#summary)
  - [Issue](#issue)
  - [Decision](#decision)
  - [Status](#status)
- [Details](#details)
  - [Alternatives](#alternatives)
  - [Assumptions](#assumptions)
  - [Constraints](#constraints)
  - [Argument](#argument)
  - [Drawbacks](#drawbacks)
- [Related](#related)
  - [Related ADRs](#related-adrs)
- [References](#references)
  - [Authors](#authors)
  - [Contributors](#contributors)
- [Notes](#notes)

## Summary

### Issue

The generic Table component we've been using has become difficult to work with and requires additional features, like:

- Row filtering
- Row sorting
- Expandable rows
- Columns reordering
- Custom components in cells

### Decision

We selected `react-table` as the candidate to provide extensible tool for building customizable data grids/tables.

### Status

In review.

## Details

### Alternatives

Currently we did not forsee any other 3rd party solution.

### Assumptions

All data supplied to the data table component must have `id` field.

### Constraints

The solution must be compliant with Material UI styling and UX, e.g. dark mode, theming support.

### Argument

- is mature project with rich documentation
- customizable via custom plugin interface

### Drawbacks

- Written in JS, typings are maintained by DefinitivelyTyped community.

## Related

### Related ADRs

_none_

## References

- Discussion at GitHub <https://github.com/X-Rite/bifrost-web-app/discussions/511>

### Authors

- Stanislav Remezov (s.remezov@softpositive.com)

### Contributors

## Notes

Add notes here.
