import { useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { useCallback, useMemo } from 'react';

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 400;

export type SwipeAction = 'approve' | 'deny' | 'discuss' | null;

export function useSwipeGesture(onSwipe: (action: SwipeAction) => void) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-300, 0, 300], [-12, 0, 12]);
  const approveOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const denyOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const discussOpacity = useTransform(y, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const onDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const absX = Math.abs(info.offset.x);
    const absY = Math.abs(info.offset.y);
    const velX = Math.abs(info.velocity.x);
    const velY = Math.abs(info.velocity.y);

    if (info.offset.y < -SWIPE_THRESHOLD || (info.offset.y < -60 && velY > VELOCITY_THRESHOLD)) {
      if (absY > absX) {
        onSwipe('discuss');
        return;
      }
    }

    if (info.offset.x > SWIPE_THRESHOLD || (info.offset.x > 60 && velX > VELOCITY_THRESHOLD)) {
      onSwipe('approve');
      return;
    }

    if (info.offset.x < -SWIPE_THRESHOLD || (info.offset.x < -60 && velX > VELOCITY_THRESHOLD)) {
      onSwipe('deny');
      return;
    }

    onSwipe(null);
  }, [onSwipe]);

  return useMemo(() => ({
    x,
    y,
    rotate,
    approveOpacity,
    denyOpacity,
    discussOpacity,
    onDragEnd,
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
  }), [x, y, rotate, approveOpacity, denyOpacity, discussOpacity, onDragEnd]);
}

export function getExitAnimation(direction: SwipeAction) {
  switch (direction) {
    case 'approve': return { x: 600, rotate: 15, opacity: 0 };
    case 'deny': return { x: -600, rotate: -15, opacity: 0 };
    case 'discuss': return { y: -500, opacity: 0 };
    default: return { x: 0, y: 0, opacity: 0 };
  }
}
