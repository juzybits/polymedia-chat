/// Copied from [1] and tweaked to avoid TypeScript validation errors.
/// [1] https://github.com/missive/emoji-mart/blob/main/packages/emoji-mart-react/react.js

import React, { useEffect, useRef } from 'react';
import { Picker } from 'emoji-mart';

export default function EmojiPicker(props: any) {
  const ref = useRef(null);
  const instance: any = useRef(null);

  if (instance.current) {
    instance.current.update(props);
  }

  useEffect(() => {
    instance.current = new Picker({ ...props, ref });

    return () => {
      instance.current = null;
    }
  }, [])

  return React.createElement('div', { ref });
}
