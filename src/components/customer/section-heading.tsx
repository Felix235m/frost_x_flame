export interface SectionHeadingProps {
  title: string;
  /** Small factual count or unit shown opposite the title, e.g. "3 battle zones". */
  meta?: string;
  id?: string;
}

export function SectionHeading({ title, meta, id }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 md:mb-7">
      <h2
        id={id}
        className="font-heading text-headline-lg-mobile tracking-tight text-white uppercase md:text-headline-lg"
      >
        {title}
      </h2>
      {meta ? <span className="text-body-sm text-on-surface-variant">{meta}</span> : null}
    </div>
  );
}
