declare module "html2pdf.js" {
  export default function html2pdf(): {
    from(element: HTMLElement): any;
    set(opts: any): any;
    save(): Promise<void>;
  };
}


