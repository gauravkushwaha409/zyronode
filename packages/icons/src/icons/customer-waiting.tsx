import type { SVGProps } from 'react';
const CustomerWaiting = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="none"
    {...props}
  >
    <path
      d="M10.3739 12.7757L5.90868 11.0291C4.59639 10.5158 4.65197 8.64004 5.99235 8.20532L17.7034 4.40715C18.8685 4.02927 19.9708 5.13162 19.593 6.29674L15.7948 18.0078C15.3601 19.3482 13.4843 19.4037 12.971 18.0914L11.2244 13.6262C11.072 13.2365 10.7636 12.9282 10.3739 12.7757Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 13.9995L7.39513 15.7757C7.77231 15.9281 8.07141 16.2272 8.22383 16.6044L10 20.9995"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CustomerWaiting;
