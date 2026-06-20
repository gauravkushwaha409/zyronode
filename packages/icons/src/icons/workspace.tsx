import type { SVGProps } from 'react';
const workspace = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="none"
    {...props}
  >
    <title>workspace</title>
    <path
      d="M10.25 8.75H7.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7.75 12.75H10.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.25 19.25H1.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.75 19.25V5.75C3.75 4.64543 4.64543 3.75 5.75 3.75H12.25C13.3546 3.75 14.25 4.64543 14.25 5.75V19.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.25 7.75H18.25C19.3546 7.75 20.25 8.64543 20.25 9.75V19.25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default workspace;
