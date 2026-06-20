import type { SVGProps } from 'react';
const PendingInvite = (props: SVGProps<SVGSVGElement>) => (
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
      d="M5 10.7168C3.29782 11.6225 2.25 12.8575 2.25 14.2188C2.25 16.9974 6.61522 19.2498 12 19.2498C17.3848 19.2498 21.75 16.9974 21.75 14.2188C21.75 12.8575 20.7022 11.6225 19 10.7168"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 8.25L12 4.75L15.5 8.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14.25V5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
export default PendingInvite;
