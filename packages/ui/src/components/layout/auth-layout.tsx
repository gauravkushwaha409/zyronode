import type React from 'react';
import { useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';

import {
  Avatar,
  AvatarGroup,
  AvatarGroupCount,
} from '#components/shadcn/avatar';
import { Icon } from '#components/icons/Icons';
import { Typography } from '#components/shared/typography';

interface SlideItem {
  id: number;
  content: React.ReactNode;
}

interface TestimonialItem {
  id: number;
  name: string;
  quote: string;
  role: string;
  image: string;
}

interface CompanyLogo {
  src: string;
  alt: string;
}

const SUPPORT_FEATURES = [
  'Engage Faster & Sell Smarter',
  'Automate Support',
  'Deliver personalized conversations',
  'Increase Conversions by 10x',
];

const COMPANY_LOGOS: CompanyLogo[] = [
  { src: '/images/auth/neon-edge.svg', alt: 'Neon Edge' },
  { src: '/images/auth/flux-code.svg', alt: 'Flux Code' },
  { src: '/images/auth/edu-sphere.svg', alt: 'Edu Sphere' },
  { src: '/images/auth/usevia-chat.svg', alt: 'Usevia Chat' },
  { src: '/images/auth/arvo-tech.svg', alt: 'Arvo Tech' },
  { src: '/images/auth/nexa-care.svg', alt: 'Nexa Care' },
];

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 1,
    quote:
      'Chatboq has revolutionized how we interact with our customers, offering instant support and valuable insights. It is a powerful tool that improves our teams efficiency and customer satisfaction',
    name: 'Emily Roberts',
    role: 'Marketing Director',
    image: '/images/auth/testimonials/emily.webp',
  },
  {
    id: 2,
    quote:
      'The real-time visitor analytics dashboard has helped us monitor user behavior and tailor our messaging. This has significantly boosted our conversions and customer engagement',
    name: 'John Carter',
    role: 'Senior Sales Manager ',
    image: '/images/auth/testimonials/john.webp',
  },
  {
    id: 3,
    quote:
      "Since integrating Chatboq, our response times have improved drastically. It's easy to use, reliable, and has made a positive impact on both customer experience and our internal workflow",
    name: 'Samantha Johnson',
    role: 'Customer Success Manager ',
    image: '/images/auth/testimonials/samantha.webp',
  },
];

