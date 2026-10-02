---
trigger: always_on
---

## SHADCN SELECT — ITEM VALUE MUST NOT BE EMPTY STRING

`<SelectItem value="" />` is **forbidden**. Radix UI reserves `""` (empty string) to represent "no selection" (i.e., cleared state / show placeholder). Passing it as a value throws a runtime error:

```
Error: A <Select.Item /> must have a value prop that is not an empty string.
```

### Why

The `Select` component uses `value === ""` internally to detect when to display the placeholder. Any `SelectItem` with `value=""` conflicts with this mechanism and crashes at render time.

### Correct Pattern

Use a sentinel string (e.g. `"all"`, `"__all__"`) for "no filter / show all" options, then convert back to `undefined` in the handler:

```tsx
// ✅ Use a sentinel value instead of ""
<Select value={distributorId || 'all'} onValueChange={(v) => setDistributorId(v === 'all' ? undefined : v)}>
  <SelectItem value="all">All distributors</SelectItem>
  {distributors.map((d) => (
    <SelectItem key={d.id} value={d.id}>
      {d.name}
    </SelectItem>
  ))}
</Select>
```

### Forbidden Pattern

```tsx
// ❌ value="" crashes at render time
<SelectItem value="">All distributors</SelectItem>

// ❌ Passing undefined/null directly also does not work
<SelectItem value={undefined}>All</SelectItem>
```

### General Rule

> Every `<SelectItem>` must have a **non-empty string** as `value`. For "all / none" options, use a sentinel like `"all"` and map it to `undefined` in `onValueChange`.

---

## FORM HANDLING — MANDATORY

**ALWAYS use `@mantine/form` for all form state management. No exceptions.**

### Rules

1. **Form State**: Use `useForm` from `@mantine/form` for ALL form state, validation, and submission.
2. **Validation**: Define validation rules inside `useForm({ validate: { ... } })`. Never use third-party validation libs (e.g., Zod schema directly in form) unless integrated via `zodResolver` from `mantine-form-zod-resolver`.
3. **No React Router `action`**: NEVER use React Router's `action` function or `<Form>` component for mutations. All form submissions MUST go through API calls (fetch/axios/hono-client) inside the `onSubmit` handler.
4. **Submission pattern**: Always use `form.onSubmit(async (values) => { ... })` pattern with explicit API calls.

### Correct Pattern

```tsx
import { useForm } from '@mantine/form';

const form = useForm({
  initialValues: { name: '', email: '' },
  validate: {
    name: (v) => (v.trim().length < 2 ? 'Name too short' : null),
    email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
  },
});

const handleSubmit = form.onSubmit(async (values) => {
  await apiClient.users.$post({ json: values });
});
```

### Forbidden Patterns

```tsx
// ❌ DO NOT USE React Router action
export async function action({ request }: Route.ActionArgs) { ... }

// ❌ DO NOT USE React Router <Form>
import { Form } from 'react-router'
<Form method="post">...</Form>

// ❌ DO NOT manage form state with useState
const [name, setName] = useState('')
```

---

## UI COMPONENTS — MANDATORY

**ALWAYS use shadcn/ui components. Never install or use other UI libraries for components.**

### Rules

1. **Component source**: Use only components from `~/components/ui/*` (shadcn/ui).
2. **No raw HTML for UI**: Never use raw `<button>`, `<input>`, `<select>`, `<dialog>` when a shadcn/ui equivalent exists.
3. **Icons**: Use `lucide-react` icons (already included with shadcn/ui).
4. **Dialogs / Modals**: Use `Dialog` from shadcn/ui. Never use browser `alert()` or `confirm()`.
5. **Toasts / Notifications**: Use `sonner` (already configured) for user feedback.
6. **Form fields with shadcn**: Pair shadcn/ui `Input`, `Select`, `Checkbox`, etc. with Mantine form field binding via `{...form.getInputProps('field')}`.

### Correct Pairing Pattern (Mantine form + shadcn/ui)

```tsx
import { useForm } from '@mantine/form'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'

const form = useForm({ initialValues: { email: '' } })

<form onSubmit={form.onSubmit(handleSubmit)}>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    {...form.getInputProps('email')}
  />
  {form.errors.email && (
    <p className="text-[0.75rem] text-destructive">{form.errors.email}</p>
  )}
  <Button type="submit">Submit</Button>
</form>
```

### Forbidden Patterns

```tsx
// ❌ DO NOT use Mantine UI components
import { TextInput, Button } from '@mantine/core'

// ❌ DO NOT use MUI / Ant Design / Chakra
import { TextField } from '@mui/material'

// ❌ DO NOT use raw HTML inputs without shadcn wrapper
<input type="text" />
<button>Submit</button>
```

---

## SUMMARY TABLE

| Concern         | Required                        | Forbidden                                |
| --------------- | ------------------------------- | ---------------------------------------- |
| Form state      | `@mantine/form` / `useForm`     | `useState` for fields, React Hook Form   |
| Form submission | `form.onSubmit` + API call      | React Router `action`, `<Form method>`   |
| UI components   | `shadcn/ui` (`~/components/ui`) | Mantine UI, MUI, Ant Design, raw HTML    |
| Icons           | `lucide-react`                  | Other icon libraries                     |
| Notifications   | `sonner`                        | `alert()`, `confirm()`, other toast libs |
| Dialogs         | shadcn/ui `Dialog`              | Browser native dialogs                   |
