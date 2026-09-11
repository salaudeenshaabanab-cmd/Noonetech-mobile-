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
  icons: {
    icon: "https://i.ibb.co/spZ35y4S/514-AA084-FDAE-423-F-9-AFE-532248-E27467.png",
    apple: "https://i.ibb.co/spZ35y4S/514-AA084-FDAE-423-F-9-AFE-532248-E27467.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
