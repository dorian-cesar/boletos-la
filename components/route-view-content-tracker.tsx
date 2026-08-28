"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/meta-pixel";

interface RouteViewContentTrackerProps {
  contentName: string;
  contentCategory?: string;
  contentIds?: string[];
  value?: number;
  currency?: string;
}

export default function RouteViewContentTracker({
  contentName,
  contentCategory = "paraguay",
  contentIds = [],
  value = 0,
  currency = "PYG",
}: RouteViewContentTrackerProps) {
  useEffect(() => {
    trackViewContent({
      content_name: contentName,
      content_category: contentCategory,
      content_ids: contentIds,
      value,
      currency,
    });
  }, [contentName, contentCategory, contentIds, value, currency]);

  return null;
}
