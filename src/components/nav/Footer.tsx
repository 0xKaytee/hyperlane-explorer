import Image from 'next/future/image';
import Link from 'next/link';

import { links } from '../../consts/links';
import Discord from '../../images/logos/discord.svg';
import Github from '../../images/logos/github.svg';
import Hyperlane from '../../images/logos/hyperlane-logo.svg';
import Medium from '../../images/logos/medium.svg';
import Twitter from '../../images/logos/twitter.svg';

export function Footer() {
  return (
    <footer className="px-4 pt-5 pb-7 sm:px-10 opacity-80">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-6 sm:gap-0">
        <div className="flex items-center">
          <div className="flex scale-90 sm:scale-100">
            <Image src={Hyperlane} width={56} height={56} alt="" />
          </div>
          <div className="flex flex-col ml-3">
            <p className="text-sm font-light leading-5">
              <span className="text-base font-medium">Hyperlane</span> is the platform
              <br />
              for developers building
              <br />
              the interchain universe.
            </p>
          </div>
        </div>
        <div className="flex">
          <div className="flex flex-col">
            <FooterLink href={links.home} text="About" />
            <FooterLink href={links.docs} text="Docs" />
            <FooterLink href={links.chains} text="Chains" />
            <FooterLink href={links.jobs} text="Jobs" />
          </div>
          <div className="flex flex-col ml-24 sm:ml-16">
            <FooterIconLink href={links.twitter} imgSrc={Twitter} text="Twitter" />
            <FooterIconLink href={links.discord} imgSrc={Discord} text="Discord" />
            <FooterIconLink href={links.github} imgSrc={Github} text="Github" />
            <FooterIconLink href={links.blog} imgSrc={Medium} text="Blog" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, text }: { href: string; text: string }) {
  const aClasses =
    'mt-1.5 text-sm hover:underline underline-offset-4 hover:opacity-70 transition-all';

  if (href[0] === '/') {
    return (
      <Link href={href}>
        <a className={aClasses}>{text}</a>
      </Link>
    );
  } else {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={aClasses}>
        {text}
      </a>
    );
  }
}

function FooterIconLink({ href, imgSrc, text }: { href: string; imgSrc: any; text: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 flex items-center hover:underline underline-offset-4 hover:opacity-70 transition-all"
    >
      <Image src={imgSrc} width={18} height={18} alt="" />
      <span className="ml-2.5 text-sm">{text}</span>
    </a>
  );
}
