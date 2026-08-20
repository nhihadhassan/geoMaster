"use client";

import { Component, type ReactNode } from "react";

type MapErrorBoundaryProps = {
  children: ReactNode;
  fallback: (reset: () => void) => ReactNode;
  onError?: (error: Error) => void;
};

type MapErrorBoundaryState = {
  error: Error | null;
};

/**
 * Keeps a WebGL / Mapbox / rendering failure inside the map subtree instead of
 * blanking the whole app. React only recovers render-phase errors this way, so
 * MapContainer also routes asynchronous Mapbox `error` events into the same
 * fallback UI.
 */
export class MapErrorBoundary extends Component<
  MapErrorBoundaryProps,
  MapErrorBoundaryState
> {
  state: MapErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): MapErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return this.props.fallback(this.reset);
    }

    return this.props.children;
  }
}
