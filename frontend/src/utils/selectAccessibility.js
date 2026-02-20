export const blurActiveElement = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const schedule = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame
    : (callback) => setTimeout(callback, 0);

  schedule(() => {
    const activeElement = document.activeElement;

    if (!(activeElement instanceof HTMLElement)) {
      return;
    }

    const isAriaHidden = activeElement.getAttribute('aria-hidden') === 'true';
    const isHiddenMuiSelectInput = activeElement.classList.contains('MuiSelect-nativeInput');

    if (isAriaHidden || isHiddenMuiSelectInput) {
      activeElement.blur();
    }
  });
};

export const selectA11yProps = {
  onClose: blurActiveElement,
  MenuProps: {
    disableAutoFocusItem: true,
  },
};
