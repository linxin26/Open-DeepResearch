'use client';
// RuntimeRender.jsx
import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
// import 'katex/dist/katex.min.css';
// import Latex from 'react-latex-next';
import * as Recharts from 'recharts';

const StringToReactComponent = lazy(() => import('string-to-react-component'));

const fallback = <p style={{ padding: 20 }}>Loading runtime component…</p>;
const errorFallback = ({ error }) => (
  <pre style={{ color: 'red', padding: 20 }}>{error.message}</pre>
);

export default function RuntimeRender({ jsxString }) {
  // 拼成箭头函数字符串
  const code = `(props) => {
    const {  Recharts } = props;
    return (${jsxString});
  }`;

  const scope = {  Recharts };

  return (
    <ErrorBoundary fallbackRender={errorFallback}>
      <Suspense fallback={fallback}>
        <StringToReactComponent data={scope}>{code}</StringToReactComponent>
      </Suspense>
    </ErrorBoundary>
  );
}