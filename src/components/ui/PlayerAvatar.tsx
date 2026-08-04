import { useState } from 'react';
import clsx from 'clsx';
import { playerPhotoUrl } from '../../lib/fpl/constants';

export default function PlayerAvatar({
  code,
  name,
  size = 40,
  className,
}: {
  code: number;
  name: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (failed) {
    return (
      <div
        className={clsx('flex items-center justify-center rounded-full bg-white/10 text-white/70 font-semibold shrink-0', className)}
        style={{ width: size, height: size, fontSize: size * 0.36 }}
      >
        {initials || '?'}
      </div>
    );
  }

  return (
    <img
      src={playerPhotoUrl(code)}
      alt=""
      width={size}
      height={size}
      className={clsx('rounded-full object-cover bg-white/10 shrink-0', className)}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
