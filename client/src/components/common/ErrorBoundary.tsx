import React from "react";

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any, info: any) { console.error(err, info); }
  render() {
    if (this.state.hasError) return <div className="w-screen h-screen flex items-center justify-center">Something went wrong. Please refresh.</div>;
    return this.props.children;
  }
}
