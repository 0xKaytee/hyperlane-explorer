import Image from 'next/future/image';

import { links } from '../../consts/links';
import Book from '../../images/icons/book.svg';
import Briefcase from '../../images/icons/briefcase.svg';
import InfoCircle from '../../images/icons/info-circle.svg';
import Discord from '../../images/logos/discord.svg';
import Github from '../../images/logos/github.svg';
import Hyperlane from '../../images/logos/hyperlane-logo.svg';
import Twitter from '../../images/logos/twitter.svg';

export function Footer() {
  return (
    <footer className="mt-3 px-4 py-4 sm:pl-6 sm:pr-8 opacity-80">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex scale-90 sm:scale-100">
            <Image src={Hyperlane} width={52} height={52} />
          </div>
          <div className="flex flex-col ml-3">
            <p className="text-sm font-light">
              <span className="text-base font-medium">Hyperlane</span> is the
              platform
              <br />
              for developers building
              <br />
              the interchain universe
            </p>
          </div>
        </div>
        <div className="grid grid-rows-2 grid-cols-3 gap-y-4 gap-x-5 md:gap-x-8">
          <FooterIconLink to={links.twitter} imgSrc={Twitter} text="Twitter" />
          <FooterIconLink to={links.docs} imgSrc={Book} text="Docs" />
          <FooterIconLink to={links.home} imgSrc={InfoCircle} text="About" />
          <FooterIconLink to={links.discord} imgSrc={Discord} text="Discord" />
          <FooterIconLink to={links.github} imgSrc={Github} text="Github" />
          <FooterIconLink to={links.jobs} imgSrc={Briefcase} text="Jobs" />
        </div>
      </div>
    </footer>
  );
}

function FooterIconLink({
  to,
  imgSrc,
  text,
}: {
  to: string;
  imgSrc: any;
  text: string;
}) {
  return (
    <a
      href={to}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center hover:underline hover:opacity-70 transition-all"
    >
      <Image src={imgSrc} alt={text} width={18} height={18} />
      <span className="hidden sm:inline ml-2 text-sm">{text}</span>
    </a>
  );
}
