import type { SVGProps } from 'react';

const Laptop = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M13.6673 10.9999V5.66659C13.6673 4.09524 13.6673 3.30957 13.1791 2.82141C12.691 2.33325 11.9053 2.33325 10.334 2.33325H5.66732C4.09597 2.33325 3.31029 2.33325 2.82214 2.82141C2.33398 3.30957 2.33398 4.09524 2.33398 5.66659V10.9999"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.6561 13.6667H1.34386C1.08857 13.6667 0.922527 13.4059 1.0367 13.1843L2.33333 11H13.6667L14.9633 13.1843C15.0775 13.4059 14.9114 13.6667 14.6561 13.6667Z"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Laptop;
