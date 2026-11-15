export const BRAND_LOGO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCZ1KfUlAEZ2KouPAYZUE9xiGFw72XhI5777kQ9ZGkhZ9kU8yCGFS68D3O9Y9YOvyAUlqgtGzWapyDVfXOvRa3lRSfkAWgT-Qjj4oBViPGQZf_StxKsibmjMr5zhk8XB5WCiiatZaM-pNZh5AgRmSJ3x4CxrN9XOWjLtk8E5Yiym7FwBCcmf6JHZm05-jrqpc29bCT-U6d8pBrqqNZU53b1r6NdIvDQOk0us1HGACE";

export const WHATSAPP_NUMBER = "919876543210";

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
