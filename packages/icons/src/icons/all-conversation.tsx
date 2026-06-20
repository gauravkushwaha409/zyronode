import type { SVGProps } from 'react';
const AllConversation = (props: SVGProps<SVGSVGElement>) => (
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
      d="M15 7.75L18.5429 11.2929C18.9334 11.6834 18.9334 12.3166 18.5429 12.7071L15 16.25"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.75 12H18.5"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20.25 4.75V19.25"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default AllConversation;
