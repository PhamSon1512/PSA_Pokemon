import { isRouteErrorResponse } from 'react-router';
import { useTranslate } from '~/hooks';

export function ErrorBoundary({ error }: { error: any }) {
  const { __ } = useTranslate();
  let message = __('Oops!');
  let details = __('An unexpected error occurred.');
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 400:
        message = __('Bad Request');
        details = __('The request could not be processed due to invalid data.');
        break;
      case 401:
        message = __('Unauthorized');
        details = __('Please log in to access this resource.');
        break;
      case 403:
        message = __('Forbidden');
        details = __('You do not have permission to access this resource.');
        break;
      case 404:
        message = '404';
        details = __('The requested page could not be found.');
        break;
      case 406:
        message = __('Not Acceptable');
        details = __('The requested format is not supported.');
        break;
      default:
        message = __('Error');
        details = error.statusText || details;
    }
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <div className="space-y-2 text-center">
        {error.status === 404 ? (
          <img src="/Error404.svg" className="-mb-12 inline h-64" alt="404" />
        ) : (
          <img src="/t-rex.svg" className="mb-2 ml-4 inline" alt="err" />
        )}
        {error.status !== 404 && <h1>{message}</h1>}
        <h4>{details}</h4>
        {stack && (
          <pre className="w-full overflow-x-auto p-4">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