export const AuthLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const parentSwiperRef = useRef<SwiperType | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const resetAutoplay = () => {
    if (!parentSwiperRef.current?.autoplay) return;

    parentSwiperRef.current.autoplay.stop();
    parentSwiperRef.current.autoplay.start();
    setAnimationKey((k) => k + 1);
  };

  const slides: SlideItem[] = [
    {
      id: 1,
      content: <TrustedBySection />,
    },
    {
      id: 2,
      content: <OmnichannelSection />,
    },
    {
      id: 3,
      content: <TestimonialSection onInteract={resetAutoplay} />,
    },
  ];
  return (
    <section className="flex h-screen overflow-hidden">
      <aside className="relative flex h-full w-[384px] flex-col overflow-hidden pt-8 pl-8 max-lg:hidden 2xl:w-137.5 2xl:pt-16 2xl:pl-12 bg-[linear-gradient(180deg,_#FEFAF6_0%,_#F9F6FE_100%)]">
        <Header
          slides={slides.length}
          activeSlide={activeSlide}
          animationKey={animationKey}
          onNavigate={(index) => {
            parentSwiperRef.current?.slideToLoop(index);
            resetAutoplay();
          }}
        />

        <Swiper
          className="relative h-full w-full overflow-hidden"
          loop={true}
          spaceBetween={20}
          autoplay={{
            delay: 10000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          modules={[Autoplay, Pagination]}
          onSwiper={(swiper) => {
            parentSwiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setActiveSlide(swiper.realIndex);
          }}
        >
          {slides.map(({ id, content }) => (
            <SwiperSlide key={id}>{content}</SwiperSlide>
          ))}
        </Swiper>
      </aside>

      <main className="flex flex-1 justify-center bg-white-base py-8 2xl:py-16">
        {children}
      </main>
    </section>
  );
};

interface HeaderProps {
  slides: number;
  activeSlide: number;
  animationKey: number;
  onNavigate: (index: number) => void;
}

const Header: React.FC<HeaderProps> = ({
  slides,
  activeSlide,
  animationKey,
  onNavigate,
}) => {
  return (
    <header className="mb-8 flex justify-between pr-8 2xl:mb-16 2xl:pr-12">
      <div className="flex items-center">
        <Icon name="chatboq-logo" size={40} />
        <img alt="chatboq" src="/images/chatboq.svg" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: slides }).map((_, slideIndex) => {
          const isActive = activeSlide === slideIndex;
          const slideKey = `slide-${slideIndex + 1}`;

          return (
            <button
              key={slideKey}
              type="button"
              onClick={() => onNavigate(slideIndex)}
              aria-label={`Go to slide ${slideIndex + 1}`}
              className={`relative overflow-hidden rounded-[6px] transition-all duration-300 ease-in-out cursor-pointer ${
                isActive
                  ? 'h-2 w-8 loader 2xl:h-2.5 2xl:w-10'
                  : 'h-2 w-4 bg-primary-200 backdrop-blur-[10px] 2xl:h-2.5 2xl:w-5'
              }`}
            >
              {isActive && (
                <span
                  key={`loader-${slideKey}-${animationKey}`}
                  className="loader absolute inset-0"
                />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};

const TrustedBySection: React.FC = () => {
  return (
    <section className="flex h-full flex-col justify-between pr-8 pb-8 2xl:pr-12 2xl:pb-16">
      <div className="space-y-8 2xl:space-y-16">
        <Typography.D1
          weight="semibold"
          className="text-gray-950 max-2xl:text-[26px]"
        >
          Trusted by 10,000+ businesses to support customers smarter
        </Typography.D1>

        <ul className="space-y-4 2xl:space-y-5">
          {SUPPORT_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-4.5">
              <Icon
                name="customer-waiting-gradient"
                className="size-6.5 text-primary-500 2xl:size-8"
              />
              <Typography.H3 weight="semibold" className="max-2xl:text-[18px]">
                {feature}
              </Typography.H3>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-x-11 gap-y-6">
        {COMPANY_LOGOS.map(({ src, alt }) => (
          <img key={alt} src={src} alt={alt} />
        ))}
      </div>
    </section>
  );
};

const OmnichannelSection: React.FC = () => {
  return (
    <section className="flex h-full flex-col justify-between overflow-hidden">
      <div className="space-y-5 pr-8 2xl:space-y-6 2xl:pr-12">
        <Typography.D1
          weight="semibold"
          className="text-gray-950 max-2xl:text-[26px]"
        >
          Omnichannel Inbox for Support, Sales & Messaging
        </Typography.D1>

        <Typography.H5
          weight="regular"
          className="text-gray-500 max-2xl:text-[18px]"
        >
          Manage website chat, email, and social messages from one smart inbox.
        </Typography.H5>
      </div>

      <div>
        <img
          src="/images/auth/Omnichannels Illustration.svg"
          alt="Omnichannel illustration"
          className="translate-x-2/5"
        />
      </div>
    </section>
  );
};

interface TestimonialSectionProps {
  onInteract?: () => void;
}

const TestimonialSection: React.FC<TestimonialSectionProps> = ({
  onInteract,
}) => {
  const testimonialSwiperRef = useRef<SwiperType | null>(null);

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!testimonialSwiperRef.current) return;

    if (direction === 'prev') {
      testimonialSwiperRef.current.slidePrev();
    } else {
      testimonialSwiperRef.current.slideNext();
    }

    onInteract?.();
  };

  return (
    <section className="flex h-full flex-col justify-between pr-8 pb-8 2xl:pr-12 2xl:pb-16">
      <div className="space-y-5 2xl:space-y-6">
        <Typography.D1
          weight="semibold"
          className="text-gray-950 max-2xl:text-[26px]"
        >
          See how teams respond faster and convert more with Chatboq.
        </Typography.D1>

        <div className="flex gap-5">
          <AvatarGroup max={4}>
            <Avatar
              className="size-7.5 backdrop-blur-[10px] 2xl:size-9"
              image="/images/auth/testimonials/emily.webp"
            />
            <Avatar
              className="size-7.5 backdrop-blur-[10px] 2xl:size-9"
              image="/images/auth/testimonials/john.webp"
            />
            <Avatar
              className="size-7.5 backdrop-blur-[10px] 2xl:size-9"
              image="/images/auth/testimonials/samantha.webp"
            />
            <AvatarGroupCount className="typo-5 size-7.5 bg-primary-100 font-semibold text-primary-500 backdrop-blur-[10px] 2xl:size-9">
              10k
            </AvatarGroupCount>
          </AvatarGroup>
          <Typography.H5
            weight="medium"
            className="text-gray-700 max-2xl:text-base"
          >
            Happy Leaders
          </Typography.H5>
        </div>
      </div>

      <Swiper
        className="h-fit w-full rounded-[10px]"
        loop
        spaceBetween={20}
        onSwiper={(swiper) => {
          testimonialSwiperRef.current = swiper;
        }}
      >
        {TESTIMONIALS.map((testimonial) => (
          <SwiperSlide
            key={testimonial.id}
            className="relative rounded-[10px] bg-[linear-gradient(180deg,#EFE8FD_0%,rgba(252,250,255,0.50)_100%)] p-6"
          >
            <div className="flex h-full flex-col justify-between">
              <Typography.H4 weight="medium" className="mb-7 max-2xl:text-base">
                &ldquo;{testimonial.quote}&rdquo;
              </Typography.H4>

              <section className="flex gap-4 2xl:gap-5">
                <Avatar
                  image={testimonial.image}
                  className="size-9 backdrop-blur-[10px] 2xl:size-11"
                />
                <div>
                  <Typography.H6 className="text-gray-700 max-2xl:text-sm">
                    {testimonial.name}
                  </Typography.H6>
                  <Typography.T3 className="text-gray-600 max-2xl:text-xs">
                    {testimonial.role}
                  </Typography.T3>
                </div>
              </section>
            </div>
          </SwiperSlide>
        ))}

        <SliderNavigation
          onPrev={() => handleNavigation('prev')}
          onNext={() => handleNavigation('next')}
        />
      </Swiper>
    </section>
  );
};

interface SliderNavigationProps {
  onPrev: () => void;
  onNext: () => void;
}

const SliderNavigation: React.FC<SliderNavigationProps> = ({
  onPrev,
  onNext,
}) => {
  return (
    <div className="absolute right-2 bottom-6 z-10 flex gap-3 2xl:right-8 2xl:bottom-8">
      <button
        type="button"
        onClick={onPrev}
        className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-white-base text-gray-500 backdrop-blur-[10px]"
      >
        <Icon name="arrow-left" size={16} />
      </button>

      <button
        type="button"
        onClick={onNext}
        className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-white-base text-gray-500 backdrop-blur-[10px]"
      >
        <Icon name="arrow-right" size={16} />
      </button>
    </div>
  );
};
