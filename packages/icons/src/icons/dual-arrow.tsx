import type { SVGProps } from 'react';
const DualArrow = (props: SVGProps<SVGSVGElement>) => (
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
      d="M8 8.68935L11.4697 5.21968C11.7626 4.92678 12.2374 4.92678 12.5303 5.21968L16 8.68935"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.002 15L12.5323 18.4697C12.2394 18.7626 11.7646 18.7626 11.4717 18.4697L8.00195 15"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default DualArrow;
