const isValidMails = (mail: string): boolean => {
  const emailPattern =
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/;

  // Split the input string by ' / ' and trim any extra spaces
  const emails: string[] = mail.split(' / ').map((email) => email.trim());

  // Check if every email in the array matches the pattern
  return emails.every((email) => emailPattern.test(email));
};

export default isValidMails;
