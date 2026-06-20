import type { SVGProps } from 'react';
const Dot = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="none"
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" />
  </svg>
);

export default Dot;
