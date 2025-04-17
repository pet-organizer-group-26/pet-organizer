/**
 * This is a compatibility layer that re-exports the Button component 
 * from the common components directory.
 */
import { Button as CommonButton } from '../../components/common/Button';

// Re-export as both named and default export for compatibility
export const Button = CommonButton;
export default CommonButton; 