import type { SVGProps } from 'react';
const Plugins = (props: SVGProps<SVGSVGElement>) => (
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
      d="M10.25 20.249V7.24902H5.75C4.64543 7.24902 3.75 8.14445 3.75 9.24902V13.749M3.75 13.749H16.75V18.249C16.75 19.3536 15.8546 20.249 14.75 20.249H5.75C4.64543 20.249 3.75 19.3536 3.75 18.249V13.749Z"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M20.25 5.75C20.25 4.64543 19.3546 3.75 18.25 3.75H13.75V10.25H20.25V5.75Z"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export default Plugins;
