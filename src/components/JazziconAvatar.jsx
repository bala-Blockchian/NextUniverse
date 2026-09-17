import { useEffect, useRef } from 'react';
import jazzicon from '@metamask/jazzicon';

// Deterministic identicon generated from an address seed (Jazzicon).
export default function JazziconAvatar({ address, diameter = 96 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!address) return;
    const node = ref.current;
    if (!node) return;

    node.innerHTML = '';
    const seed = parseInt(address.slice(2, 10), 16) || 1;
    const icon = jazzicon(diameter, seed);
    icon.classList.add('jazzicon-svg');
    node.appendChild(icon);

    return () => {
      node.innerHTML = '';
    };
  }, [address, diameter]);

  return (
    <div
      ref={ref}
      className="jazzicon-wrap"
      style={{ width: diameter, height: diameter }}
      aria-hidden="true"
    />
  );
}