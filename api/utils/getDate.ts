export const getDate = () => {
  return new Date(
    new Date().getTime() + new Date().getTimezoneOffset() * 60000 + 3600000 * 8
  );
};
