import { CmsImage } from '@/components/ui/Image';
import type { ArticleBlockT } from '@/lib/cms/pages/news';
import { Inline } from './Inline';
import messages from '@/lib/i18n/messages/pages/news-article.en.json';

type Block = ArticleBlockT;

function Feature({ b, label }: { b: Extract<Block, { type: 'feature' }>; label: string }) {
  const bars = ['border-[#0224a6] bg-[#262e4e]', 'border-[#64c2fe] bg-[#263b4a]'];
  // The design draws the first label in #0224a6 on a dark tile (contrast far below AA): a lighter blue is used.
  const labels = ['text-[#8aa0ff]', 'text-[#64c2fe]'];
  return (
    <aside className="mb-[33px] mt-[32px] bg-[#2f3038] p-[24px] md:min-h-[363px] md:py-[48px] md:pl-[48px] md:pr-[16px]">
      <div className="flex flex-col gap-[32px] md:h-full md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 md:max-w-[480px]">
          <h3 className="m-0 text-[22px] font-semibold leading-[30px] tracking-[0.3px] text-white md:text-[24px]">{b.title}</h3>
          <p className="m-0 mt-[16px] text-[14px] leading-[20px] text-[#94a3b8]">{b.text}</p>
          {b.stats.length > 0 && (
            <ul aria-label={label} className="m-0 mt-[24px] flex list-none flex-wrap gap-[16px] p-0">
              {b.stats.map((s, i) => (
                <li key={s.label} className={`flex h-[80px] flex-col justify-center border-l-4 px-[16px] ${bars[i % 2]}`}>
                  <span className="text-[26px] font-bold leading-[32px] text-white">{s.value}</span>
                  <span className={`text-[9px] font-bold uppercase leading-[12px] tracking-[0.8px] ${labels[i % 2]}`}>{s.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {b.image && <CmsImage file={b.image} alt="" width={266} height={266} className="block h-auto w-full max-w-[266px] shrink-0 md:w-[266px]" />}
      </div>
    </aside>
  );
}

/** Article body: structured blocks rendered as React nodes (never raw HTML). */
export function Blocks({ blocks }: { blocks: Block[] }) {
  const m = messages.article;
  return (
    <div>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'lead':
            return <p key={i} data-b="lead" className="m-0 text-[20px] font-medium leading-[30px] text-[#1a1b23] md:text-[24px] md:leading-[32px]"><Inline text={b.text} /></p>;
          case 'heading':
            return b.level === 2 ? (
              <h2 key={i} className="m-0 mt-[33px] text-[24px] font-bold leading-[32px] text-[#1a1b23] [[data-b=lead]+&]:mt-[18px] md:text-[30px] md:leading-[36px] md:tracking-[-0.2px]"><Inline text={b.text} /></h2>
            ) : (
              <h3 key={i} className="m-0 mt-[28px] text-[20px] font-semibold leading-[28px] text-[#1a1b23] md:text-[22px]"><Inline text={b.text} /></h3>
            );
          case 'paragraph':
            return <p key={i} className="m-0 mt-[24px] text-[16px] leading-[26px] text-[#444654] first:mt-0 [blockquote+&]:mt-[32px] [h2+&]:mt-[31px]"><Inline text={b.text} /></p>;
          case 'quote':
            return (
              <blockquote key={i} className="m-0 mt-[32px] border-l-[8px] border-[#0224a6] py-[16px] pl-[24px] md:pl-[32px]">
                <p className="m-0 text-[20px] font-semibold leading-[28px] text-[#1a1b23] md:text-[24px] md:leading-[32px]"><Inline text={b.text} /></p>
                {b.cite && <footer className="mt-[8px] text-[14px] text-[#444654]">{b.cite}</footer>}
              </blockquote>
            );
          case 'image':
            return (
              <figure key={i} className="m-0 mt-[32px]">
                <CmsImage file={b.file} alt={b.alt} width={864} height={486} className="block h-auto w-full" />
                {b.caption && <figcaption className="mt-[8px] text-[14px] leading-[20px] text-[#444654]">{b.caption}</figcaption>}
              </figure>
            );
          case 'list': {
            const L = b.ordered ? 'ol' : 'ul';
            return (
              <L key={i} className={`m-0 mt-[24px] pl-[24px] text-[16px] leading-[26px] text-[#444654] ${b.ordered ? 'list-decimal' : 'list-disc'}`}>
                {b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}
              </L>
            );
          }
          case 'feature':
            return <Feature key={i} b={b} label={m.statsLabel} />;
        }
      })}
    </div>
  );
}
