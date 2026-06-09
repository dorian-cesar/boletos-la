"use client";

import Image from "next/image";

export function PartnersSection() {
  return (
    <section className="bg-white py-6 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-gray-400 text-sm font-semibold tracking-wider">
          <div className="flex items-center gap-10 md:gap-16 flex-wrap justify-center">
            {/* Booking.com */}
            <div className="relative w-36 h-12">
              <Image
                src="/logos/logo-booking.png"
                alt="Booking.com Logo"
                fill
                sizes="150px"
                className="object-contain"
              />
            </div>

            {/* Airbnb */}
            <div className="relative w-32 h-12">
              <Image
                src="/logos/logo-airbnb.png"
                alt="Airbnb Logo"
                fill
                sizes="130px"
                className="object-contain"
              />
            </div>

            {/* Google */}
            <div className="relative w-32 h-12">
              <Image
                src="/logos/logo-google.png"
                alt="Google Logo"
                fill
                sizes="130px"
                className="object-contain p-0.5"
              />
            </div>

            {/* Uber */}
            <div className="relative w-28 h-12">
              <Image
                src="/logos/logo-uber.png"
                alt="Uber Logo"
                fill
                sizes="110px"
                className="object-contain p-1"
              />
            </div>

            {/* OXXO */}
            <div className="relative w-28 h-12">
              <Image
                src="/logos/logo-oxxo.png"
                alt="OXXO Logo"
                fill
                sizes="110px"
                className="object-contain"
              />
            </div>

            {/* Rappi */}
            <div className="relative w-28 h-12">
              <Image
                src="/logos/rappi-logo.svg"
                alt="Rappi Logo"
                fill
                sizes="110px"
                className="object-contain p-0.5"
              />
            </div>

            {/* TripAdvisor */}
            <div className="relative w-32 h-12">
              <Image
                src="/logos/trip-advisor.svg"
                alt="TripAdvisor Logo"
                fill
                sizes="130px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
