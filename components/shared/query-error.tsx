"use client";

import { AlertCircle } from "lucide-react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError, getErrorMessage } from "@/services/api-client";

/** Visible error state for a failed query, so a failure is never shown as an empty list or
 * an endless loading skeleton. Pass `notFoundLabel` on detail pages to render a 404 as
 * "<label> not found" instead of a generic error. */
export function QueryError({
  error,
  onRetry,
  title = "Couldn't load data",
  notFoundLabel,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  notFoundLabel?: string;
  className?: string;
}) {
  const isNotFound = notFoundLabel && error instanceof ApiError && error.status === 404;

  return (
    <Alert variant="destructive" className={className} data-testid="query-error">
      <AlertCircle />
      <AlertTitle>{isNotFound ? `${notFoundLabel} not found` : title}</AlertTitle>
      <AlertDescription>
        {isNotFound ? `This ${notFoundLabel.toLowerCase()} doesn't exist or was removed.` : getErrorMessage(error)}
      </AlertDescription>
      {onRetry && !isNotFound ? (
        <AlertAction>
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </AlertAction>
      ) : null}
    </Alert>
  );
}
