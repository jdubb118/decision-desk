import { useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import type { Deliverable } from '../types/deliverable';
import type { SwipeAction } from '../hooks/useSwipeGesture';

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 350;

interface SwipeableCardProps {
  current: Deliverable;
  next: Deliverable | null;
  onSwipe: (action: Exclude<SwipeAction, null>) => void;
  exitDirection: SwipeAction;
  children: React.ReactNode;
}

export function SwipeableCard({ current, next, onSwipe, exitDirection, children }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const draggingRef = useRef(false);

  useEffect(() => {
    x.set(0);
    y.set(0);
  }, [current.id, x, y]);

  const rotate = useTransform(x, [-300, 0, 300], [-8, 0, 8]);
  const approveOpacity = useTransform(x, [20, 60, SWIPE_THRESHOLD], [0, 0.6, 1]);
  const denyOpacity = useTransform(x, [-SWIPE_THRESHOLD, -60, -20], [1, 0.6, 0]);
  const discussOpacity = useTransform(y, [-SWIPE_THRESHOLD, -60, -20], [1, 0.6, 0]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    draggingRef.current = false;
    const absX = Math.abs(info.offset.x);
    const absY = Math.abs(info.offset.y);
    const velX = Math.abs(info.velocity.x);
    const velY = Math.abs(info.velocity.y);

    if (info.offset.y < -SWIPE_THRESHOLD || (info.offset.y < -60 && velY > VELOCITY_THRESHOLD)) {
      if (absY > absX) { onSwipe('discuss'); return; }
    }
    if (info.offset.x > SWIPE_THRESHOLD || (info.offset.x > 60 && velX > VELOCITY_THRESHOLD)) {
      onSwipe('approve'); return;
    }
    if (info.offset.x < -SWIPE_THRESHOLD || (info.offset.x < -60 && velX > VELOCITY_THRESHOLD)) {
      onSwipe('deny'); return;
    }
  }, [onSwipe]);

  const getExitAnim = (dir: SwipeAction) => {
    switch (dir) {
      case 'approve': return { x: 800, rotate: 15, opacity: 0 };
      case 'deny': return { x: -800, rotate: -15, opacity: 0 };
      case 'discuss': return { y: -500, opacity: 0 };
      default: return { opacity: 0, scale: 0.95 };
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Stack preview */}
      {next && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          pointerEvents: 'none', zIndex: 0,
        }}>
          <div style={{
            width: '85%', maxWidth: 680, height: '70%',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.04)',
            transform: 'scale(0.94) translateY(12px)',
            filter: 'blur(1px)',
          }} />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          drag
          dragSnapToOrigin
          dragElastic={0.6}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragStart={() => { draggingRef.current = true; }}
          onDragEnd={handleDragEnd}
          style={{
            x, y, rotate,
            width: '100%', height: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
            padding: '8px 12px',
            cursor: 'grab',
            zIndex: 1,
            position: 'relative',
          }}
          initial={{ scale: 0.96, opacity: 0, y: -40 }}
          animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
          exit={getExitAnim(exitDirection)}
          transition={
            exitDirection
              ? { type: 'spring', stiffness: 120, damping: 18, mass: 0.8 }
              : { type: 'spring', stiffness: 400, damping: 35 }
          }
        >
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'stretch', position: 'relative', overflow: 'auto' }}>
            {children}
          </div>

          {/* Approve stamp — centered, large, unmissable */}
          <motion.div style={{
            opacity: approveOpacity,
            position: 'absolute',
            inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', zIndex: 10,
          }}>
            <div style={{
              padding: '12px 40px',
              border: '4px solid #2d7a4f',
              borderRadius: 12,
              color: '#2d7a4f',
              fontSize: 42,
              fontWeight: 900,
              fontFamily: "'Bricolage Grotesque', sans-serif",
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              background: 'rgba(45,122,79,0.12)',
              backdropFilter: 'blur(6px)',
              transform: 'rotate(-12deg)',
              boxShadow: '0 0 60px rgba(45,122,79,0.15)',
            }}>Approved</div>
          </motion.div>

          {/* Deny stamp */}
          <motion.div style={{
            opacity: denyOpacity,
            position: 'absolute',
            inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', zIndex: 10,
          }}>
            <div style={{
              padding: '12px 40px',
              border: '4px solid #b53d2d',
              borderRadius: 12,
              color: '#b53d2d',
              fontSize: 42,
              fontWeight: 900,
              fontFamily: "'Bricolage Grotesque', sans-serif",
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              background: 'rgba(181,61,45,0.12)',
              backdropFilter: 'blur(6px)',
              transform: 'rotate(12deg)',
              boxShadow: '0 0 60px rgba(181,61,45,0.15)',
            }}>Denied</div>
          </motion.div>

          {/* Discuss stamp */}
          <motion.div style={{
            opacity: discussOpacity,
            position: 'absolute',
            inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', zIndex: 10,
          }}>
            <div style={{
              padding: '12px 40px',
              border: '4px solid #b5770d',
              borderRadius: 12,
              color: '#b5770d',
              fontSize: 42,
              fontWeight: 900,
              fontFamily: "'Bricolage Grotesque', sans-serif",
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              background: 'rgba(181,119,13,0.12)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 0 60px rgba(181,119,13,0.15)',
            }}>Discuss</div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
