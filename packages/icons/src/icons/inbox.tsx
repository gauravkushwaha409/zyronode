import type { SVGProps } from 'react';
const Inbox = (props: SVGProps<SVGSVGElement>) => (
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
      d="M4.75195 7.75098H15.252C16.3565 7.75098 17.252 8.64641 17.252 9.75098V16.251C17.252 17.3556 16.3565 18.251 15.252 18.251H10.502L6.00195 20.751V18.251H4.75195C3.64738 18.251 2.75195 17.3556 2.75195 16.251V9.75098C2.75195 8.64641 3.64738 7.75098 4.75195 7.75098Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.2518 14.25H19.254C20.3585 14.25 21.254 13.3546 21.254 12.25V5.75C21.254 4.64543 20.3585 3.75 19.254 3.75H9.00391C7.89934 3.75 7.00391 4.64543 7.00391 5.75V7.75"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Inbox;
