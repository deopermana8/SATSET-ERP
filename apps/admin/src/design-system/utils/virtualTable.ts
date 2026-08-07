export type VirtualSlice = {
  start: number;
  end: number;
  offsetTop: number;
  offsetBottom: number;
};

export function createVirtualSlice(total: number, rowHeight: number, viewportHeight: number, scrollTop: number): VirtualSlice {
  const visible = Math.max(1, Math.ceil(viewportHeight / rowHeight));
  const overscan = 6;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(total, start + visible + overscan * 2);
  return {
    start,
    end,
    offsetTop: start * rowHeight,
    offsetBottom: Math.max(0, (total - end) * rowHeight),
  };
}
