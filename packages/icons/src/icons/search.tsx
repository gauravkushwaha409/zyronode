import type { SVGProps } from 'react';
const Search = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    {...props}
  >
    <g clipPath="url(#clip0_3281_9792)">
      <path
        d="M10.5 18C14.6421 18 18 14.6421 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18Z"
        strokeWidth="1.995"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.8027 15.8027L20.9993 20.9993"
        strokeWidth="1.995"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_3281_9792">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default Search;
