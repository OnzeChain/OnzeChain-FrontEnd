// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useState } from 'react';

export default function useCopyClipboard(
  timeout = 500,
): [boolean, (toCopy: string) => void] {
  const [isCopied, setIsCopied] = useState(false);

  const staticCopy = useCallback((text) => {
    const didCopy = copy(text);
    setIsCopied(didCopy);
  }, []);

  useEffect(() => {
    if (isCopied) {
      const hide = setTimeout(() => {
        setIsCopied(false);
      }, timeout);

      return () => {
        clearTimeout(hide);
      };
    }
    return undefined;
  }, [isCopied, setIsCopied, timeout]);

  return [isCopied, staticCopy];
}
