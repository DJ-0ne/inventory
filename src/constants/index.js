// src/constants/index.js

// Status Colors for badges
export const STATUS_COLORS = {
  'Critical': 'bg-red-800 text-white',
  'Warning': 'bg-orange-600 text-white',
  'Info': 'bg-blue-950 text-white',
  'Success': 'bg-green-800 text-white',
  'Pending': 'bg-yellow-600 text-white',
  'Completed': 'bg-green-800 text-white',
  'Failed': 'bg-red-800 text-white',
  'In Progress': 'bg-blue-950 text-white',
};

// Priority Colors
export const PRIORITY_COLORS = {
  'High': 'bg-red-800 text-white',
  'Medium': 'bg-orange-600 text-white',
  'Low': 'bg-green-800 text-white',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'Administrator',
  MANAGER: 'Manager',
  SUPERVISOR: 'Supervisor',
  STAFF: 'Staff',
  VIEWER: 'Viewer',
};

// User Role Colors
export const USER_ROLE_COLORS = {
  'Administrator': 'bg-red-800 text-white',
  'Manager': 'bg-blue-950 text-white',
  'Supervisor': 'bg-orange-600 text-white',
  'Staff': 'bg-green-800 text-white',
  'Viewer': 'bg-gray-700 text-white',
};

// Event Types
export const EVENT_TYPES = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CREATE: 'Create',
  UPDATE: 'Update',
  DELETE: 'Delete',
  EXPORT: 'Export',
  IMPORT: 'Import',
  BACKUP: 'Backup',
  RESTORE: 'Restore',
  CONFIG_CHANGE: 'Config Change',
};

// Event Type Colors
export const EVENT_TYPE_COLORS = {
  'Login': 'bg-blue-950 text-white',
  'Logout': 'bg-gray-700 text-white',
  'Create': 'bg-green-800 text-white',
  'Update': 'bg-orange-600 text-white',
  'Delete': 'bg-red-800 text-white',
  'Export': 'bg-purple-800 text-white',
  'Import': 'bg-purple-800 text-white',
  'Backup': 'bg-teal-800 text-white',
  'Restore': 'bg-teal-800 text-white',
  'Config Change': 'bg-yellow-600 text-white',
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#1e3a5f',
  accent: '#f97316',
  success: '#166534',
  danger: '#991b1b',
  warning: '#9a7d0a',
  info: '#1e3a5f',
  purple: '#4c1d95',
  teal: '#0f766e',
  gray: '#1e293b',
};

// Table Styles
export const TABLE_HEADER_STYLES = 'text-left py-3 font-bold text-blue-950 text-xs uppercase tracking-wider';
export const TABLE_ROW_STYLES = 'border-b border-gray-50 hover:bg-gray-50 transition-colors';