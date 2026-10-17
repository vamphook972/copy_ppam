export const maskEmail = (email: string): string => {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [name, domain] = parts;
  if (!name || !domain) return email;

  const maskedName =
    name.length <= 2 ? `${name[0] ?? "*"}***` : `${name[0]}***${name[name.length - 1]}`;
  return `${maskedName}@${domain}`;
};
