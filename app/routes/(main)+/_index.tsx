import type { Route } from './+types/_index';

export const meta = ({}: Route.MetaArgs) => [{ title: 'Z9 Studio' }, { name: 'description', content: 'Welcome to Z9 Studio!' }];

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center">
        <img className="h-36" src="/logo.svg" alt="logo" />
      </div>
    </>
  );
}
