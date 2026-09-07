export const metadata = {
  title: "NOONETECH MOBILE STORE",
  description: "Phones, laptops, tablets, and tech accessories.",
  manifest: "/manifest.json",
  themeColor: "#1E1B8F",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NOONETECH",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
