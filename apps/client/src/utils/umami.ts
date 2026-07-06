export const trackUmamiPageview = (url: string): void => {
  window.umami?.track((props) => ({ ...props, url }));
};
