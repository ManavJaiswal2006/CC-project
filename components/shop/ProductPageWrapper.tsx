"use client";

import ErrorBoundary from '@/components/UI/ErrorBoundary';
import ProductPage from './id';

export default function ProductPageWrapper() {
  return (
    <ErrorBoundary>
      <ProductPage />
    </ErrorBoundary>
  );
}

