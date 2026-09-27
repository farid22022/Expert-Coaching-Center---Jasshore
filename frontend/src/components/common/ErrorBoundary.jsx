import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(previousProps) {
    if (this.state.failed && previousProps.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section role="alert" className="mx-auto my-10 max-w-xl rounded-xl border border-emerald-200 bg-paper p-6 text-ink shadow-sm">
        <h1 className="text-xl font-bold">This page could not be displayed</h1>
        <p className="my-3">Please try again. If the problem continues, contact the coaching center.</p>
        <button type="button" className="btn bg-brand text-white" onClick={() => this.setState({ failed: false })}>Try again</button>
        <a className="ml-4 underline" href="/">Return home</a>
      </section>
    );
  }
}
