import type React from 'react';
import { useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';

import { cn } from '#lib/utils';

interface SlideData {
  image?: string;
  imageAlt?: string;
  imageClassName?: string;
  content?: React.ReactNode;
}

interface OnboardingSliderProps {
  slides: SlideData[];
  dotPosition?: 'top' | 'bottom';
}

export const OnboardingSlider = ({
  slides,
  dotPosition = 'top',
}: OnboardingSliderProps) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  if (!slides.length) return null;

  const renderDots = () => {
    if (slides.length <= 1) return null;

    return (
      <div
        className={cn(
          'flex shrink-0 justify-center gap-2',
          dotPosition === 'top' ? 'pb-4' : 'pt-4',
        )}
      >
        {slides.map((_, index) => {
          const isActive = activeSlide === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => swiperRef.current?.slideToLoop(index)}
              className={cn(
                'relative overflow-hidden rounded-[6px] transition-all duration-300 ease-in-out cursor-pointer',
                isActive
                  ? 'h-2 w-8 loader 2xl:h-2.5 2xl:w-10'
                  : 'h-2 w-4 bg-primary-200 backdrop-blur-[10px] 2xl:h-2.5 2xl:w-5',
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {dotPosition === 'top' && renderDots()}

      <div className="relative flex-1 min-h-0">
        <Swiper
          loop={slides.length > 1}
          autoplay={
            slides.length > 1
              ? { delay: 5000, disableOnInteraction: false }
              : false
          }
          modules={[Autoplay]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setActiveSlide(swiper.realIndex);
          }}
          className="h-full w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="h-full">
              {slide.content ? (
                slide.content
              ) : (
                <img
                  src={slide.image}
                  alt={slide.imageAlt}
                  className={cn(
                    'h-full w-full object-cover',
                    slide.imageClassName,
                  )}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {dotPosition === 'bottom' && renderDots()}
    </div>
  );
};
