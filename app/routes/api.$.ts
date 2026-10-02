import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { api } from '~/.server/api';

export const loader = ({ request, context }: LoaderFunctionArgs) => {
  return api.fetch(request, context.cloudflare.env, context.cloudflare.ctx);
};

export const action = ({ request, context }: ActionFunctionArgs) => {
  return api.fetch(request, context.cloudflare.env, context.cloudflare.ctx);
};
