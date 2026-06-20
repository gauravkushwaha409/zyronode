import type { SVGProps } from 'react';
const CustomerWaiting = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 32 32"
    fill="none"
    stroke="none"
    {...props}
  >
    <path
      d="M13.8319 17.0343L7.87828 14.7055C6.12856 14.0211 6.20267 11.5201 7.98984 10.9404L23.6046 5.8762C25.158 5.37236 26.6278 6.84216 26.124 8.39565L21.0598 24.0104C20.4802 25.7976 17.9791 25.8716 17.2947 24.1219L14.9659 18.1683C14.7627 17.6487 14.3515 17.2376 13.8319 17.0343Z"
      stroke="url(#paint0_linear_3442_2551)"
      strokeWidth="2.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 18.6663L9.86017 21.0346C10.3631 21.2378 10.7619 21.6366 10.9651 22.1395L13.3333 27.9996"
      stroke="url(#paint1_linear_3442_2551)"
      strokeWidth="2.66667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_3442_2551"
        x1="16.4158"
        y1="5.77539"
        x2="16.4158"
        y2="25.3934"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#925BF0" />
        <stop offset="1" stopColor="#54358A" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_3442_2551"
        x1="8.66667"
        y1="18.6663"
        x2="8.66667"
        y2="27.9996"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#925BF0" />
        <stop offset="1" stopColor="#54358A" />
      </linearGradient>
    </defs>
  </svg>
);

export default CustomerWaiting;
