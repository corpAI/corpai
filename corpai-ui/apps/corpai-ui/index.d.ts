/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}

interface Window {
  setLoadingSpinner?: (loading: boolean) => void;
}

