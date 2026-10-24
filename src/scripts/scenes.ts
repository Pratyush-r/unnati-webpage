// "Watch how" presentations for the activity scenes (src/components/illustrations/ActivityArt.astro).
// One keyframe track per moving part, all running for the scene's whole duration (offsets 0–1), so a
// part never has two competing animations. The first keyframe matches the SVG markup (start state);
// the last is the finished state, shown straight away under reduced motion.

export type Track = { p: string; frames: Keyframe[] };
export type Scene = { duration: number; tracks: Track[] };

const t = (x: number, y: number, r = 0) => `translate(${x}px,${y}px) rotate(${r}deg)`;
const op = (...pairs: [number, number][]): Keyframe[] => pairs.map(([offset, opacity]) => ({ offset, opacity }));

/** Shake a lifted box: small rotations between `from` and `to` (offsets), raised by `lift` px. */
function shake(from: number, to: number, before: Keyframe[], after: Keyframe[], dx = 0, lift = -24): Keyframe[] {
  const steps = 6;
  const out: Keyframe[] = [...before];
  for (let i = 0; i <= steps; i++) {
    const r = i === 0 || i === steps ? 0 : i % 2 ? -12 : 12;
    out.push({ offset: from + ((to - from) * i) / steps, transform: t(dx, lift, r) });
  }
  return [...out, ...after];
}

