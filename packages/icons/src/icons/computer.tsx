import type { SVGProps } from 'react';
const Computer = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        {...props}
    >
        <path d="M15 1H7C4.17157 1 2.75736 1 1.87868 1.87868C1 2.75736 1 4.17157 1 7V9C1 11.8284 1 13.2426 1.87868 14.1213C2.75736 15 4.17157 15 7 15H15C17.8284 15 19.2426 15 20.1213 14.1213C21 13.2426 21 11.8284 21 9V7C21 4.17157 21 2.75736 20.1213 1.87868C19.2426 1 17.8284 1 15 1Z" stroke="#667085" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

    </svg>
);

export default Computer;
