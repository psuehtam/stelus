export const SITE = Object.freeze({
  whatsappNumber: "5541991089105",
  defaultMessage: "Olá! Gostaria de um orçamento.",
});

export const createWhatsAppUrl = (message = SITE.defaultMessage) => {
  const params = new URLSearchParams({
    phone: SITE.whatsappNumber,
    text: message,
  });
  return `https://api.whatsapp.com/send?${params.toString()}`;
};
