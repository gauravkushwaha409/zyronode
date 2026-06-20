import type { SVGProps } from 'react';
const Filter = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    {...props}
  >
    <path d="M2.75 4.75H21.25" strokeWidth="2" strokeLinecap="round" />
    <path d="M8.75 19.25H15.25" strokeWidth="2" strokeLinecap="round" />
    <path d="M5.75 12H18.25" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default Filter;