export const scenes: Record<string, Scene> = {
  'pouring-water': {
    duration: 5600,
    tracks: [
      {
        p: 'jug',
        frames: [
          { offset: 0, transform: t(0, 0) },
          { offset: 0.18, transform: t(50, -28) },
          { offset: 0.32, transform: t(50, -28, 42) },
          { offset: 0.7, transform: t(50, -28, 42) },
          { offset: 0.84, transform: t(50, -28) },
          { offset: 1, transform: t(0, 0) },
        ],
      },
      {
        p: 'stream',
        frames: [
          { offset: 0, opacity: 0, transform: 'scaleY(0)' },
          { offset: 0.31, opacity: 0, transform: 'scaleY(0)' },
          { offset: 0.37, opacity: 1, transform: 'scaleY(1)' },
          { offset: 0.66, opacity: 1, transform: 'scaleY(1)' },
          { offset: 0.71, opacity: 0, transform: 'scaleY(1)' },
          { offset: 1, opacity: 0, transform: 'scaleY(1)' },
        ],
      },
      {
        p: 'tw',
        frames: [
          { offset: 0, transform: 'scaleY(0)' },
          { offset: 0.36, transform: 'scaleY(0)' },
          { offset: 0.7, transform: 'scaleY(.72)' },
          { offset: 1, transform: 'scaleY(.72)' },
        ],
      },
    ],
  },

  'spooning-chana': {
    duration: 5400,
    tracks: [
      {
        p: 'spoon',
        frames: [
          { offset: 0, transform: t(0, 0) },
          { offset: 0.12, transform: t(0, 6) },
          { offset: 0.25, transform: t(0, -30) },
          { offset: 0.5, transform: t(120, -30) },
          { offset: 0.6, transform: t(120, -18, -40) },
          { offset: 0.72, transform: t(120, -18, -40) },
          { offset: 0.86, transform: t(60, -36) },
          { offset: 1, transform: t(0, 0) },
        ],
      },
      { p: 'sc', frames: op([0, 0], [0.14, 0], [0.2, 1], [0.62, 1], [0.66, 0], [1, 0]) },
      {
        p: 'pileL',
        frames: [
          { offset: 0, transform: 'scale(1)' },
          { offset: 0.16, transform: 'scale(1)' },
          { offset: 0.22, transform: 'scale(.86)' },
          { offset: 1, transform: 'scale(.86)' },
        ],
      },
      {
        p: 'pileR',
        frames: [
          { offset: 0, transform: 'scale(0)' },
          { offset: 0.61, transform: 'scale(0)' },
          { offset: 0.7, transform: 'scale(1)' },
          { offset: 1, transform: 'scale(1)' },
        ],
      },
    ],
  },

  'folding-napkins': {
    duration: 6000,
    tracks: [
      {
        p: 'ff',
        frames: [
          { offset: 0, transform: 'scaleY(1)' },
          { offset: 0.14, transform: 'scaleY(1)' },
          { offset: 0.3, transform: 'scaleY(0)' },
          { offset: 1, transform: 'scaleY(0)' },
        ],
      },
      ...['bfl', 'bfr'].map((p) => ({
        p,
        frames: [
          { offset: 0, transform: 'scaleY(0)' },
          { offset: 0.3, transform: 'scaleY(0)' },
          { offset: 0.45, transform: 'scaleY(1)' },
          { offset: 1, transform: 'scaleY(1)' },
        ],
      })),
      {
        p: 'tr',
        frames: [
          { offset: 0, transform: 'scaleX(1)' },
          { offset: 0.56, transform: 'scaleX(1)' },
          { offset: 0.68, transform: 'scaleX(0)' },
          { offset: 1, transform: 'scaleX(0)' },
        ],
      },
      {
        p: 'back2',
        frames: [
          { offset: 0, transform: 'scaleX(0)' },
          { offset: 0.68, transform: 'scaleX(0)' },
          { offset: 0.8, transform: 'scaleX(1)' },
          { offset: 1, transform: 'scaleX(1)' },
        ],
      },
      {
        p: 'handL',
        frames: [
          { offset: 0, transform: t(0, 0) },
          { offset: 0.12, transform: t(0, 0) },
          { offset: 0.45, transform: t(0, -80) },
          { offset: 0.56, transform: t(0, -80) },
          { offset: 0.9, transform: t(0, 0) },
          { offset: 1, transform: t(0, 0) },
        ],
      },
      {
        p: 'handR',
        frames: [
          { offset: 0, transform: t(0, 0) },
          { offset: 0.12, transform: t(0, 0) },
          { offset: 0.45, transform: t(0, -60) },
          { offset: 0.56, transform: t(0, -60) },
          { offset: 0.8, transform: t(-100, -60) },
          { offset: 1, transform: t(0, 0) },
        ],
      },
    ],
  },

  'slicing-banana': {
    duration: 6000,
    tracks: [
      {
        p: 'knife',
        frames: [
          { offset: 0, transform: t(0, -20) },
          { offset: 0.08, transform: t(0, -20) },
          { offset: 0.16, transform: t(0, 22) },
          { offset: 0.24, transform: t(0, -20) },
          { offset: 0.32, transform: t(-10, -20) },
          { offset: 0.4, transform: t(-10, 22) },
          { offset: 0.48, transform: t(-10, -20) },
          { offset: 0.56, transform: t(-20, -20) },
          { offset: 0.64, transform: t(-20, 22) },
          { offset: 0.72, transform: t(-20, -20) },
          { offset: 1, transform: t(0, -20) },
        ],
      },
      // Each slice slides clear after its cut, then turns to show its round face.
      ...[
        ['s1', 0.18, 36],
        ['s2', 0.42, 28],
        ['s3', 0.66, 20],
      ].flatMap(([p, at, dx]) => {
        const a = at as number;
        return [
          {
            p: p as string,
            frames: [
              { offset: 0, transform: t(0, 0) },
              { offset: a, transform: t(0, 0) },
              { offset: a + 0.1, transform: t(dx as number, 0) },
              { offset: 1, transform: t(dx as number, 0) },
            ],
          },
          { p: `${p}a`, frames: op([0, 1], [a + 0.06, 1], [a + 0.12, 0], [1, 0]) },
          { p: `${p}b`, frames: op([0, 0], [a + 0.06, 0], [a + 0.12, 1], [1, 1]) },
        ];
      }),
    ],
  },

  'sound-boxes': {
    duration: 6400,
    tracks: [
      {
        p: 'b2',
        frames: shake(
          0.16,
          0.36,
          [
            { offset: 0, transform: t(0, 0) },
            { offset: 0.06, transform: t(0, 0) },
          ],
          [
            { offset: 0.44, transform: t(0, 0) },
            { offset: 0.8, transform: t(0, 0) },
            { offset: 0.92, transform: t(30, 44) },
            { offset: 1, transform: t(30, 44) },
          ],
        ),
      },
      { p: 'h2', frames: op([0, 0], [0.04, 0], [0.08, 1], [0.44, 1], [0.48, 0], [0.78, 0], [0.8, 1], [0.92, 1], [0.96, 0], [1, 0]) },
      {
        p: 'b5',
        frames: shake(
          0.52,
          0.72,
          [
            { offset: 0, transform: t(0, 0) },
            { offset: 0.46, transform: t(0, 0) },
          ],
          [
            { offset: 0.76, transform: t(-20, -10) },
            { offset: 0.92, transform: t(-62, 44) },
            { offset: 1, transform: t(-62, 44) },
          ],
        ),
      },
      { p: 'h5', frames: op([0, 0], [0.44, 0], [0.48, 1], [0.92, 1], [0.96, 0], [1, 0]) },
      { p: 'a2', frames: op([0, 0], [0.18, 0], [0.22, 1], [0.34, 1], [0.38, 0], [1, 0]) },
      { p: 'a5', frames: op([0, 0], [0.54, 0], [0.58, 1], [0.7, 1], [0.74, 0], [1, 0]) },
    ],
  },

  'i-spy-sounds': {
    duration: 5200,
    tracks: [
      {
        p: 'bubble',
        frames: [
          { offset: 0, opacity: 0, transform: 'scale(0)' },
          { offset: 0.06, opacity: 0, transform: 'scale(0)' },
          { offset: 0.2, opacity: 1, transform: 'scale(1)' },
          { offset: 1, opacity: 1, transform: 'scale(1)' },
        ],
      },
      {
        p: 'hand',
        frames: [
          { offset: 0, transform: t(0, 70) },
          { offset: 0.34, transform: t(0, 70) },
          { offset: 0.56, transform: t(0, 0) },
          { offset: 0.64, transform: t(0, 0) },
          { offset: 0.86, transform: t(0, -34) },
          { offset: 1, transform: t(0, -34) },
        ],
      },
      {
        p: 'cup',
        frames: [
          { offset: 0, transform: t(0, 0) },
          { offset: 0.64, transform: t(0, 0) },
          { offset: 0.86, transform: t(0, -34) },
          { offset: 1, transform: t(0, -34) },
        ],
      },
    ],
  },

  'peg-counting': {
    duration: 6000,
    tracks: [
      ...[
        [122, -2, 0.06],
        [104, 4, 0.36],
        [86, -6, 0.66],
      ].flatMap(([dx, dy, at], i) => [
        {
          p: `peg${i + 1}`,
          frames: [
            { offset: 0, transform: t(dx, dy, 80) },
            { offset: at, transform: t(dx, dy, 80) },
            { offset: at + 0.12, transform: t(dx / 2, -44, 30) },
            { offset: at + 0.24, transform: t(0, 0) },
            { offset: 1, transform: t(0, 0) },
          ],
        },
        { p: `ph${i + 1}`, frames: op([0, 0], [at - 0.02, 0], [at + 0.02, 1], [at + 0.25, 1], [at + 0.28, 0], [1, 0]) },
        { p: `ring${i + 1}`, frames: op([0, 0], [at + 0.22, 0], [at + 0.27, 1], [1, 1]) },
      ]),
    ],
  },

  'sprouting-moong': {
    duration: 6000,
    tracks: [
      {
        p: 'halfL',
        frames: [
          { offset: 0, transform: 'rotate(0deg)' },
          { offset: 0.1, transform: 'rotate(0deg)' },
          { offset: 0.3, transform: 'rotate(-16deg)' },
          { offset: 1, transform: 'rotate(-16deg)' },
        ],
      },
      {
        p: 'halfR',
        frames: [
          { offset: 0, transform: 'rotate(0deg)' },
          { offset: 0.1, transform: 'rotate(0deg)' },
          { offset: 0.3, transform: 'rotate(16deg)' },
          { offset: 1, transform: 'rotate(16deg)' },
        ],
      },
      {
        p: 'root',
        frames: [
          { offset: 0, transform: 'scale(0)' },
          { offset: 0.26, transform: 'scale(0)' },
          { offset: 0.5, transform: 'scale(1)' },
          { offset: 1, transform: 'scale(1)' },
        ],
      },
      {
        p: 'shoot',
        frames: [
          { offset: 0, transform: 'scaleY(0)' },
          { offset: 0.48, transform: 'scaleY(0)' },
          { offset: 0.78, transform: 'scaleY(1)' },
          { offset: 1, transform: 'scaleY(1)' },
        ],
      },
      {
        p: 'leaves',
        frames: [
          { offset: 0, transform: 'scale(0)' },
          { offset: 0.74, transform: 'scale(0)' },
          { offset: 0.94, transform: 'scale(1)' },
          { offset: 1, transform: 'scale(1)' },
        ],
      },
    ],
  },
};

