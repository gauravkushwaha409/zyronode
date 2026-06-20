import type { SVGProps } from 'react';
const Tickets = (props: SVGProps<SVGSVGElement>) => (
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
      d="M19 4.99902H5C3.89543 4.99902 3 5.89445 3 6.99902V9.24902C5.5 10.249 5.5 13.749 3 14.749V16.999C3 18.1036 3.89543 18.999 5 18.999H19C20.1046 18.999 21 18.1036 21 16.999V14.749C18.5 13.749 18.5 10.249 21 9.24902V6.99902C21 5.89445 20.1046 4.99902 19 4.99902Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 8.50098V8.50998"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 12V12.009"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 15.499V15.508"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Tickets;
