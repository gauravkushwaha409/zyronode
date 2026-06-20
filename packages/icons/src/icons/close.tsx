import type { SVGProps } from 'react';
const Close = (props: SVGProps<SVGSVGElement>) => (
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
      d="M6.25 6.25L17.75 17.75M17.75 6.25L6.25 17.75"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default Close;
