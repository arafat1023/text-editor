# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2025-11-05

### Added
- **Critical**: Complete TypeScript types file (`src/types.ts`) with comprehensive type definitions
  - EditorOptions, EditorInstance, EditorSelection interfaces
  - Extension system types
  - Command system types (SingleCommands, ChainedCommands)
  - Toolbar, Theme, and UI component types
  - All 30+ type definitions required by the project
- **Tests**: Basic unit tests for core functionality
  - Editor instance tests (`tests/Editor.test.ts`)
  - Command system tests (`tests/commands.test.ts`)
  - Schema validation tests (`tests/schema.test.ts`)
- **Error Handling**: User-facing error messages for image upload failures
  - File type validation errors with allowed types list
  - File size validation with formatted size display
  - Upload failure notifications
  - File read error messages
- **Documentation**: CHANGELOG.md for tracking version changes

### Fixed
- **Critical**: Missing types file that prevented project from building
- **Composable API**: Uncommented and restored `mount` function in `useTextEditor.ts`
- **Composable API**: Added `createEditor` to composable return object
- **Type Safety**: Removed unsafe `as any` type assertion in TextEditor.vue
- **Editor State**: Fixed editable state updates using proper `setProps` API

### Changed
- **Version**: Downgraded from 1.0.0 to 0.9.0 (pre-release status)
- **Error Handling**: Enhanced error messages with detailed context
- **Type Safety**: Improved type safety throughout components

### Technical Details

#### Types File Structure
The new `src/types.ts` includes:
- Core editor types (EditorOptions, EditorInstance)
- Command system (35+ command type definitions)
- Extension system interfaces
- Component prop types
- Utility types for features like clipboard, upload, and theming

#### Breaking Changes
None - This is the first working release with proper type definitions.

#### Migration Guide
If you were using this project before 0.9.0:
1. Install dependencies: `pnpm install`
2. Update imports to use proper types from `@/types`
3. Type checking should now work: `pnpm run type-check`
4. Build should work: `pnpm run build`

## [Unreleased]

### TODO for 1.0.0
- [ ] Add ESLint and Prettier configuration files
- [ ] Expand test coverage to 80%+
- [ ] Add E2E tests for user workflows
- [ ] Optimize extension loading (lazy loading)
- [ ] Add accessibility improvements (ARIA labels, keyboard nav)
- [ ] Performance benchmarks
- [ ] Documentation improvements
- [ ] Example applications

---

## Version History

- **0.9.0**: First working release with complete type definitions
- **1.0.0** (unreleased): Initial version claim (had critical blocking issues)