/** Write a keyframe's properties to inline style (start or finished state). */
function applyFrame(el: HTMLElement | SVGElement, frame: Keyframe): void {
  for (const [k, v] of Object.entries(frame)) {
    if (k === 'offset' || k === 'easing' || k === 'composite') continue;
    el.style.setProperty(k, String(v));
  }
}

function parts(root: Element, scene: Scene) {
  return scene.tracks
    .map((tr) => ({ tr, el: root.querySelector<SVGElement>(`[data-p="${tr.p}"]`) }))
    .filter((x): x is { tr: Track; el: SVGElement } => !!x.el);
}

export function showStart(root: Element, scene: Scene): void {
  for (const { tr, el } of parts(root, scene)) applyFrame(el, tr.frames[0]);
}

export function showEnd(root: Element, scene: Scene): void {
  for (const { tr, el } of parts(root, scene)) applyFrame(el, tr.frames[tr.frames.length - 1]);
}

/**
 * Play the presentation once. Resolves when it ends; the finished state is committed to inline
 * style and every animation cancelled, so nothing lingers or loops.
 */
export function play(root: Element, scene: Scene): { finished: Promise<void>; cancel: () => void } {
  showStart(root, scene);
  const anims = parts(root, scene).map(({ tr, el }) =>
    // Ease each segment (slow start, slow stop), like a hand moving deliberately; linear overall.
    el.animate(
      tr.frames.map((f) => ({ easing: 'cubic-bezier(.45,0,.35,1)', ...f })),
      { duration: scene.duration, easing: 'linear', fill: 'both', iterations: 1 },
    ),
  );
  let cancelled = false;
  const finished = Promise.all(anims.map((a) => a.finished.catch(() => undefined))).then(() => {
    if (cancelled) return;
    showEnd(root, scene);
    anims.forEach((a) => a.cancel());
  });
  return {
    finished,
    cancel: () => {
      cancelled = true;
      anims.forEach((a) => a.cancel());
    },
  };
}
