import { SVGProps, ReactElement } from 'react';

function CorrectionIcon(props: SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg
      width={13}
      height={18}
      viewBox="0 0 13 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.15.017a.355.355 0 01.445.219L8.4 2.627a.34.34 0 01-.225.432l-.037.012a.355.355 0 01-.445-.219l-.055-.163.004.012-6.324 2.01c-.492.156-1.04-.153-1.246-.765-.206-.612.048-1.176.54-1.332L6.937.604 6.889.46a.34.34 0 01.225-.432L7.15.017zm.346 2.25l-.413-1.23-2.165.688 2.456.58.122-.038zM7.17 5.92a.347.347 0 00-.352.342v.304c0 .183.148.332.333.342v3.343L4.46 16.356C4.116 17.134 4.703 18 5.574 18h6.211c.869 0 1.456-.861 1.118-1.639l-2.66-6.108V6.908h.02a.347.347 0 00.352-.342v-.304a.347.347 0 00-.352-.343H7.17zm.686.988h1.683v3.484l.736 1.69H7.11l.746-1.69V6.908z"
        fill="currentColor"
      />
    </svg>
  );
}

export default CorrectionIcon;
