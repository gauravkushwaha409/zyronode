import type { SVGProps } from 'react';
const Logout = (props: SVGProps<SVGSVGElement>) => (
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
      d="M17.5 9.25H6.25M13 4.75L17.5 9.25L13 13.75M8.5 17.5H3C1.89543 17.5 1 16.6046 1 15.5V3C1 1.89543 1.89543 1 3 1H8.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logout;
