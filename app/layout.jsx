export const metadata = {
  title: "NOONETECH MOBILE STORE",
  description: "Phones, laptops, tablets, and tech accessories.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
