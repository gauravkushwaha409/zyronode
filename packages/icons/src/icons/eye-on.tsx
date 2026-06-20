import type { SVGProps } from 'react';

const EyeOn = (props: SVGProps<SVGSVGElement>) => (
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
      d="M21.5274 11.1207C16.6885 2.62909 7.30673 2.62899 2.46788 11.1206C2.15654 11.6669 2.15654 12.3367 2.46788 12.883C7.30673 21.3747 16.6885 21.3748 21.5274 12.8831C21.8387 12.3368 21.8387 11.6671 21.5274 11.1207Z"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.25 11.998C15.25 13.7929 13.7949 15.248 12 15.248C10.2051 15.248 8.75 13.7929 8.75 11.998C8.75 10.2031 10.2051 8.74805 12 8.74805C13.7949 8.74805 15.25 10.2031 15.25 11.998Z"
      strokeWidth="1.995"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default EyeOn;
