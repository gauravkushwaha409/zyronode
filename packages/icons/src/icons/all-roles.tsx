import type { SVGProps } from 'react';
const AllRoles = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="none"
    {...props}
  >
    <circle cx="12" cy="7.5" r="3.375" fill="currentColor" />
    <circle cx="7.5" cy="16.5" r="3.375" fill="currentColor" />
    <circle cx="16.5" cy="16.5" r="3.375" fill="currentColor" />
  </svg>
);

export default AllRoles;
