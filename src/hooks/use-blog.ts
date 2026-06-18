import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  blogQueryKey,
  fetchBlogPosts,
  type BlogPost,
} from "@/lib/blog";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type UseBlogPostsOptions = {
  enabled?: boolean;
  includeDrafts?: boolean;
  placeholderData?: BlogPost[] | false;
};

export function useBlogPosts(options: UseBlogPostsOptions = {}) {
  const includeDrafts = options.includeDrafts ?? false;

  return useQuery({
    queryKey: [...blogQueryKey, includeDrafts ? "all" : "published"],
    queryFn: () => fetchBlogPosts({ includeDrafts }),
    enabled: options.enabled ?? true,
    placeholderData: options.placeholderData === false ? undefined : options.placeholderData,
  });
}

export function useBlogRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel("blog-posts-db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, () => {
        void queryClient.invalidateQueries({ queryKey: blogQueryKey });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
