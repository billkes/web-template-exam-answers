# IFLOW.md

This file provides guidance to iFlow Cli when working with code in this repository.

## Project Overview

This is a uni-admin project, a management system template based on uni-app and uniCloud. It's designed as a serverless admin panel that can run across multiple platforms including web, mobile apps, and mini-programs.

## Architecture

### Core Framework Stack
- **Frontend**: uni-app (Vue.js-based cross-platform framework) with Vue 3
- **Backend**: uniCloud serverless cloud services
- **Authentication**: uni-id integrated user system with roles and permissions
- **State Management**: Vuex with modular structure
- **Routing**: uni-app pages.json configuration with uniIdRouter for auth
- **UI Framework**: Custom admin components with uni-ui library integration

### Key Architectural Patterns
- **Multi-platform**: Single codebase targets H5, App (iOS/Android), and Mini-programs
- **Serverless**: All backend logic runs as uniCloud functions
- **Modular**: Feature-based code organization with clear separation of concerns
- **Plugin-based**: Uses uni_modules for extensibility

### Directory Structure & Purpose
- `api/` - RESTful API service layer communicating with uniCloud functions
- `components/` - Reusable admin UI components (tables, forms, navigation)
- `js_sdk/` - Core utilities: request handling, error management, permissions
- `pages/` - Feature modules organized by domain (system, uni-stat, test)
- `store/` - Vuex modules for global state management
- `uni_modules/` - Third-party uni-app plugins (uni-id, uni-stat, etc.)
- `uniCloud-aliyun/` - Serverless cloud functions and database schemas
- `windows/` - Layout components for admin interface (top/left navigation)

## Development Commands

### Primary Development
This project requires **HBuilderX IDE** (minimum v3.6.0) for development:
- **Run**: Open in HBuilderX → Click "Run" button → Select target platform
- **Build**: Right-click project → Build → Build App → Select platform
- **Debug**: Use built-in browser dev tools or HBuilderX debugger

### Platform-Specific Commands
```bash
# H5 Development (when using CLI)
npm run dev:h5

# App Development (when using CLI)
npm run dev:app

# Mini-program Development (when using CLI)
npm run dev:mp-weixin
```

### Testing & Quality
- **Manual Testing**: Primary testing method via browser/IDE
- **Linting**: No configured linting - follow existing code patterns
- **Type Checking**: No TypeScript configured - use JSDoc for documentation

### Build Targets
- **H5**: Builds to `/unpackage/dist/build/h5/` with base path `/admin/`
- **App**: Builds native iOS/Android apps
- **Mini-programs**: WeChat, Alipay, Baidu, Toutiao support

## Configuration Files

### Critical Configuration
- `pages.json` - Central routing and navigation configuration
- `manifest.json` - App metadata and platform-specific settings
- `admin.config.js` - Admin-specific configuration
- `vue.config.js` - Vue CLI configuration (if using CLI)

### Environment Setup
- **uniCloud**: Requires uniCloud service space setup in HBuilderX
- **Database**: Uses uniCloud database with predefined schemas
- **Authentication**: uni-id configuration in `uni_modules/uni-id/`

## Development Workflow

### Adding New Features
1. **Pages**: Create Vue component in appropriate `pages/` subdirectory
2. **API**: Add service functions in `api/` following existing patterns
3. **State**: Create Vuex module in `store/modules/` if needed
4. **Navigation**: Register route in `pages.json` and menu system

### Database Schema
- Located in `uniCloud-aliyun/database/` 
- Uses uniCloud database with JSON schema validation
- Predefined collections: users, roles, permissions, menus, apps

### Authentication Flow
- Uses uni-id for complete user management
- Login pages auto-handled by uni-id-pages module
- Route protection via `uniIdRouter` in `pages.json`

## Key Integration Points

### uni-id Integration
- User management: registration, login, password reset, profile
- Role-based access control (RBAC)
- Permission system integrated with menu items

### uni-stat Integration
- Built-in analytics and statistics
- User behavior tracking
- Performance monitoring

### uni-upgrade-center
- App version management
- Update distribution system
- Release management interface