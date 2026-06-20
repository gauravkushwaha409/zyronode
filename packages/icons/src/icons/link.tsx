import type { SVGProps } from 'react';
const Link = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    {...props}
  >
    <path
      d="M9.5 14.4981L14.5 9.49805"
      strokeWidth="1.995"
      strokeLinecap="round"
    />
    <path
      d="M16.8463 14.6095L19.4558 12C21.5147 9.94112 21.5147 6.60302 19.4558 4.54415C17.397 2.48528 14.0589 2.48528 12 4.54415L9.39045 7.1537M14.6095 16.8463L12 19.4558C9.94113 21.5147 6.60303 21.5147 4.54416 19.4558C2.48528 17.3969 2.48528 14.0588 4.54416 12L7.1537 9.39045"
      strokeWidth="1.995"
      strokeLinecap="round"
    />
  </svg>
);

export default Link;
