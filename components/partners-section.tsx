"use client";

import React from "react";
import Image from "next/image";

export function PartnersSection() {
  return (
    <section className="bg-white py-6 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-gray-400 text-sm font-semibold tracking-wider">
          <span className="uppercase text-xs text-gray-400">Our Partners :</span>
          
          <div className="flex items-center gap-10 md:gap-16 flex-wrap justify-center">
            {/* Booking.com */}
            <div className="relative w-28 h-10">
              <Image
                src="/logos/logo-booking.png"
                alt="Booking.com Logo"
                fill
                className="object-contain"
              />
            </div>

            {/* Airbnb */}
            <div className="relative w-24 h-10">
              <Image
                src="/logos/logo-airbnb.png"
                alt="Airbnb Logo"
                fill
                className="object-contain"
              />
            </div>

            {/* Google */}
            <div className="relative w-24 h-10">
              <Image
                src="/logos/logo-google.png"
                alt="Google Logo"
                fill
                className="object-contain"
              />
            </div>

            {/* Uber */}
            <div className="relative w-20 h-10">
              <Image
                src="/logos/logo-uber.png"
                alt="Uber Logo"
                fill
                className="object-contain"
              />
            </div>

            {/* OXXO */}
            <div className="relative w-20 h-10">
              <Image
                src="/logos/logo-oxxo.png"
                alt="OXXO Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
