import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "精算家AI - 新一代人工智能代理记账助理",
  description: "财税有AI，专业更高效！全税种快速报税，全量发票一键获取，智能税表，财税AI智能体",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
