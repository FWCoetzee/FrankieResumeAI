import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 20v-8" />
      <path d="M12 12V4" />
      <path d="M12 12H4" />
      <path d="M12 12h8" />
      <path d="M4 12v8" />
      <path d="M20 12v8" />
    </svg>
  );
}

export function StripeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      {...props}
    >
      <title>Stripe Logo</title>
      <path
        d="M21.528 21.136c-3.136 1.472-3.136 3.84 0 5.248l9.024 4.224c3.136 1.472 6.432-1.024 4.96-4.16l-1.472-3.136c-1.472-3.136-3.84-3.136-5.248 0l-3.008 6.4c-1.472 3.136.96 6.432 4.096 4.96l10.432-4.896c3.136-1.472 3.136-3.84 0-5.248L24.496 9.76c-3.136-1.472-6.432 1.024-4.96 4.16l1.472 3.136c1.472 3.136 3.84 3.136 5.248 0l3.008-6.4c1.472-3.136-.96-6.432-4.096-4.96L4.736 20.576c-3.136 1.472-3.136 3.84 0 5.248l21.312 9.92c3.136 1.472 6.432-1.024 4.96-4.16l-1.472-3.136c-1.472-3.136-3.84-3.136-5.248 0l-3.008 6.4c-1.472 3.136.96 6.432 4.096 4.96l10.432-4.896c3.136-1.472 3.136-3.84 0-5.248L21.528 21.136z"
        fill="#635bff"
      />
    </svg>
  );
}

export function PaypalLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
    >
      <title>PayPal Logo</title>
      <path fill="#003087" d="M20.55 5.511c-.216-1.23-.97-2.13-2.126-2.585C17.234 2.48 15.652 2 13.596 2H5.163L3 18.06h4.52l.63-3.903h2.622c4.78 0 8.017-2.313 8.61-6.853.33-2.52-.77-4.322-1.832-5.793zM10.12 12.31H7.83l.405-2.51h2.29l-.405 2.51zm5.2-1.577c-.307 2.05-2.29 3.04-4.52 3.04h-1.3l.406-2.51h1.3c1.652 0 2.622-.59 2.912-1.92.21-1.025-.135-1.577-.972-1.577H8.636l.54-3.32h2.846c2.43 0 3.886.666 3.48 2.96-.21 1.23-.97 2.333-1.96 2.83z"/>
    </svg>
  );
}
