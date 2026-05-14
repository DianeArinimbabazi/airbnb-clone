import React from "react";
import { Spinner } from "../components/Spinner";

export function withLoading<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { isLoading: boolean }> {
  return function WithLoadingWrapper({ isLoading, ...props }: P & { isLoading: boolean }): React.ReactElement {
    if (isLoading) return <Spinner />;
    return <Component {...(props as P)} />;
  };
}
