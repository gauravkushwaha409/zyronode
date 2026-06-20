import type { SVGProps } from 'react';
const Time = (props: SVGProps<SVGSVGElement>) => (
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
      d="M12 7.75098V12.001L14.75 14.751M21.25 12.001C21.25 17.1096 17.1086 21.251 12 21.251C6.89137 21.251 2.75 17.1096 2.75 12.001C2.75 6.89235 6.89137 2.75098 12 2.75098C17.1086 2.75098 21.25 6.89235 21.25 12.001Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Time;
