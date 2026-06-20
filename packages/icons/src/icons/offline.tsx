import type { SVGProps } from 'react';
const Offline = (props: SVGProps<SVGSVGElement>) => (
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
      d="M12.0014 12.25C7.80812 12.25 5.3732 14.9227 4.69664 18.2626C4.47735 19.3452 5.39684 20.25 6.50141 20.25H11.2515M16.5 7.75C16.5 10.2353 14.4853 12.25 12 12.25C9.51472 12.25 7.5 10.2353 7.5 7.75C7.5 5.26472 9.51472 3.25 12 3.25C14.4853 3.25 16.5 5.26472 16.5 7.75Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 17.25C21 19.3211 19.3211 21 17.25 21C15.1789 21 13.5 19.3211 13.5 17.25C13.5 15.1789 15.1789 13.5 17.25 13.5C19.3211 13.5 21 15.1789 21 17.25Z"
      fill="currentColor"
    />
  </svg>
);
export default Offline;
