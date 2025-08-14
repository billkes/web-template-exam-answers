# IFLOW.md

This file provides guidance to iFlow Cli when working with code in this repository.

## Project Overview

This is a uni-admin project, a management system template based on uni-app and uniCloud. It's designed as a serverless admin panel that can run across multiple platforms including web, mobile apps, and mini-programs.

## Architecture

1. **Framework**: Built with uni-app (Vue.js-based cross-platform framework) and uniCloud (serverless cloud services)
2. **State Management**: Uses Vuex for state management with modular structure
3. **Routing**: Uses uni-app's pages.json for routing configuration
4. **UI Components**: Custom components for admin interface, including menus, tables, and forms
5. **Authentication**: Integrated with uni-id for user authentication, roles, and permissions
6. **API Layer**: Communicates with backend through uniCloud functions and objects
7. **Internationalization**: Supports multiple languages using vue-i18n

## Directory Structure

- `api/` - API service functions for communicating with backend
- `components/` - Reusable UI components for the admin interface
- `i18n/` - Internationalization files
- `js_sdk/` - Core utilities and plugins (request handling, error handling, etc.)
- `pages/` - Application pages organized by feature modules
- `static/` - Static assets like images and fonts
- `store/` - Vuex store modules for state management
- `uni_modules/` - Uni-app plugin modules
- `windows/` - Layout components for the admin interface (top and left windows)

## Common Development Commands

Since this is a uni-app project, development is primarily done through HBuilderX IDE. However, you can also use command-line tools:

```bash
# Run development server (requires HBuilderX)
# Open project in HBuilderX and click "Run" button

# Build for production (requires HBuilderX)
# In HBuilderX, right-click project -> Build -> Build App

# There are no standard npm scripts defined in package.json for this project
```

## Development Workflow

1. **Adding New Pages**: 
   - Create a new Vue component in the appropriate directory under `pages/`
   - Register the page in `pages.json`

2. **Creating API Services**:
   - Add new files in the `api/` directory following the existing pattern
   - Use `uniCloud.callFunction` or `uniCloud.importObject` to communicate with backend

3. **State Management**:
   - Add new modules in `store/modules/` following the existing pattern
   - Connect components to store using `mapState`, `mapActions`, etc.

4. **UI Components**:
   - Create reusable components in `components/`
   - Follow the existing component structure and naming conventions

## Testing

There are no defined test scripts in package.json. Testing is typically done through manual verification in the browser or development tools within HBuilderX.

## Deployment

Deployment is done through HBuilderX:
1. Build the project for the target platform (H5, App, Mini-program)
2. Upload the built files to the appropriate hosting service or app store