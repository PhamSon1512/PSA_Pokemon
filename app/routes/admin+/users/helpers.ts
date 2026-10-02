export { ROLE_STYLES, DEFAULT_ROLE_STYLE } from '~/lib/constants';

/** Build display name: fullName > "First Last" > "—" */
export function getDisplayName(u: { fullName: string | null; firstName: string | null; lastName: string | null }): string {
  if (u.fullName) return u.fullName;
  const parts = [u.firstName, u.lastName].filter(Boolean).join(' ');
  return parts || '—';
}
