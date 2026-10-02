import type { RoleItem } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

// Shared role <Select> used in both CreateUserDialog and EditUserDialog.
// Supports both uncontrolled (defaultValue) and controlled (value + onChange) usage.
export function RoleSelect({
  id,
  name,
  defaultValue,
  value,
  roles,
  onChange,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  value?: string;
  roles: RoleItem[];
  onChange?: (value: string) => void;
}) {
  const selectProps = value !== undefined ? { value, onValueChange: onChange } : { defaultValue };

  return (
    <Select name={name} {...selectProps}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.length === 0 ? (
          // Fallback when no roles exist in DB yet
          <SelectItem value={defaultValue ?? ''} disabled className="text-muted-foreground">
            {defaultValue} (no roles in DB)
          </SelectItem>
        ) : (
          roles.map((r) => (
            <SelectItem key={r.slug} value={r.slug} className="capitalize">
              {r.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
