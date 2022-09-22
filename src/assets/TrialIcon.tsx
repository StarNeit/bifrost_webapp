import { SVGProps, ReactElement } from 'react';

function TrialIcon(props: SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg
      width={20}
      height={16}
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.111.452c0-.25.2-.452.445-.452h3.9c.246 0 .445.202.445.452v.402c0 .25-.199.453-.444.453v3.99h1.926v-2.11L20 6.15l-6.617 2.965v-2.11h-1.411l2.84 6.83c.427 1.026-.314 2.164-1.41 2.164H5.566c-1.099 0-1.84-1.143-1.407-2.171l2.874-6.824h-.514l-2.223 2.11H0l1.432-2.11V5.297L0 3.187h4.296l2.223 2.11h1.037v-3.99A.448.448 0 017.11.853V.452zM8 7.005l-.614 1.457h4.227l-.606-1.457H8zm2.568-1.708H8.444v-3.97h2.124v3.97z"
        fill="currentColor"
      />
    </svg>
  );
}

export default TrialIcon;
