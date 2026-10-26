export const select = (selector, context = document) =>
  context.querySelector(selector);
export const selectAll = (selector, context = document) => [
  ...context.querySelectorAll(selector),
];

export const listen = (element, eventName, handler, options) => {
  element?.addEventListener(eventName, handler, options);
  return () => element?.removeEventListener(eventName, handler, options);
};

export const setHidden = (element, isHidden) => {
  if (element) element.hidden = isHidden;
};
