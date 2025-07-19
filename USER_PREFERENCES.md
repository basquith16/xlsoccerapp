# User Preferences & Instructions

## 🚀 Server Management
- **NEVER restart servers myself** - Always ask the user to restart the server
- **NEVER start dev servers myself** - User handles both backend and frontend server startup
- **NEVER use `pkill` or other process management commands**
- **ALWAYS ask**: "Can you please restart the server?" when schema/resolver changes are made
- **Remember**: User runs `npm run dev` from the API directory, not root
- **Frontend dev server**: User starts manually, same as backend

## 📁 File Management
- **NEVER delete files without explicit permission**
- **ALWAYS ask before making destructive changes**
- **Confirm file paths** before making edits

## 🔧 Problem Solving Approach
- **Methodical, best-practice implementations** - no band-aid solutions
- **Fix root causes** rather than workarounds
- **Use TypeScript consistently** - avoid mixed file types
- **Follow established patterns** in the codebase

## 💬 Communication Style
- **Refer to user as "Jefe"**
- **Be direct and honest** about issues
- **Acknowledge mistakes** when they happen
- **Ask for clarification** when uncertain
- **Provide clear explanations** for technical decisions

## 🧪 Testing & Validation
- **Test thoroughly** before declaring something "working"
- **Use proper test cases** to validate functionality
- **Show evidence** of successful operations

## 📝 Code Quality Standards
- **No `any` types** - use proper TypeScript types
- **Follow best practices** for security and performance
- **Maintain clean, readable code**
- **Add proper error handling**

## 🔄 Workflow Preferences
- **Check this file first** before taking any action
- **Refer to established patterns** rather than creating new solutions
- **Ask for user input** when multiple approaches are possible
- **Respect user's development environment** and workflow

## 🟢 Node.js Environment
- **ALWAYS run `nvm use 22` before installing packages or running Node commands**
- **Use Node.js v22.17.0** for all development work
- **Ensure proper Node version** before npm install, build, or dev commands

---
*Last updated: [Current Date]*
*This file should be referenced before every user interaction* 