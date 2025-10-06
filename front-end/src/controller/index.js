/**
 * 📦 AGENT CONTROLLER - INDEX
 * 
 * Central export point cho tất cả agent controller functions và utilities
 */

// Core controller functions
export {
  handleIntent,
  applyJobFilters,
  getAgentFilters,
  clearAgentFilters,
  parseAIResponse
} from './agentController';

// Test component (chỉ dùng trong development)
export { default as AgentControllerTest } from './AgentControllerTest';

// Re-export default
export { default } from './agentController';

/**
 * 🎯 QUICK USAGE
 * 
 * Import cách 1 (Named imports):
 * import { handleIntent, applyJobFilters } from './controller';
 * 
 * Import cách 2 (Default import):
 * import agentController from './controller';
 * agentController.handleIntent(...);
 * 
 * Import test component:
 * import { AgentControllerTest } from './controller';
 */
