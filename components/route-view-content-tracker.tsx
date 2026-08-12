"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/meta-pixel";

interface RouteViewContentTrackerProps {
  contentName: string;
  contentCategory?: string;
  contentIds?: string[];
}

export default function RouteViewContentTracker({
  contentName,
  contentCategory = "paraguay",
  contentIds = [],
}: RouteViewContentTrackerProps) {
  useEffect(() => {
    trackViewContent({
      content_name: contentName,
      content_category: contentCategory,
      content_ids: contentIds,
    });
  }, [contentName, contentCategory, contentIds]);

  return null;
}
