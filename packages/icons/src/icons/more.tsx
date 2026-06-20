import type { SVGProps } from 'react';
const More = (props: SVGProps<SVGSVGElement>) => (
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
      d="M13 17.25C16.4518 17.25 19.25 14.4518 19.25 11V10.5C19.25 6.77208 16.2279 3.75 12.5 3.75C8.77208 3.75 5.75 6.77208 5.75 10.5V20"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 16.5L5.75 20.25L9.5 16.5"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default More;
