import { Navigate } from 'react-router-dom';

/**
 * Admin login is now integrated into the unified auth page.
 * This redirect ensures bookmarks / direct URL visits still work.
 */
export function AdminLoginPage() {
  return <Navigate to="/login" replace />;
}
