import { useEffect, useRef } from 'react';

export function InfiniteScroll({ hasMore, loadMore, disabled }:{ hasMore: boolean; loadMore: ()=>void; disabled?: boolean; }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || !hasMore || disabled) return;
    const el = ref.current;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore, disabled]);

  return <div ref={ref} style={{ height: 1 }} />;
}