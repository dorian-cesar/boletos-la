"use client";

import React, { useRef, useEffect } from "react";
import { format, addDays, subDays, parse, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DateNavbarProps {
  currentDate: string; // 'yyyy-MM-dd'
  onSelectDate: (date: string) => void;
  className?: string;
}

export function DateNavbar({
  currentDate,
  onSelectDate,
  className,
}: DateNavbarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Parse current date to ensure valid Date object
  let parsedCurrentDate = new Date();
  try {
    if (currentDate) {
      parsedCurrentDate = parse(currentDate, "yyyy-MM-dd", new Date());
    }
  } catch (e) {
    console.error("Invalid date string", currentDate);
  }

  // Generate 7 days around the current date (-2 days, current, +4 days) or today onwards
  const today = startOfDay(new Date());
  
  // We don't want to show dates before today
  let startDate = subDays(parsedCurrentDate, 2);
  if (startDate < today) {
    startDate = today;
  }

  // Generate dates centered around the selected date, or starting from today
  const dates = Array.from({ length: 30 }, (_, i) => {
    return addDays(startDate, i);
  });

  const scrollLeft = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      container.scrollBy({ left: -(container.clientWidth + 8), behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      container.scrollBy({ left: container.clientWidth + 8, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const selectedBtn = scrollRef.current.querySelector('[data-selected="true"]') as HTMLElement;
      if (selectedBtn) {
        selectedBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [currentDate]);

  return (
    <div className={cn("flex items-center w-full gap-1.5 sm:gap-2 relative", className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-14 w-8 sm:w-10 shrink-0 bg-white dark:bg-slate-800 rounded-l-xl rounded-r-none border-r-0 hover:bg-slate-50 dark:hover:bg-slate-700 flex border-slate-300 dark:border-slate-700 shadow-sm"
        onClick={scrollLeft}
        aria-label="Fecha anterior"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
      </Button>

      <div
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto no-scrollbar gap-2 scroll-smooth snap-x snap-mandatory py-1 px-1 sm:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {dates.map((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const isSelected = dateStr === currentDate;
          
          // Capitalize first letter of day
          const dayName = format(date, "EEE. d", { locale: es });
          const displayDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

          return (
            <button
              key={dateStr}
              data-selected={isSelected}
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center justify-center w-[calc((100%-16px)/3)] sm:w-[calc((100%-24px)/4)] md:w-[calc((100%-32px)/5)] lg:w-[calc((100%-40px)/6)] xl:w-[calc((100%-48px)/7)] px-2 h-14 rounded-xl transition-all border duration-200 snap-start",
                isSelected
                  ? "bg-secondary text-secondary-foreground border-secondary shadow-md font-bold transform scale-[1.02]"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-secondary hover:bg-slate-50 dark:hover:bg-slate-700"
              )}
            >
              <span className="text-xs sm:text-sm md:text-base font-semibold truncate max-w-full">{displayDay}</span>
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-14 w-8 sm:w-10 shrink-0 bg-white dark:bg-slate-800 rounded-r-xl rounded-l-none border-l-0 hover:bg-slate-50 dark:hover:bg-slate-700 flex border-slate-300 dark:border-slate-700 shadow-sm"
        onClick={scrollRight}
        aria-label="Fecha siguiente"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-300" />
      </Button>
      
      {/* Hide scrollbar for Chrome/Safari */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}
