import type { SVGProps } from 'react';
const Reply = (props: SVGProps<SVGSVGElement>) => (
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
      d="M18 18.998L20.9393 16.0587C21.5251 15.4729 21.5251 14.5231 20.9393 13.9373L18 10.998"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 14.998H7.375C4.82068 14.998 2.75 12.9273 2.75 10.373C2.75 7.81873 4.82068 5.74805 7.375 5.74805H12.25"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Reply;
